---
name: plan
description: Confirm requirements, update the roadmap, and prepare the next milestone run.
---

# Skill: plan

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/brainstorm/brief.md`
- `.agentflow/state.json`

## Procedure

1. Check `.agentflow/brainstorm/brief.md` when it exists. If it is `Status: draft`, ask the user to close it as `ready-for-plan` or `discarded` before PM planning.
2. Recommend clearing chat context after a brainstorm brief becomes `ready-for-plan`.
3. Choose the `ready-for-plan` brief or user-provided requirement input for PM planning.
4. Dispatch PM to confirm requirements, scope, non-goals, roadmap milestones, and acceptance criteria.
5. When requested by dispatch, PM may update `agentflow/vision.md` and `agentflow/roadmap.md`.
6. Select the next milestone, choose or create a run id, and write `.agentflow/runs/<run-id>/task.md`.
7. Write `.agentflow/runs/<run-id>/dispatch-ledger.md` with the dispatch table header.
8. Write `.agentflow/runs/<run-id>/dispatch/pm-001.md`.
9. Append the PM row to `dispatch-ledger.md`, dispatch PM, record the runtime agent id, and update the row when the PM response arrives.
10. Write or update `.agentflow/runs/<run-id>/summary.md`.
11. Run `codex-spec state set --phase planning --run <run-id> --blocked false`.

## PM Decision Handling

If PM returns `User decision required`, present the numbered options to the user, record the selected answer in `task.md` under `User decisions`, and dispatch PM again with that decision as input.

## Required Outputs

- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/dispatch/pm-001.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`
- updated `agentflow/vision.md` or `agentflow/roadmap.md` when PM dispatch requests it

## Next

Return run id, created files, next step `$design`, or blocker.
