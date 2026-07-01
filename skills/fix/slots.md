# `fix` slot registry

Tokens and prose slots this skill uses. See `docs/INSTALL-CONTRACT.md` for the
global registry and defaults.

## Scalar tokens

| Token | Purpose here |
| --- | --- |
| `{{MODEL_CODE_WRITER}}` | Code-writer subagent model. |
| `{{MODEL_LOOKUP}}` | Explore/discovery subagent model. |
| `{{MODEL_REVIEWER}}` | Phase B reviewer model (must differ from code-writer). |
| `{{TEST_CMD}}` / `{{BUILD_CMD}}` / `{{LINT_CMD}}` / `{{RUN_CMD}}` | Repro + green gates. |
| `{{BASE_BRANCH}}` / `{{BRANCH_PREFIX_FIX}}` | Branch base + prefix. |
| `{{MERGE_STYLE}}` | Merge strategy in Phase C. |
| `{{REVIEW_SEVERITY_THRESHOLD}}` / `{{REVIEW_MAX_ITER}}` | Phase B knobs. |
| `{{TRIVIAL_FAST_PATH}}` | Whether trivial fixes skip Phase B. |
| `{{PR_TIMING}}` / `{{PR_TITLE_CONVENTION}}` / `{{PR_CHECKLIST}}` / `{{ONREADY_REVIEWERS}}` | PR handling. |
| `{{TRACKER_KIND}}` / `{{STATUS_COMMENT_BACK}}` | Tracker + status-comment policy. |

## Prose slots

| Slot | What the install grill writes |
| --- | --- |
| `filing-template` | How to draft + file a new issue on free-text invocation (per-tracker required fields). |
| `lifecycle-transitions` | Phase→transition map, PR↔issue link syntax, comment-back policy for this tracker. |
| `test-strategy` | How to reproduce/prove per defect class (logic vs UI) with this repo's commands. |
| `domain-constraints` | Project invariants the fix must honor (source-of-truth data location, architecture rules). |
| `data-invariants` | Project-specific integrity checks to re-verify before green, or "none". |
| `pr-template` | PR title convention + body sections + checklist for this repo. |
