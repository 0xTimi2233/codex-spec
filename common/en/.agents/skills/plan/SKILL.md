---
name: plan
description: Define requirements, scope, roadmap milestone, and create the current run.
---

# Skill: plan

## Read First

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

## Procedure

1. Select or create a run id.
2. Write `.agentflow/runs/<run-id>/dispatch-ledger.md` with the dispatch table header.
3. Write `.agentflow/runs/<run-id>/task.md` with goal, scope, non-goals, constraints, and done criteria.
4. Write `.agentflow/runs/<run-id>/dispatch/pm-001.md`.
5. Append the PM row to `dispatch-ledger.md`, dispatch PM, record the runtime agent id, and update the row when the PM response arrives.
6. Write or update `.agentflow/runs/<run-id>/summary.md`.
7. Run `codex-spec state set --phase planning --run <run-id> --blocked false`.

## PM Decision Handling

If PM returns `User decision required`, present the numbered options to the user, record the selected answer in `task.md` under `User decisions`, and dispatch PM again with that decision as input.

## Required Outputs

- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/dispatch/pm-001.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`

## Next

Return run id, created files, next step `$design`, or blocker.
