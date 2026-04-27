---
name: spec:auto
description: Run roadmap milestones serially through design and execute until blocked or complete.
---

# Skill: spec:auto

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

## Procedure

If no confirmed roadmap exists, stop and recommend `$spec:plan`.

For each roadmap milestone, create or resume its run and execute:

```text
$spec:design -> $spec:execute
```

If a milestone run does not exist, use `$spec:plan` behavior to create the run task from the roadmap entry. After every step, use `.agentflow/state.json`, dispatch status, and subagent replies.

## Rejection And Stop Rules

On rejection or a non-pass decision, the main thread uses the subagent reply to write or update `.agentflow/runs/<run-id>/fix-requests/*.md`. If the responsible role, allowed input paths, and allowed output paths are clear, dispatch that subagent to handle the fix, then return to the corresponding workflow step or review gate.

Stop automatic progress only when any of these occur:

- the main thread cannot choose the responsible role, fix scope, or next gate safely;
- a user, external system, or destructive operation decision is needed;
- required artifacts are missing and cannot be recreated through a clear dispatch;
- the same open issue still has no executable next step after a fix attempt;
- `.agentflow/state.json.blocked = true`.

When stopping, the main thread writes `.agentflow/runs/<run-id>/summary.md` with state, reason, latest evidence paths, and recommended next action.

## Milestone Commit

When `$spec:execute` archives the run and clears state, the main thread commits the code, test, and documentation changes for the completed milestone before starting the next milestone. If there are no file changes, do not create an empty commit; record the no-op in summary.

## Final Reply

Return completed milestones, routed fix attempts or stop reason, current state, relevant report/fix-request paths, milestone commit status, and the recommended next user action.
