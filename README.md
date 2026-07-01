# claude-skills — portable engineering loops

A codebase-agnostic bundle of Claude Code skills for driving work from idea →
plan and from defect → merged PR, with a strong, frozen process spine and an
install step that tunes the *bindings* (models, commands, tracker, PR/issue
workflow) to your repo.

Two headline loops:

- **`/feature`** — a rough idea → a signed-off, vertically-sliced implementation
  plan on your issue tracker. Plan-only: it never writes implementation code.
- **`/fix`** — an issue or complaint → reproduced fix → independently reviewed,
  merge-ready PR → merge.

Plus the helper skills they call (`triage`, `to-prd`, `to-issues`,
`grill-with-docs`, `subagent-dispatch`, `simplify`, `caveman`) and the installer
(`install-engineering-loops`).

## How adaptation works

The skills ship **generic**. Each skill dir contains a pristine `TEMPLATE.md`
(with `{{TOKENS}}` and `<!-- SLOT -->` regions) alongside its `SKILL.md`. The
installer interviews you, then **rewrites the `SKILL.md` bodies** with your
repo's specifics and records every answer in `.claude/skills-install.json` so a
later update can regenerate from a fresh template without re-interviewing you.

- **Frozen spine** (never tunable): plan-only `/feature` + human sign-off gate;
  `/fix` = triage → reproduce → root-cause → smallest fix → prove → independent
  review → merge; builder ≠ approver; two-attempt repro cap.
- **Tuned at install**: model matrix (Opus/Sonnet/Haiku per role), test/build/
  lint/run commands, issue tracker (GitHub/GitLab/JIRA/Linear/local-markdown,
  MCP preferred with CLI fallback), base branch, merge style, review severity +
  iteration cap, trivial-fast-path, PR timing, tagging taxonomy, issue
  lifecycle transitions, filing + PR templates.

See [`docs/INSTALL-CONTRACT.md`](docs/INSTALL-CONTRACT.md) for the full token/
slot registry and manifest schema.

## Install

```bash
# 1. Drop the skills into your repo
git clone https://github.com/jonkraatz/claude-skills.git /tmp/claude-skills
mkdir -p .claude/skills
cp -r /tmp/claude-skills/skills/* .claude/skills/

# 2. Tune them to this repo
#    (in Claude Code, in your repo)
/install-engineering-loops
```

The installer detects what it can (package scripts, tracker, domain docs,
available MCP/CLI tooling), grills you on the rest, rewrites the skill bodies,
writes `docs/agents/*.md` + an `## Agent skills` block, and saves the manifest.

## Updating

Re-copy the skills over your `.claude/skills/` and re-run
`/install-engineering-loops`. Scalar bindings are re-applied from the saved
manifest automatically; only genuinely new questions are re-asked.

## License & attribution

> **TODO — resolve before relying on this publicly.** These skills are
> generalized from Matt Pocock's engineering skills and reference Loop Library
> patterns. Attribution and a license (intended: MIT + a NOTICE crediting the
> lineage) are **pending**. See [`LICENSE`](LICENSE).
