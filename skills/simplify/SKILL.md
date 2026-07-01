---
name: simplify
description: Merge-time quality pass over the changed diff — review for reuse (extend-before-create), simplification, efficiency, and altitude (right level of abstraction), then apply the fixes. Quality only, not a bug hunt. Use right before merging a branch/PR, as the cleanup step `/fix` intentionally defers (unrelated refactors are banned mid-fix). Invoke as `/simplify` on the current branch, or `/simplify <PR#>`.
---

# `/simplify` — merge-time quality pass over the changed diff

## Scope boundary (read first)

- **Quality only.** No behavior changes, no bug-hunting (that's `/fix` or a
  code-review skill), no refactors outside the changed surface. If you spot an
  actual defect, file it — don't fix it here.
- **Diff-scoped.** Everything reviewed and touched must be inside the diff
  against `main`. Don't wander into untouched files.
- **Must stay green.** Every change made here is re-proven by the same gates
  Phase A of `/fix` uses — no exceptions.

## 1. Scope the diff

Compute the changed surface: `git diff main...HEAD` (or the PR's
diff, if invoked with a PR number). This diff is the entire review surface —
don't expand it.

## 2. Review each changed file for four things

- **Reuse (extend-before-create).** Does this diff duplicate a helper,
  pattern, or type that already exists elsewhere in the codebase? Prefer
  extending the existing one over a near-duplicate.
- **Simplification.** Unnecessary indirection, dead branches, over-parameterized
  functions, or logic that reads more complex than the problem it solves.
- **Efficiency.** Obviously wasteful passes, re-computation, or allocations
  introduced by this diff — not a full perf audit, just the low-hanging fruit.
- **Altitude.** Is each piece of new code at the right level of abstraction —
  not leaking low-level detail into a high-level caller, not over-abstracting
  a one-off?

Note findings before touching anything; each must cite a file + line.

## 3. Apply the fixes

Dispatch a **Sonnet** subagent per logical cleanup (or do it
directly if trivial — a handful of single-file tweaks). Brief it with: the
finding, the file/line, the constraint that this is a **pure refactor** (no
behavior change), and that it must stay inside the diff's changed files. Tell
it to invoke the `caveman` skill first.

## 4. Prove it stayed green

After applying fixes, re-run the project's gates and confirm real output, not
a bare "succeeded":

```
npm run build
npm test
```

If either fails, the cleanup introduced a behavior change — revert that
specific change rather than debugging forward; this pass has no license to
turn into a fix.

## Report

List: files touched · what was simplified/reused/re-leveled (one line each) ·
confirmation that `npm run build` and `npm test` are green. If a real bug
was spotted along the way, name it and where it was filed — don't fix it here.
