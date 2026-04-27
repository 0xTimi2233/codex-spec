---
name: spec:auto
description: Run roadmap milestones serially through design and execute until blocked or complete.
---

# Skill: spec:auto

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `codexspec/roadmap.md`
- `codexspec/runtime/state.json`

## Procedure

If the user provides an inline requirement after `$spec:auto`, use it as `$spec:plan` input, then continue through `$spec:design` and `$spec:execute` for the resulting milestone.

If there is no inline requirement and no confirmed roadmap exists, stop and recommend `$spec:plan`.

For each roadmap milestone, create or resume its run and execute:

```text
$spec:design -> $spec:execute
```

If a milestone run does not exist, use `$spec:plan` behavior to create the run task from the roadmap entry. After every step, use `codexspec/runtime/state.json`, dispatch status, and subagent replies.

## Rejection And Stop Rules

Use the main-thread "Rejection Routing" rule. `$spec:auto` resumes automatic progress after a routed fix reaches the matching workflow step or review step. Stop only when that rule says safe routing is not possible.

## Milestone Commit

Use the main-thread "Milestone Boundary" rule before starting the next milestone.

## Final Reply

Return completed milestones, routed fix attempts or stop reason, current state, relevant report/fix-request paths, milestone commit status, and the recommended next user action.
