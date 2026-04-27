---
name: auto
description: Run roadmap milestones serially through design and execute until blocked or complete.
---

# Skill: auto

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/glossary.md`
- `.codex/prompts/file-index.md`
- `codexspec/roadmap.md`
- `codexspec/runtime/state.json`

## Procedure

If the user provides an inline requirement after `$auto`, use it as `$plan` input, then continue through `$design` and `$execute` for the resulting milestone.

If there is no inline requirement and no confirmed roadmap exists, stop and recommend `$plan`.

For each roadmap milestone, create or resume its run and execute:

```text
$design -> $execute
```

If a milestone run does not exist, use `$plan` behavior to create the run task from the roadmap entry. After every step, use `codexspec/runtime/state.json`, dispatch status, and subagent replies.

## Rejection And Stop Rules

Use the main-thread "Rejection Routing" rule. `$auto` resumes automatic progress after a routed fix reaches the matching workflow step or review step. Stop only when that rule says safe routing is not possible.

## Milestone Commit

Use the main-thread "Milestone Boundary" rule before starting the next milestone.

## Final Reply

Return completed milestones, routed fix attempts or stop reason, current state, relevant report/fix-request paths, milestone commit status, and the recommended next user action.
