#!/usr/bin/env node
// render.mjs — TEMPLATE.md + manifest → SKILL.md
//
// Deterministic renderer for the install contract (docs/INSTALL-CONTRACT.md).
// Substitutes {{TOKENS}} from the manifest and fills <!-- SLOT: name --> regions
// from manifest.slots["<skill>/<name>"], keeping the in-template default when a
// slot is unfilled. Markers are stripped from the output SKILL.md.
//
// Usage:
//   node scripts/render.mjs <skill-name> <template-path> <manifest-path> <out-path>
//
// The install skill uses this when node/bun is available; otherwise the agent
// performs the same substitution by hand. It is a convenience + reference impl,
// never a hard dependency.

import { readFileSync, writeFileSync } from "node:fs";

const [, , skill, templatePath, manifestPath, outPath] = process.argv;
if (!skill || !templatePath || !manifestPath || !outPath) {
  console.error("usage: render.mjs <skill> <template> <manifest> <out>");
  process.exit(1);
}

const m = JSON.parse(readFileSync(manifestPath, "utf8"));

// {{TOKEN}} -> value, sourced from the manifest.
const tokens = {
  MODEL_ORCHESTRATOR: m.models.orchestrator,
  MODEL_CODE_WRITER: m.models.codeWriter,
  MODEL_LOOKUP: m.models.lookup,
  MODEL_REVIEWER: m.models.reviewer,
  TEST_CMD: m.commands.test,
  BUILD_CMD: m.commands.build,
  LINT_CMD: m.commands.lint,
  TYPECHECK_CMD: m.commands.typecheck,
  RUN_CMD: m.commands.run,
  BASE_BRANCH: m.vcs.baseBranch,
  BRANCH_PREFIX_FIX: m.vcs.fixPrefix,
  BRANCH_PREFIX_FEATURE: m.vcs.featurePrefix,
  MERGE_STYLE: m.vcs.mergeStyle,
  REVIEW_SEVERITY_THRESHOLD: m.review.severityThreshold,
  REVIEW_MAX_ITER: String(m.review.maxIter),
  TRIVIAL_FAST_PATH: m.review.trivialFastPath ? "on" : "off",
  TRACKER_KIND: m.tracker.kind,
  TRACKER_BACKEND: m.tracker.backend,
  PROJECT_KEY: m.tracker.projectKey,
  PR_TIMING: m.pr.timing,
  PR_TITLE_CONVENTION: m.pr.titleConvention,
  PR_CHECKLIST: m.pr.checklist ? "on" : "off",
  ONREADY_REVIEWERS: m.pr.onReadyReviewers,
  STATUS_COMMENT_BACK: m.statusCommentBack ? "on" : "off",
};

// Enforce the one hard invariant before emitting anything.
if (tokens.MODEL_REVIEWER === tokens.MODEL_CODE_WRITER) {
  console.error(
    `invariant violated: reviewer model (${tokens.MODEL_REVIEWER}) must differ from code-writer model`,
  );
  process.exit(1);
}

let src = readFileSync(templatePath, "utf8");

// 1) Fill prose slots. Keep the default inner text when the manifest has none.
src = src.replace(
  /<!--\s*SLOT:\s*([a-z0-9-]+)\s*-->([\s\S]*?)<!--\s*\/SLOT\s*-->/g,
  (_all, name, def) => {
    const key = `${skill}/${name}`;
    const filled = m.slots && m.slots[key];
    return (filled != null ? filled : def).trim();
  },
);

// 2) Substitute scalar tokens.
src = src.replace(/\{\{([A-Z_]+)\}\}/g, (all, name) =>
  name in tokens ? tokens[name] : all,
);

writeFileSync(outPath, src);
console.error(`rendered ${skill} -> ${outPath}`);
