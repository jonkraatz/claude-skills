# `triage` slot registry

Tokens and prose slots this skill uses. See `docs/INSTALL-CONTRACT.md` for the
global registry and defaults.

## Scalar tokens

| Token | Purpose here |
| --- | --- |
| `{{TRACKER_KIND}}` | Names the issue tracker throughout (state machine, filing, briefs). |
| `{{MODEL_LOOKUP}}` | Model for the read-only domain-docs / codebase-exploration lookup subagent dispatched in "Gather context". |

## Prose slots

| Slot | What the install grill writes |
| --- | --- |
| `tag-taxonomy` | Canonical role (`bug`/`enhancement` + the five state roles) → this tracker's actual label/status strings. Mirrors `manifest.tags`. |
| `filing-template` | How to draft + file a brand-new issue when `/triage` is invoked on free text with no issue yet (per-tracker required fields). |
| `domain-docs` | Where this project's glossary/architecture docs/ADRs live and the rule for consulting them during "Gather context", or "none — no domain docs". |
