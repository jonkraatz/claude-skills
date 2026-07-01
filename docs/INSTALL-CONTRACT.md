# Install contract

This is the single source of truth for how the bundle is tuned to a repo. Every
`TEMPLATE.md`, every `slots.md`, and the `install-engineering-loops` skill obey
it. If you are a subagent generalizing a skill, follow this file exactly so the
whole bundle stays consistent.

## The three artifacts

1. **`TEMPLATE.md`** (ships in the repo, pristine, generic) — the un-tuned skill
   body with `{{TOKENS}}` and `<!-- SLOT -->` regions. Never edited per-repo.
2. **`SKILL.md`** (generated into the consuming repo) — `TEMPLATE.md` with every
   token substituted and every slot filled. This is what actually runs. It is
   self-contained: a reader never needs to consult config at runtime.
3. **`.claude/skills-install.json`** (the manifest, in the consuming repo) — the
   machine-readable record of every answer. It is the source of truth for
   **re-generation**: `fresh TEMPLATE + manifest → SKILL.md`.

A human-readable mirror is also written under `docs/agents/*.md` (see below), so
a person can audit the tuning without reading JSON.

## Slot conventions

Two kinds of tunable spot, and only two:

### Scalar tokens — `{{TOKEN}}`

A single value substituted mechanically from the manifest. Re-generation of a
scalar is a pure string replace; no grilling needed once the manifest has it.
Tokens appear inline, e.g. `` Run `{{TEST_CMD}}`. ``

### Prose slots — `<!-- SLOT: name -->` … `<!-- /SLOT -->`

A block of guidance the install grill writes (a paragraph, a list, a small
table). The region always ships with a **generic default** between the markers
so an un-tuned template still reads sensibly. On re-generation, an unchanged
slot keeps its manifest-stored prose; only a **new** slot (added by an upstream
template update) is re-grilled.

Rules:
- Never nest slots.
- Slot `name` is kebab-case and unique within a file.
- The manifest stores the filled prose keyed by `<skill>/<slot-name>`.

## The scalar token registry

Defaults are generic (Node/npm, GitHub, `main`). The install grill overrides
them per repo.

| Token | Default | Meaning |
| --- | --- | --- |
| `{{MODEL_ORCHESTRATOR}}` | `Opus` | Main-loop / orchestrator model. |
| `{{MODEL_CODE_WRITER}}` | `Sonnet` | Code-writing subagents. |
| `{{MODEL_LOOKUP}}` | `Haiku` | Read-only search / lookup subagents. |
| `{{MODEL_REVIEWER}}` | `Opus` | Adversarial reviewer. **Invariant: ≠ `MODEL_CODE_WRITER`.** |
| `{{TEST_CMD}}` | `npm test` | Runs the test suite. |
| `{{BUILD_CMD}}` | `npm run build` | Builds / the always-available green gate. |
| `{{LINT_CMD}}` | `npm run lint` | Lint (empty string ⇒ skill omits the step). |
| `{{TYPECHECK_CMD}}` | `` (none) | Type-check, if separate from build. |
| `{{RUN_CMD}}` | `npm run dev` | Boots the app for manual/UI repro. |
| `{{BASE_BRANCH}}` | `main` | Branch PRs target and branches fork from. |
| `{{BRANCH_PREFIX_FIX}}` | `fix/` | Branch prefix for `/fix`. |
| `{{BRANCH_PREFIX_FEATURE}}` | `feat/` | Branch prefix for `/feature`. |
| `{{MERGE_STYLE}}` | `squash` | `squash` \| `merge` \| `rebase`. |
| `{{REVIEW_SEVERITY_THRESHOLD}}` | `medium` | Fix findings at/above this severity. |
| `{{REVIEW_MAX_ITER}}` | `5` | Review↔fix iteration cap. |
| `{{TRIVIAL_FAST_PATH}}` | `on` | `on` ⇒ trivial fixes skip the review phase. |
| `{{TRACKER_KIND}}` | `github` | `github` \| `gitlab` \| `jira` \| `linear` \| `local-md` \| `other`. |
| `{{TRACKER_BACKEND}}` | `gh-cli` | Resolved means: `*-mcp` preferred, `*-cli` fallback, `local-md`. |
| `{{PROJECT_KEY}}` | `` (none) | JIRA/Linear project key, if applicable. |
| `{{PR_TIMING}}` | `draft-early` | `draft-early` \| `review-first` \| `pr-first`. |
| `{{PR_TITLE_CONVENTION}}` | `conventional-commit` | How PR titles are formatted. |
| `{{PR_CHECKLIST}}` | `on` | Include a test-plan checklist in the PR body. |
| `{{ONREADY_REVIEWERS}}` | `codeowners` | `codeowners` \| `<list>` \| `none`. |
| `{{STATUS_COMMENT_BACK}}` | `on` | Comment status back to the issue on PR changes. |

## The prose slot registry

These slots appear (by convention) in the skills noted. A skill's own
`slots.md` is authoritative for which it actually uses.

| Slot | Used by | Content |
| --- | --- | --- |
| `domain-docs` | feature, fix, triage, grill-with-docs | Where `CONTEXT.md`/ADRs live + consumer rules, or "none — no domain docs". |
| `domain-constraints` | feature, fix | Project invariants the loop must honor (the repo's ADR-equivalents). Default: none beyond the frozen spine. |
| `test-strategy` | fix | How to reproduce/prove per defect class (logic vs UI/browser). Default: logic ⇒ failing test; UI ⇒ run + screenshot. |
| `data-invariants` | fix, feature | Project-specific gates to re-check before green, or "none". |
| `tag-taxonomy` | triage, to-issues, fix, feature | Canonical role → repo label/status map, plus type/priority/area. Mirrors `manifest.tags`. |
| `lifecycle-transitions` | fix | Phase→transition map + link syntax + comment-back policy. Mirrors `manifest.lifecycle`. |
| `filing-template` | fix, feature, triage, to-issues | New-issue template for the resolved tracker. Mirrors `manifest.filing`. |
| `pr-template` | fix | PR title convention + body sections + checklist. Mirrors `manifest.pr`. |

## Manifest schema (`.claude/skills-install.json`)

```json
{
  "installContractVersion": 1,
  "installedAt": "<ISO-8601>",
  "models": { "orchestrator": "Opus", "codeWriter": "Sonnet", "lookup": "Haiku", "reviewer": "Opus" },
  "commands": { "test": "npm test", "build": "npm run build", "lint": "npm run lint", "typecheck": "", "run": "npm run dev" },
  "vcs": { "baseBranch": "main", "fixPrefix": "fix/", "featurePrefix": "feat/", "mergeStyle": "squash" },
  "review": { "severityThreshold": "medium", "maxIter": 5, "trivialFastPath": true },
  "tracker": { "kind": "github", "backend": "gh-cli", "projectKey": "" },
  "pr": { "timing": "draft-early", "titleConvention": "conventional-commit", "checklist": true, "onReadyReviewers": "codeowners" },
  "statusCommentBack": true,
  "tags": {
    "roles": { "needs-triage": "needs-triage", "needs-info": "needs-info", "ready-for-agent": "ready-for-agent", "ready-for-human": "ready-for-human", "wontfix": "wontfix" },
    "type": { "bug": "bug", "enhancement": "enhancement", "chore": "chore" },
    "priority": {},
    "area": []
  },
  "lifecycle": { "start": "In Progress", "draftPr": "In Review", "merged": "Done", "linkSyntax": "Closes #<n>" },
  "filing": { "github": { "titleFmt": "", "bodyTemplate": "", "defaultLabels": [] }, "jira": { "project": "", "issueType": "Bug", "required": [], "defaultPriority": "" } },
  "slots": { "fix/domain-docs": "…filled prose…", "fix/test-strategy": "…", "feature/domain-constraints": "…" },
  "templateVersions": { "fix": "<sha-or-semver>", "feature": "…" }
}
```

Every skill's `SKILL.md` is fully derivable from `TEMPLATE.md` + this manifest.

## `docs/agents/*.md` (human-readable record, written by install)

The record the deps also reference; extends `setup-matt-pocock-skills`:

- `issue-tracker.md` — resolved tracker + backend + concrete commands.
- `triage-labels.md` — the `tags` map.
- `domain.md` — domain-doc layout + consumer rules.
- `models.md` — the model matrix + the reviewer≠writer invariant.
- `review.md` — reviewer conduct, severity, iteration cap.
- `workflow.md` — PR timing, lifecycle transitions, filing + PR templates.

An `## Agent skills` block in `CLAUDE.md`/`AGENTS.md` links to these.

## Invariants the install must never break

- `MODEL_REVIEWER` ≠ `MODEL_CODE_WRITER` (independence).
- The frozen spine is never tokenized away: plan-only `/feature` + human
  sign-off gate; `/fix` triage→repro→root-cause→smallest-fix→prove→independent
  review→merge; builder ≠ approver; two-attempt repro cap; never report an
  unapproved/unmerged run as done.
- A tag/transition is verified to exist before it is applied; if missing, ask —
  never invent one.
