---
name: install-engineering-loops
description: Tune the engineering-loops bundle (feature, fix, triage, to-prd, to-issues, grill-with-docs, subagent-dispatch, simplify) to THIS repo. Detects package scripts, issue tracker, domain docs, and available MCP/CLI tooling; grills the maintainer on models, adversarial-review conduct, PR/issue workflow, and codebase specifics; then rewrites each skill's SKILL.md from its TEMPLATE.md, writes docs/agents/*.md, and saves a regeneration manifest. Run once after copying the skills in, and again after pulling upstream updates. Invoke as `/install-engineering-loops`.
disable-model-invocation: true
---

# `/install-engineering-loops` — adapt the bundle to this repo

The bundle ships **generic**. This skill tunes it: it fills every
`{{TOKEN}}`/`<!-- SLOT -->` in each skill's `TEMPLATE.md`, rewrites the runnable
`SKILL.md`, and records every answer so a later update regenerates without
re-interviewing you. Read `docs/INSTALL-CONTRACT.md` (in this bundle) first — it
defines the tokens, slots, and the manifest schema you are producing.

This is a prompt-driven skill: **detect → present → grill → confirm → write.**
Never guess a value you can detect or must ask about. Ask decisions **one at a
time**, each with a detected default and a short explainer, in the manner of
`/grill-me`.

## Frozen — never up for tuning

The process spine is not tunable. Do not let any answer weaken it:
plan-only `/feature` + human sign-off gate; `/fix` =
triage→reproduce→root-cause→smallest-fix→prove→independent-review→merge;
builder ≠ approver (**reviewer model must differ from code-writer model**);
two-attempt repro cap; never report an unapproved/unmerged run as done.

## Step 0 — Re-run detection

If `.claude/skills-install.json` already exists, this is an **update**, not a
first install. Load it, treat its values as the current answers, and only grill
for questions whose token/slot is **new** in the templates or that the user asks
to change. Then re-render every skill. (This is how upstream template updates
land without losing the tuning.)

## Step 1 — Detect

Explore the repo; read what exists, assume nothing:

- **Package scripts / commands** — `package.json` scripts, `Makefile`,
  `pyproject.toml`, `Cargo.toml`, `justfile`, CI workflow files. Propose
  `test` / `build` / `lint` / `typecheck` / `run` from what you find.
- **VCS** — `git remote -v`, default branch (`git symbolic-ref
  refs/remotes/origin/HEAD`), `.github/CODEOWNERS`.
- **Tracker** — GitHub/GitLab remote? Is a tracker MCP connected (GitHub,
  Atlassian/JIRA, Linear)? Is a CLI present + authed (`gh`, `glab`, `jira`,
  `acli`)? Any `.scratch/` (local-markdown convention)?
- **Domain docs** — `CONTEXT.md`, `CONTEXT-MAP.md`, `docs/adr/`,
  `docs/architecture/`, existing `docs/agents/`.
- **Runtime for rendering** — is `bun` or `node` available (to run
  `scripts/render.mjs`)? If not, you will render by hand.

Summarize what you found and what's missing before grilling.

## Step 2 — Grill the tunable axes (one at a time)

For each, show the detected default and let the user override. Group order:

1. **Model matrix** — orchestrator (default Opus), code-writer (Sonnet),
   lookup/search (Haiku), reviewer (Opus). **Enforce reviewer ≠ code-writer.**
   Only in-harness Anthropic models (Opus/Sonnet/Haiku); no external-model MCPs
   for review.
2. **Commands** — confirm/adjust `test` / `build` / `lint` / `typecheck` / `run`
   (blank = the skill omits that step).
3. **VCS + merge** — base branch, `fix/` and `feat/` prefixes, merge style
   (squash/merge/rebase).
4. **Review knobs** — severity threshold (default medium), iteration cap
   (default 5), trivial-fast-path on/off.
5. **Tracker backend** — pick the resolved means: **MCP preferred**, CLI
   fallback, else local-markdown. Present the best fit you detected and confirm.
   Capture `kind`, `backend`, and `projectKey` (JIRA/Linear).
6. **Tagging taxonomy** — map canonical triage roles → this repo's labels/
   statuses, plus type / priority / area. For JIRA: issue-type + status
   transitions + priority field. **Verify each tag/transition exists; if it
   doesn't, ask — never invent one.**
7. **Issue lifecycle** — phase→transition map (start→in-progress, draft-PR→
   in-review, merged→done), PR↔issue link syntax, status-comment-back on/off.
8. **Filing template** — per-tracker new-issue template + required fields.
9. **PR conventions** — PR timing (draft-early / review-first / pr-first), title
   convention, body checklist on/off, on-ready reviewer request
   (codeowners / list / none).
10. **Domain specifics (prose slots)** — with the user, write the
    `domain-docs`, `domain-constraints`, `test-strategy`, `data-invariants`
    prose for `feature`/`fix`. These are the repo's ADR-equivalents and how to
    reproduce/prove per defect class. If the repo has no domain docs, say so in
    `domain-docs` and grill against the code.

## Step 3 — Build the manifest

Assemble `.claude/skills-install.json` exactly per the schema in
`docs/INSTALL-CONTRACT.md`. Stamp `installedAt` with the real current time
(shell `date -u +%FT%TZ`) and `templateVersions` with each template's current
git sha or version. Show the manifest to the user and let them edit before
writing.

## Step 4 — Render every skill

For each skill dir that has a `TEMPLATE.md`:

- If `bun`/`node` is available:
  `node scripts/render.mjs <skill> skills/<skill>/TEMPLATE.md .claude/skills-install.json skills/<skill>/SKILL.md`
- Otherwise, do the substitution by hand exactly as `render.mjs` would: fill
  each `<!-- SLOT: name -->` from `manifest.slots["<skill>/<name>"]` (keeping the
  in-template default if unset), then replace every `{{TOKEN}}` from the manifest.
  Strip slot markers from the output.

Verify no `{{` and no `SLOT:` remain in any rendered `SKILL.md`, and that the
reviewer model differs from the code-writer model. `caveman` has no `TEMPLATE.md`
— ship it untouched.

## Step 5 — Write the human-readable record

Write `docs/agents/{issue-tracker,triage-labels,domain,models,review,workflow}.md`
from the manifest, and add or update an `## Agent skills` block in `CLAUDE.md`
(preferred if it exists) or `AGENTS.md` linking to them. If neither file exists,
ask which to create — don't pick for the user. Never create one when the other
exists; update an existing `## Agent skills` block in place.

## Step 6 — Report + commit

Report: which skills were rendered, the resolved model matrix, tracker backend,
and PR/lifecycle policy, plus the manifest path. Offer to commit
(`.claude/skills/**`, `.claude/skills-install.json`, `docs/agents/**`, the
edited `CLAUDE.md`/`AGENTS.md`) on a branch — never on a protected branch. This
skill **never enables a schedule**.

## Terminal states

- **Installed** — manifest written, every skill rendered clean, record written.
- **Updated** — re-render after an upstream pull; only new questions were asked.
- **Blocked** — a required decision unresolved (e.g. no tracker means available
  and the user wants tracker automation) → stop and say what's needed.
