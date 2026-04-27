---
name: spec:resume
description: Resume workflow from state, brainstorm, and dispatch ledger.
---

# Skill: spec:resume

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.agentflow/state.json`
- `.agentflow/brainstorm/<current_brainstorm>/brief.md` when `current_brainstorm` is set
- `.agentflow/brainstorm/<current_brainstorm>/rounds/<round-id>/round.md` when an active brainstorm round is present
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/summary.md` when present

## Procedure

1. If `current_brainstorm` is set, resume the active brainstorm brief and latest round, then either continue `$spec:brainstorm` or close it for `$spec:plan`.
2. If `current_run` is set, read the run dispatch ledger.
3. For rows whose status is not an ending status, continue the recorded agent id when possible.
4. If continuing the agent is not possible, mark the row `stale` and create a new bounded dispatch from current file artifacts.

## Final Reply

Return resumed brainstorm or run state, missing artifacts, stale dispatches, and the recommended next skill.
