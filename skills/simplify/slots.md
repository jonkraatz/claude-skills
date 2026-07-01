# `simplify` slot registry

Tokens this skill uses. See `docs/INSTALL-CONTRACT.md` for the global registry
and defaults. This skill uses no prose slots — it's short enough to stay fully
generic.

## Scalar tokens

| Token | Purpose here |
| --- | --- |
| `{{BASE_BRANCH}}` | Branch the changed diff is computed against. |
| `{{BUILD_CMD}}` / `{{TEST_CMD}}` | Green gates re-run after cleanup to prove no behavior change. |
| `{{MODEL_CODE_WRITER}}` | Subagent model for non-trivial cleanup edits. |
