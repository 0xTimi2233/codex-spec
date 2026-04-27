---
name: spec:resume
description: Resume workflow from state, planning session, and dispatch ledger.
---

# Skill: spec:resume

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.agentflow/state.json`
- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/explore/<current_planning_session>/brief.md` when `planning_track` is `explore`
- `.agentflow/explore/<current_planning_session>/rounds/<round-id>/round.md` when an active explore round is present
- `.agentflow/preflight/<current_planning_session>/brief.md` when `planning_track` is `preflight`
- `.agentflow/preflight/<current_planning_session>/decisions/queue.md` when `planning_track` is `preflight`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/summary.md` when present

## Procedure

1. If `planning_track` is `explore`, resume the active explore brief and latest round, then continue or close the `$spec:plan` explore track.
2. If `planning_track` is `preflight`, resume the active preflight brief and decision queue, then continue or close the `$spec:plan` preflight track.
3. If `current_run` is set, read the run dispatch ledger.
4. For rows whose status is not an ending status, continue the recorded agent id when possible.
5. If continuing the agent is not possible, mark the row `stale` and create a new bounded dispatch from current file artifacts.

## Final Reply

Return resumed planning session or run state, missing artifacts, stale dispatches, and the recommended next skill.
