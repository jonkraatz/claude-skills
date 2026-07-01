# `to-issues` slot registry

Tokens and prose slots this skill uses. See `docs/INSTALL-CONTRACT.md` for the
global registry and defaults.

## Scalar tokens

| Token | Purpose here |
| --- | --- |
| `{{TRACKER_KIND}}` | Which issue tracker slices are published to; also names the `/install-engineering-loops` prerequisite. |

## Prose slots

| Slot | What the install grill writes |
| --- | --- |
| `domain-docs` | Where the domain glossary / ADRs live, so slice titles/descriptions borrow project vocabulary and respect existing decisions. |
| `filing-template` | Per-tracker required fields when drafting + filing each slice issue (e.g. JIRA project/issue-type/priority). |
| `tag-taxonomy` | Canonical "ready for agent" role → repo label/status, applied to each published slice. |
