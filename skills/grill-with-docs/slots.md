# `grill-with-docs` slot registry

Tokens and prose slots this skill uses. See `docs/INSTALL-CONTRACT.md` for the
global registry and defaults.

## Scalar tokens

None. This skill is a pure interview/doc-update loop — it doesn't run
commands, branch, or touch a tracker, so it carries no scalar tokens.

## Prose slots

| Slot | What the install grill writes |
| --- | --- |
| `domain-docs` | Where `CONTEXT.md`/`CONTEXT-MAP.md`/ADRs live in this repo (single- vs multi-context layout) and the rule for consulting + updating them during a grill, or — if the repo has none — the fallback: grill against the code directly and capture decisions in the PRD/issue/conversation instead of a doc. |
