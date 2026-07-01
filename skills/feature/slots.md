# `feature` slot registry

Tokens and prose slots this skill uses. See `docs/INSTALL-CONTRACT.md` for the
global registry and defaults.

## Scalar tokens

| Token | Purpose here |
| --- | --- |
| `{{BRANCH_PREFIX_FEATURE}}` | Prefix for the planning branch. |
| `{{BASE_BRANCH}}` | Base the planning branch forks from. |
| `{{MODEL_CODE_WRITER}}` | Code-writer model (named for the reviewer≠writer contrast). |
| `{{MODEL_LOOKUP}}` | Model for Explore/discovery subagents. |
| `{{MODEL_REVIEWER}}` | Model for the mandatory adversarial reviewer. |
| `{{TRACKER_KIND}}` | Named where the PRD/issues are published. |

## Prose slots

| Slot | What the install grill writes |
| --- | --- |
| `domain-docs` | Whether this repo has `CONTEXT.md`/ADRs/specs and how to consult + update them during the grill, or "none". |
| `domain-constraints` | The project invariants a plan must honor (the repo's ADR-equivalents): architecture rules, no-backend/backend, state model, persistence rules, accuracy/verification requirements. |
| `data-invariants` | Project-specific data/schema integrity checks the review must confirm the plan preserves, or "none". |
