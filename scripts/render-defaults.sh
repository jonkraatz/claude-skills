#!/usr/bin/env bash
# render-defaults.sh — regenerate every skill's default SKILL.md from its
# TEMPLATE.md using the generic defaults.json, then validate that nothing was
# left un-substituted. Run from the repo root. Requires bun or node.
#
# This produces the *shipped* (generic) SKILL.md files. The installer does the
# same render per-repo with a tuned manifest instead of defaults.json.
set -euo pipefail
cd "$(dirname "$0")/.."

if command -v bun >/dev/null 2>&1; then RUN=bun
elif command -v node >/dev/null 2>&1; then RUN=node
else echo "need bun or node on PATH" >&2; exit 1; fi

fail=0
for tpl in skills/*/TEMPLATE.md; do
  skill=$(basename "$(dirname "$tpl")")
  out="skills/$skill/SKILL.md"
  "$RUN" scripts/render.mjs "$skill" "$tpl" defaults.json "$out"
done

echo "--- validating rendered output ---"
# Only validate SKILL.md files that were RENDERED from a TEMPLATE.md. Hand-authored
# skills (install-engineering-loops, caveman, grill-me) may legitimately contain
# literal {{TOKEN}} / <!-- SLOT --> text as documentation.
for tpl in skills/*/TEMPLATE.md; do
  f="$(dirname "$tpl")/SKILL.md"
  if grep -q '{{' "$f"; then echo "STRAY TOKEN in $f"; grep -n '{{' "$f"; fail=1; fi
  if grep -q 'SLOT:' "$f"; then echo "STRAY MARKER in $f"; grep -n 'SLOT:' "$f"; fail=1; fi
done
[ "$fail" = 0 ] && echo "OK: all skills rendered, no stray tokens/markers" || { echo "VALIDATION FAILED"; exit 1; }
