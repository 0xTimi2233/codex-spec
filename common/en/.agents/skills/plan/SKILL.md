---
name: plan
description: Create a run, gather role input, and produce a gated approved plan.
---

# Skill: plan

## Read first

- `.codex/prompts/main-workflow.md`
- `.codex/prompts/file-protocol.md`
- `.codex/prompts/role-common.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

## Procedure

1. Main thread creates `.agentflow/runs/<run-id>/`.
2. Main thread writes `.agentflow/runs/<run-id>/task.md` with goal, scope, non-goals, constraints, and done criteria.
3. Main thread runs `codex-spec state set --phase planning --run <run-id>`.
4. Spawn only needed agents: PM for scope/roadmap, Architect for architecture/spec/ADR, Tester for verification, Researcher for external facts.
5. Agents write only their role-owned run directories.
6. Main thread integrates results into `.agentflow/runs/<run-id>/gate.md`.
7. If ready, set `ready-to-execute`; if blocked, write `.agentflow/runs/<run-id>/summary.md` and set `blocked`.

## Required outputs

- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/gate.md`
- optional role reports under `.agentflow/runs/<run-id>/<role>/`

## Blocked when

- done criteria are missing;
- required user decision is missing;
- architecture boundary is unclear;
- tests cannot be planned safely.

## Final reply

Return run id, current phase, created files, and next command: `$execute` or the blocker.
