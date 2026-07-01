# `to-prd` slot registry

Tokens and prose slots this skill uses. See `docs/INSTALL-CONTRACT.md` for the
global registry and defaults.

## Scalar tokens

| Token | Purpose here |
| --- | --- |
| `{{TRACKER_KIND}}` | Where the PRD is published (issue tracker). |

## Prose slots

| Slot | What the install grill writes |
| --- | --- |
| `domain-docs` | Whether this repo has a glossary/ADRs/architecture specs and how to use their vocabulary + respect their decisions while drafting the PRD, or "none". |
| `filing-template` | How to file the PRD as a new issue on the resolved tracker: title convention, default label/status (the "ready for agent" equivalent), and any required fields to ask for (e.g. JIRA project/issue-type/priority). |
