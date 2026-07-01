---
name: feature
description: Plan-only orchestrator for net-new feature work — turns a rough feature idea or request into a signed-off, vertical-sliced implementation plan on the issue tracker. Runs design grill → mandatory adversarial completeness review → human sign-off → PRD → slice issues. Implementation happens in FOLLOW-UP sessions, one slice at a time via `/fix`. Use when asked to plan, scope, design, or "implement" a new feature, build an epic, or break a feature idea into work. Invoke as `/feature <idea-or-issue>`. Distinct from `/fix` (single defect → merged PR).
---

# `/feature` — feature idea → signed-off, sliced implementation plan

**This skill plans; it does not write implementation code.** The plan is the
deliverable. Implementation happens in **follow-up sessions**, one slice at a
time, via `/fix`.

> **Why plan-only:** features are vague, and an agent that starts coding from a
> fuzzy request builds the wrong thing confidently. The loop's job is to remove
> that ambiguity and get a human-approved, sliced plan onto the tracker.

## Trigger

`/feature <idea>` or `/feature <issue#>`. A feature request, rough idea, epic,
or "let's build X."

## Branch first

The grill may update real repo planning docs, so this is a repo change. Before
any edit: `git checkout -b feat/<slug>-plan` from
`main` (or `EnterWorktree` in a background job). No implementation
code lands on this branch — only planning-doc updates.

---

## Phase 1 — Grill to design convergence

Run `/grill-with-docs` (or `/grill-me` if this repo has no domain docs) to
stress-test the idea and resolve every open design decision. Ground feasibility
in real code first — dispatch an **Explore** or **general-purpose** subagent
(model: Haiku) over the codebase to confirm where the feature would
live and what it touches. Do not design against an imagined architecture.

If this repo has domain docs (a `CONTEXT.md`, ADRs under `docs/adr/`, or
architecture specs), read them first and align terminology to them; update them
inline as decisions crystallize. If it has none, grill against the code itself
and capture decisions in the PRD.

Honor the project's locked constraints as you grill:

No project-specific constraints beyond the frozen spine have been configured.
Respect the repo's existing architecture and conventions; if a design forces a
new cross-cutting decision, name it explicitly and record the chosen option and
why.

**Phase 1 stop:** every open design decision in the tree is resolved (no "TBD"
branches), terminology is aligned, and any touched docs are updated. → Phase 2.

## Phase 2 — Adversarial completeness review (mandatory)

Hand the drafted design to an **independent reviewer** — a `code-reviewer`
subagent on **Opus** (which must differ from the code-writer
model, Sonnet, so the review is a genuine second perspective).
Use `architect` + an **Explore** subagent as repo-grounded backup lenses for
feasibility. The reviewer must probe **every** dimension below and surface
incorrect assumptions and unexplored landscape:

- **Assumptions** — each stated and validated; nothing load-bearing-but-unproven.
- **Surfaces** — every UI/entry surface the feature touches, plus empty /
  loading / error / no-data states.
- **Data** — schema/shape changes, integrity constraints, and the invariants the
  testing strategy will rely on.
- **Persistence** — migration/versioning impact of any stored-data change.
- **Cross-cutting** — accessibility, security of any new input path, performance,
  and whatever priority the project ranks highest.
- **Design decisions** — every major fork named with the chosen option + why; no
  implicit choices.
- **Scope** — slices independently shippable, each with explicit acceptance
  criteria.

No project-specific data invariants configured. If this repo has schema/data
integrity checks the plan must preserve, the review names them here.

Each objection is logged with a severity and either **resolved** (loop back to
Phase 1 to fix the design/docs) or **explicitly accepted** with a reason.

**Phase 2 stop:** **no high-impact objection remains open.** Loop Phase 1 ⇄
Phase 2 until convergence — do not advance with an open high-impact gap.

## Phase 3 — Human sign-off (hard gate)

Present the converged plan + the review's accepted/closed objections and **stop
for explicit approval**. `/to-prd` and `/to-issues` run **only after you say
approved**. Not approved → stay in the grill or hand back open questions. Never
publish a PRD or create issues off an unapproved plan.

## Phase 4 — Publish the plan

After sign-off:
1. **`/to-prd`** — publish the PRD to the issue tracker (github).
2. **`/to-issues`** — break the PRD into **vertical-slice** issues, each with
   acceptance criteria and independently grabbable, tagged so an agent can pick
   them up (see the tag taxonomy). Tag each slice with the implementing skill for
   the follow-up session — normally **`/fix`**.

## Terminal states (name honestly)

- **Published** — PRD + slice issues created; plan signed off. *Success.*
  Implementation is explicitly deferred to follow-up sessions.
- **Open-decisions** — unresolved design forks → handed back, no PRD.
- **Not-approved** — converged but you withheld sign-off → held, no PRD.
- **Errored** — grill/review/publish failure → reported as errored, not published.

Never report an unapproved or errored run as published. This skill writes **no
implementation code** and **never enables a schedule**.

## Subagents — who to dispatch when

Default code-writing to **Sonnet** subagents; lookup/search to
**Haiku**; the adversarial reviewer runs on **Opus**.
Tell every subagent to invoke the **`caveman`** skill first (cuts output ~75%).
Most planning work is read/think/review; this loop never writes implementation
code.

**Ground the plan in real code (Phase 1):**
- **`Explore`** — *do this first.* Read-only fan-out to confirm where the feature
  would live, what it touches, and whether the design is feasible.
- **`general-purpose`** — broader multi-step discovery when the target subsystem
  is unknown.

**Design & decide (Phase 1–2):**
- **`architect`** — system-design lens; major architectural forks and trade-offs.
- **`planner`** / **`Plan`** — decompose the feature into bounded vertical slices.

**Adversarial review (Phase 2):**
- **`code-reviewer`** on **Opus** — the mandatory independent
  completeness/assumptions reviewer.
- **`security-reviewer`** — pull in if the feature parses untrusted input, so the
  plan accounts for validation up front.

**Out of scope here:** `tdd-guide`, `build-error-resolver`, `refactor-cleaner`,
`code-simplifier` (implementation-phase agents — they run in the follow-up
`/fix` sessions), and the generic `claude` catch-all.

## Finish

Report: the converged design summary · accepted/closed objections from the
adversarial review · sign-off state · **PRD link + the slice issues created**
(each tagged `/fix` for the follow-up) · the explicit handoff that implementation
runs in follow-up sessions. If Open-decisions / Not-approved / Errored, say which
— never dress an unpublished plan up as done.
