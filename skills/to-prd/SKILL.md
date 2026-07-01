---
name: to-prd
description: Turn the current conversation context into a PRD and publish it to the project issue tracker. Use when user wants to create a PRD from the current context.
---

# `/to-prd` — conversation context → published PRD

Synthesizes what's already been discussed and explored in this session into a
PRD. **Do NOT interview the user** — that's `/grill-me` or `/grill-with-docs`'s
job, upstream of this skill. This skill only writes down and publishes what's
already been decided.

## Trigger

Invoked directly, or as a later phase of `/feature` once the design has
converged and been signed off.

The issue tracker (github) and triage label vocabulary should have
been provided to you already — run `/install-engineering-loops` if not.

## Process

1. Explore the repo to understand the current state of the codebase, if you
   haven't already.

   If this repo has domain docs (a glossary, ADRs, or architecture specs), read
   them first and use their vocabulary throughout the PRD, and respect any
   decisions in the area you're touching. If it has none, ground the PRD in the
   code itself.

2. Sketch out the seams at which you're going to test the feature. Existing
   seams should be preferred to new ones. Use the highest seam possible. If new
   seams are needed, propose them at the highest point you can.

   Check with the user that these seams match their expectations.

3. Write the PRD using the template below, then publish it to the issue
   tracker (github).

   File the PRD as a new issue on the resolved tracker, titled after the
   feature, with the PRD body below as the issue body. Apply this tracker's
   "ready for agent" equivalent label/status — no further triage needed for a
   freshly-authored PRD. For trackers with required fields (e.g. a JIRA
   project / issue type / priority), ask for any missing required field —
   never guess it.

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

</prd-template>

## Finish

Report: the PRD's issue/link on github · the seams confirmed with
the user · the label/status applied. If tracker filing failed or a required
field was missing, report that explicitly rather than claiming it published.
