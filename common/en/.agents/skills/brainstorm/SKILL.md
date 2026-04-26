---
name: brainstorm
description: Explore requirements before planning and write a concise brief for PM planning.
---

# Skill: brainstorm

## Read First

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- user-provided input files

## Procedure

1. Choose or reuse a brainstorm id.
2. Discuss goal, scope, non-goals, constraints, risks, user preferences, and candidate milestones.
3. Read only user-provided files. If more context is needed, ask for the specific path or decision.
4. Write `.agentflow/brainstorm/<brainstorm-id>/brief.md`.
5. Keep `Status: draft` until the user confirms the brief is ready for planning.
6. When confirmed, update the brief to `Status: ready-for-plan` and recommend starting `$plan` from a clean chat context.

## Brief Format

```text
Status: draft | ready-for-plan | discarded
Goal:
Confirmed requirements:
Non-goals:
Open questions:
User preferences:
Constraints:
Candidate milestones:
Risks:
Recommended next step:
```

## Must Not Do

- Do not create a run.
- Do not update workflow state.
- Do not write roadmap, ADR, spec, test plan, or source files.
- Do not dispatch PM.

## Final Reply

Return the brief path, current status, unresolved questions, and next recommended skill.
