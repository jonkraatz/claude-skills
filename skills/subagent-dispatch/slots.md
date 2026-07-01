# `subagent-dispatch` slot registry

Tokens and prose slots this skill uses. See `docs/INSTALL-CONTRACT.md` for the
global registry and defaults.

## Scalar tokens

| Token | Purpose here |
| --- | --- |
| `{{MODEL_ORCHESTRATOR}}` | Model running the dispatch process itself (briefing, acceptance checks, cleanup). |
| `{{MODEL_CODE_WRITER}}` | Code-writer subagent model (must differ from `{{MODEL_REVIEWER}}`). |
| `{{MODEL_LOOKUP}}` | Read-only discovery/lookup subagent model used to pin exact files/lines before writing a brief. |
| `{{MODEL_REVIEWER}}` | Post-dispatch independent reviewer model. |
| `{{BASE_BRANCH}}` | Branch worktrees fork from; branch used to sanity-check a shared generated file after merge. |
| `{{MERGE_STYLE}}` | Merge strategy in post-dispatch step 5. |
| `{{BUILD_CMD}}` | CI/local build command — the gate subagents don't run by default, and what the orchestrator runs to reproduce a CI failure. |
| `{{TEST_CMD}}` | Test command subagents run before opening a PR. |
| `{{LINT_CMD}}` | Lint command in the brief template's BUILD/CI GATE step. |

## Prose slots

None. This skill is a process/safety spine (worktree isolation, briefing, crash
recovery) that holds across projects without repo-specific prose — only the
scalar tokens above vary per install.
