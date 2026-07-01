---
name: fix
description: End-to-end loop that turns an issue, bug report, failing behavior, or vague complaint into a merge-ready PR — triage → reproduce → root-cause → smallest fix → prove → open PR → independent adversarial review → fix findings → repeat until the bar is met → merge. Use when asked to "fix issue NNNN", take a bug to a PR, or drive a defect to review-ready with proof. Invoke as `/fix <issue#-or-description>`. Distinct from `/feature` (net-new design → sliced plan).
---

# `/fix` — defect → reproduced fix → independently-reviewed PR

Bounded phases, each with its own stop condition.

> **Independence boundary (do not violate):** Phase A's "tests/build pass" is the
> *correctness* signal. Phase B's reviewer approval is the *review* signal. The
> builder must not be the approver — the reviewer runs on **Opus**,
> a different model than the code-writer (**Sonnet**). Never let
> Phase A green double as Phase B approval, and never report an errored, stalled,
> or iteration-capped run as approved.

## Trigger

`/fix <issue#>` or `/fix <description>`. An issue reference, bug report, failing
behavior, or loosely-worded complaint.

## Phase T — Triage gate (do this first)

Before branching or touching code, run **`/triage`** to classify the issue and
decide who acts. `/triage` owns the state machine and the canonical→repo tag
mapping — don't reimplement it, invoke it and read the resulting **state role**:

- **`ready-for-agent`** — fully specified, agent-actionable → **proceed**.
- **`ready-for-human`** — needs human judgment / manual verification / external
  access → **stop** (handoff, not failure).
- **`needs-info`** — waiting on the reporter → **stop**, state what's missing.
- **`needs-triage`** — not yet evaluable → **stop**, flag for the maintainer.
- **`wontfix`** — close per `/triage`, **stop**.

Only **`ready-for-agent`** continues. If the issue is really net-new design
scope, suggest **`/feature`** instead.

**Filing (free-text invocation).** If `/fix` was invoked on a description with no
issue yet, file one first so the work is tracked:

Draft the issue from a standard template (title + a "what's wrong / expected vs
actual" body + the default type tag), show it, and file on confirmation via the
resolved tracker. For trackers with required fields (e.g. JIRA project /
issue-type / priority), ask for any missing required field — never guess it.

When you start work, move the issue to its in-progress state and link the branch:

Transition the issue to **github**'s in-progress state at Phase A
start, to its in-review state when the draft PR opens, and to its done state on
merge. Link the PR to the issue (`github`: use the configured link
syntax). Verify a transition exists before applying it; if it doesn't, skip and
note it. Status-comment-back on PR changes is **on**.

## Branch first

Only after **Phase T = `ready-for-agent`**. Code changes never land on
`main`. Before any edit: `git checkout -b fix/<issue#>-<slug>`
from `main` (or, in a background job, `EnterWorktree`). Confirm the
branch topic matches the defect.

---

## Phase A — build a reproduced, proven fix

1. **Establish expected vs. actual.** Read the issue. State precisely what should
   happen vs. what does.
2. **Reproduce in the smallest representative environment.**

   For **logic / data / engine defects**, write or run a failing test with
   `npm test` (or the smallest standalone repro if no harness fits). For
   **UI / rendering defects**, reproduce in the running app via `npm run dev` and
   capture a before screenshot. Prove the failure before you touch the fix.

3. **Two-attempt cap.** If you cannot reproduce after **two serious attempts**,
   stop and say so explicitly — do not fix blind. State what you tried. This is a
   **blocked** terminal state, not success.
4. **Prove the root cause** with supporting evidence (failing test, console
   output, screenshot), not a guess.
5. **Smallest credible fix.** No unrelated refactors, cleanup, or drive-by
   changes (branch-scope rule). If you spot adjacent rot, file an issue; don't
   fix it here.

   Respect the repo's architecture and conventions. Keep source-of-truth data in
   its canonical location, not hard-coded into consumers. No project-specific
   constraints beyond this have been configured.

6. **Re-run the reproduction + relevant regression.** The repro must now pass;
   `npm run build` must stay green. Run `npm test` (and `npm run lint` when
   configured) and verify a real result, never a bare "succeeded".

   No project-specific data invariants configured. If this repo has schema/data
   integrity checks, re-check them here before declaring green.

7. **Open the PR** against `main` per the PR-timing policy
   (**draft-early**):
   - `draft-early` — open a **draft** PR now (CI runs, diff is reviewable), and
     promote it to ready only after Phase B approves.
   - `review-first` — do **not** open a PR yet; Phase B reviews the local branch
     diff, and the PR opens (already approved) at Phase C.
   - `pr-first` — open a normal PR now.

   Title per `conventional-commit`. Body: cause · changed files · before/after
   proof matched to the failure type (test/console for logic, screenshot for UI) ·
   risks · a link that closes the issue on merge. Test-plan checklist:
   **on**.

**Phase A stop:** repro fails before the fix, passes after, build/regression
green, PR opened/deferred per policy. → Phase B. Or **blocked** (can't
reproduce) → hand back.

---

## Phase B — independent adversarial review

Reviewer: a **`code-reviewer`** subagent on **Opus** (a different
model than the code-writer, for a true independent check). Settings: severity
threshold **medium**, iteration cap
**5**.

Loop, keeping branch / PR / findings / verdict / iteration state resumable:

1. Ask the reviewer for an **adversarial review** of the diff (read-only review).
2. Fix every finding **at or above** the threshold severity. The threshold is a
   *ceiling for what must be fixed*, not a floor for what to inspect — read
   everything, fix the serious ones.
3. Re-run the Phase A checks (`npm run build` + `npm test` stay green).
4. Re-review. Repeat.

**Phase B stop (name the terminal state honestly):**
- **Approved** — reviewer approves, or only findings you explicitly accepted remain.
- **Stalled** — no measurable progress between rounds → hand back with open findings.
- **Exhausted** — iteration cap hit → hand back, **not** approved.
- **Errored** — reviewer/build failure → report as errored, **not** approved.

## The bar (what "ready" means here)

A PR is merge-ready when it clears the real gate: **`npm run build` green** +
**`npm test` green** + any **required tracker/CI checks** passing + Phase B
**Approved**.

---

## Phase C — merge once green (gated)

Only enter Phase C when **Phase B = Approved**. Never auto-merge a non-approved PR.

1. If PR timing was `review-first`, open the (already-approved) PR now. If
   `draft-early`, promote draft → ready. On promotion, request human reviewers
   per policy (**codeowners**) — the internal review always precedes
   this; human review is additive.
2. **Confirm checks are green.** Every *required* check passing, not pending or
   failing. Confirm no merge conflicts.
3. **Merge** using `squash`. Prefer letting the tracker gate the merge
   on checks where supported (e.g. `gh pr merge --auto --squash`).
4. **Post-merge cleanup:** sync `main`, delete the branch (and remove
   the worktree if one was used). Transition the issue to done. Don't leave the
   merged branch lingering.

**Phase C stop:** PR merged + `main` synced + branch deleted → **Done**.
If a required check **fails**, do not merge — return to Phase A with the failure
as the new defect. This skill merges PRs but **never enables a schedule**.

## Trivial-fix fast path

Trivial-fast-path is **on**. When on: for a one-line typo,
rename, comment, or single data-string correction with no behavioral risk, skip
Phase B (don't burn review rounds on a rename) — Phase A + `npm run build` green
is enough. State that you took the fast path and why. When off, every fix goes
through Phase B.

## Subagents — who to dispatch when

Default code-writing to **Sonnet** subagents; lookup/search to
**Haiku**; the reviewer runs on **Opus**. Tell every
subagent to invoke the **`caveman`** skill first. Parallel code-writers each get
`isolation: "worktree"` (see `subagent-dispatch`).

**Locate & diagnose (Phase A — get the conclusion, not a file dump):**
- **`Explore`** — the default for "where/how is X wired". Read-only fan-out to
  find where the bug lives and map the subsystem before touching anything.
- **`general-purpose`** — broader multi-step search when the target is unknown.

**Implement & keep the build green (Phase A):**
- **`tdd-guide`** — write the failing reproduction test first, then the minimal fix.
- **`build-error-resolver`** — when the fix breaks the build or types; minimal-diff
  to green, no architectural edits.

**Review (Phase B):**
- **`code-reviewer`** on **Opus** — the independent reviewer.
- **`security-reviewer`** — dispatch whenever the fix touches parsing of untrusted
  input or other external data.

**Not used by `/fix`:** `refactor-cleaner` & `code-simplifier` (unrelated cleanup
is banned in a fix — use `/simplify` at merge-time), `doc-updater` (doc-only
work), and the generic `claude` catch-all.

## Finish

If Phase T did not yield `ready-for-agent`, report the **triage outcome** (the
tag applied + why) and stop — a clean terminal state, not a failure.

Otherwise report: cause · changed files · before/after proof · risks · PR link ·
Phase B verdict + any accepted/remaining findings · **Phase C merge state**
(merged + `main` synced, or auto-merge armed and waiting on checks, or
held because a check failed). If blocked/stalled/exhausted/errored, say which —
never dress a non-approval or an unmerged PR up as done.
