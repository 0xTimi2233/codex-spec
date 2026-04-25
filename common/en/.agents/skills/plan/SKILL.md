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
2. Write `.agentflow/runs/<run-id>/task.md` with goal, scope, non-goals, constraints, and done criteria.
3. Write `.agentflow/runs/<run-id>/dispatch/pm-001.md`.
4. Dispatch PM and collect PM artifacts.
5. Write or update `.agentflow/runs/<run-id>/summary.md`.
6. Run `codex-spec state set --phase planning --run <run-id> --blocked false`.

## Required Outputs

- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/dispatch/pm-001.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`

## Next

Return run id, created files, next step `$design`, or blocker.
