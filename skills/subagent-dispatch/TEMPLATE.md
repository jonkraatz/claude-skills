---
name: subagent-dispatch
description: Brief, dispatch, and verify parallel code-writing subagents safely. Use when dispatching 2+ subagents in parallel, rebasing a branch via worktree, orchestrating edits to a shared machine-generated file, or recovering from a crashed subagent task. Provides the pre-dispatch checklist, brief template, post-dispatch cleanup script, crash-recovery procedure, and shared-file conflict rules. Invoke before the first Agent call when isolation:"worktree" is required.
---

# Subagent Dispatch

Template for every parallel code-writing subagent. The orchestrator running this
process is assumed to be `{{MODEL_ORCHESTRATOR}}`; code-writing subagents are
`{{MODEL_CODE_WRITER}}`; read-only discovery/lookup subagents (file/symbol
triage before a brief is written) are `{{MODEL_LOOKUP}}`.

## Pre-dispatch checklist

- [ ] **Main checkout**: `git status` clean, OR dispatch uses `isolation: "worktree"` + brief forbids main-checkout writes.
- [ ] **File pinned**: Grep/Read'd exact file(s) + line range. Brief = absolute paths + line numbers. Never "find the file." For briefs asking whether a *field/symbol exists*: name all plausible homes explicitly (source dirs, committed data dirs, generated output) or instruct a repo-wide grep. A single-scope "does not exist" is provisional until a broader scope confirms.
- [ ] **Branch unique**: issue#/task-id + agentId or timestamp suffix (survives crash/retry).
- [ ] **Acceptance defined**: know the shell command(s) to run against the diff before spending {{MODEL_REVIEWER}} review tokens.
- [ ] **No local build by default — CI owns compile/verify**: if CI runs `{{BUILD_CMD}}` / `{{TEST_CMD}}` on every PR, briefs say "do not build locally." Orchestrator builds locally ONLY to reproduce a CI failure (see "Build verification").
- [ ] **Shared stateful resource?** If the work drives something only one process can safely touch at a time (a shared dev server, a shared staging DB, a device/simulator farm, a single booted emulator) — establish a lease protocol before dispatch (see "Shared-resource serialization"). Most code-writing dispatches don't need this; skip it when subagents only edit + test in isolation.

## Right-size before dispatch — split large work into issues

Task too big for one code-writer's context -> subagent dies mid-flight, loses uncommitted work + tokens. Very large task (many files / broad refactor / multi-stage feature) -> break into smaller tracker issues first (vertical slices), one subagent per issue.

Split signals: >handful files; spans multiple subsystems; sequential phases (schema→service→view→tests); scope too fuzzy for a tight pinned brief.

Before writing briefs for a fan-out, run a `{{MODEL_LOOKUP}}` discovery pass (read-only: find the files/symbols, don't edit) so every brief pins real paths + line numbers instead of telling a subagent to "find the file."

Each issue = independently-grabbable, independently-committable, survives a crash (retry). Bundle PRs when changes belong together rather than firing one PR per tiny issue.

## Under a fan-out loop: minimize PRs

A loop that fans out many subagents produces many PRs fast. Each PR push triggers a full CI run — bundle related changes (same area/files/coupled) into one PR rather than burning a CI run per tiny diff.

Not over-aggressive: only combine work that belongs together. Unrelated changes stay on separate branches. Test: would a reviewer expect these in one PR? Yes -> bundle. No -> separate.

## Caveman mode for subagents

**Every brief MUST tell the subagent to invoke the `caveman` skill at start.** Cuts subagent output ~75%, no accuracy loss, compresses reports back to the orchestrator. Exception: human-facing artifacts (release notes, PR copy for external consumption). Code/build output/reports stay precise.

Brief line:

> **First action: invoke `caveman` skill. Compressed prose for all reports/narration/commits. No articles/filler. Technical precision required.**

## Brief template

```
TASK: Fix/build <task-id> — <one-line summary>.

CAVEMAN: Invoke `caveman` skill first. Compressed prose only.

ORIENT: Use this repo's own search tooling first (index/LSP/MCP search server if one
is configured) for symbol/file triage and blast-radius before editing. Fall back to
Grep for raw-string verification. Verify if a tool's answer looks stale or low-confidence.

CONTEXT:
- Location: <absolute-path>:<line-start>-<line-end>
- Root cause / goal: <brief>
- Reference issue body: <quote>

WORKTREE RULES (CRITICAL):
- Dispatched with isolation: "worktree". CWD = worktree root.
- ALL Read/Edit/Write paths begin with $CWD prefix. Absolute paths into the user's
  main checkout write to the WRONG place, silently lost. Unsure -> `pwd && git rev-parse --show-toplevel`.
- Do NOT stash. Do NOT touch the main checkout.

BRANCH:
- Fresh from {{BASE_BRANCH}}: `git checkout -b <type>/<task-id>-<unique-suffix> {{BASE_BRANCH}}`
- Exists (crashed prior run) -> delete first: `git branch -D <branch> 2>/dev/null`

BUILD/CI GATE (CRITICAL):
- You do NOT build. Finish edits, run `{{TEST_CMD}}` and `{{LINT_CMD}}`, commit
  incrementally, push, open PR. CI runs `{{BUILD_CMD}}`. CI red -> orchestrator
  sends you the error to fix (fix in YOUR worktree, push, do not build locally).
- EXCEPTION (brief explicitly names a shared stateful resource): SendMessage
  orchestrator "REQUEST LEASE — agent <id>", BLOCK until "LEASE GRANTED". ≤1
  resource-driver at a time (see "Shared-resource serialization").
- Resource step done -> emit own line: "RESOURCE COMPLETE — agent <id>, lease released".

STEPS:
1. <concrete step>
N. Commit (conventional, references <task-id>).
N+1. Push `-u origin <branch>`.
N+2. Open PR referencing <task-id>, brief description.

ACCEPTANCE (orchestrator verifies before {{MODEL_REVIEWER}} review):
- Diff file list includes <expected-files>
- Diff contains <expected-symbol-or-pattern>
- <feature-specific check>

CONSTRAINTS:
- <language/runtime version, framework constraints>.
- Don't touch files outside scope.
- Tool error -> retry ONCE, then stop + report. Don't spin.

REPORT BACK:
- PR URL
- Exact lines changed (file + line numbers)
- Branch confirm (`git branch --show-current`)
```

## Build verification = CI (don't pre-build locally by default)

If CI compiles/builds every PR and is required before merge, a non-building PR can't merge anyway — local pre-build duplicates that compute. So:

- **Default: subagents don't build, orchestrator doesn't pre-build.** Subagents edit → test (`{{TEST_CMD}}`) → commit → push → PR. CI builds (`{{BUILD_CMD}}`).
- **Build locally ONLY to reproduce a CI failure.** CI red -> orchestrator builds that one branch, gets file:line, dispatches the fix to the owning agent. Building before CI speaks wastes local + CI compute.
- **Tests are the exception if CI doesn't run them** — keep logic coverage local (pre-push smoke + test-before-PR). Otherwise let CI run `{{TEST_CMD}}` too.

## Warm build-verifier (for reproducing a CI failure)

When the build is expensive (minutes, not seconds), keep ONE persistent warm worktree for repro instead of cold-building per agent:

```bash
git worktree add <verifier-path> origin/{{BASE_BRANCH}} --detach
# copy any untracked local config the build needs (env files, secrets, local overrides)
```

- Keep this OUTSIDE `.claude/worktrees/` — janitor-immune, build cache persists. Never `git worktree remove` it.

Verify loop:

```bash
cd <verifier-path>
git fetch origin <branch>
git checkout --detach origin/<branch>   # DETACHED — branch names stay pinned to agents' worktrees
{{BUILD_CMD}}
{{TEST_CMD}}   # scope to the failing suite if the tool supports it
```

- Failure -> SendMessage the owning agent the verbatim error + file:line; it fixes + pushes in ITS worktree; re-fetch + rebuild here (warm, fast).
- One verifier checkout, one orchestrator -> inherently serialized. Never run two build invocations concurrently in the same checkout (build-cache/db collisions).
- Post results as a PR comment.

## Shared-resource serialization (one driver at a time)

Only needed when subagents must drive something that isn't isolated per-worktree: a shared dev server, a shared staging DB, a single booted emulator/simulator, a device farm slot. Concurrent drivers corrupt runs -> false reds. **≤1 agent drives the resource at any instant — rest queue.**

**Step 0 — consent.** Before dispatching any resource-driving subagent, ask the user "OK for subagents to drive <resource> this session?" No -> briefs stop before that step, report; orchestrator runs that phase serially later.

**Lease protocol (orchestrator owns the lease):**
- Code-edit phase parallel, no lease needed. Only the shared-resource step is gated.
- Acquire before touching the resource. Two grant styles:
  1. *Preferred — serialized phase.* Subagents edit + commit in parallel, STOP + report "ready". Orchestrator drives resource verification one branch at a time.
  2. *Lease-by-message.* A long-running subagent that must drive the resource mid-task -> SendMessage "REQUEST LEASE — agent <id>", blocks until "LEASE GRANTED". One at a time, queue the rest.
- Release + notify: resource work done -> emit own line "RESOURCE COMPLETE — agent <id>, lease released". Orchestrator frees the lease, grants next "LEASE GRANTED, proceed". Crashed lease-holder -> orchestrator reclaims (treat as released).

Put lease lines verbatim in every resource-touching brief.

## Post-dispatch (orchestrator, after subagent done)

1. **Acceptance check first.** Run the ACCEPTANCE commands from the brief. Fail -> fix subagent BEFORE spending review tokens.
2. **Independent review** (`subagent_type: "code-reviewer"`, `model: "{{MODEL_REVIEWER}}"`). Must differ from `{{MODEL_CODE_WRITER}}` — independence matters.
3. **Address findings** in-branch.
4. **CI green** before merge.
5. **Merge** (`{{MERGE_STYLE}}`).
6. **MANDATORY post-merge cleanup** — immediately after merge success, same turn:
   ```bash
   # Worktree path tied to <branch>. substr keeps space-containing paths intact.
   wt=$(git worktree list --porcelain | awk -v b="refs/heads/<branch>" '
     /^worktree / { p = substr($0, 10) }
     $0 == ("branch " b) { print p; exit }')
   # SAFETY: remove only if (a) under .claude/worktrees/ AND
   # (b) basename is orchestrator-managed (`.claude-agent-managed` marker OR
   # `agent-<12+ hex>`).
   safe_to_remove=0
   case "$wt" in
     */.claude/worktrees/*)
       base=$(basename "$wt")
       if [ -f "$wt/.claude-agent-managed" ]; then
         safe_to_remove=1
       elif [ -z "${base#agent-}" ]; then
         :  # bare "agent-" -- skip
       else
         suffix="${base#agent-}"
         if printf '%s' "$suffix" | grep -qE '^[a-f0-9]{12,}$'; then
           safe_to_remove=1
         fi
       fi
       ;;
   esac
   if [ "$safe_to_remove" = "1" ]; then
     git worktree remove --force --force "$wt"
   fi
   # Branch deletion independent of worktree removal (git refuses if checked out in main).
   git branch -D <branch> 2>/dev/null
   ```
   Don't defer — deferred cleanup never happens (stale worktrees accumulate silently). A SessionStart janitor hook, if configured, is a safety net, not a substitute.

   **Manual worktree creation drops a sentinel.** `git worktree add` not run via `isolation: "worktree"` -> `touch <wt>/.claude-agent-managed` immediately. Sentinel = durable disposable signal; basename pattern is only a fallback.

## Crash recovery

Task notification `status: killed` / parse-error:
- `git branch -D <expected-branch> 2>/dev/null`
- `git worktree list` -> remove orphans
- Brief the retry with "prior attempt crashed; delete stale branch first"

## Special case: shared machine-generated files

Any single large, machine-generated or auto-serialized file touched by most PRs (a lockfile, a generated schema/IDE-project file, a monolithic config) is the #1 source of rebase pain when subagents run in parallel. Rules when it must be touched directly:

1. **Serialize rebases that touch it.** Two open PRs touch it -> rebase one at a time. Never run two rebases against it in parallel.
2. **Never hand-merge its conflict markers.** Prefer regenerating over merging: take one side, then re-run whatever generates the file, rather than manually resolving `<<<<<<<` markers in generated content.
   ```
   git checkout --theirs <shared-file>
   # re-apply this PR's intent via the file's generator/tool, not manual edits
   <repo's validator for this file, if one exists>   # exit 0 before push
   ```
3. **Acceptance includes the validator** for that file (if the repo has one), then the normal build/test gate.
4. **Pin exact coordinates in the brief** (section/key/UUID/group name) — multiple similarly-named entries exist in most such files; never guess which one.
5. **After merge, sanity-check `{{BASE_BRANCH}}`'s copy of the file** before starting the next PR that touches it; broken -> fix the base branch first.
6. **≤1 PR touching this file in flight when avoidable.** Freely overlap PRs that don't touch it; queue the ones that do.

## What NOT to do

- Rebase into the user's main checkout with live WIP
- "Find the file" instead of pinning paths
- Skip the acceptance check (review tokens cost far more than the check)
- Reuse a branch name across runs
- Let subagents stash
- Dispatch a code-writing subagent without `isolation: "worktree"`
- Two subagents driving the same shared resource at once (false reds / corrupted runs)
- Dispatch resource-driving subagents without asking the user for consent first
- Pre-build branches locally before CI has spoken (wastes compute)
