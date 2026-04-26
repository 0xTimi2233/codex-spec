---
name: brainstorm
description: Explore requirements before planning and write a concise brief for PM planning.
---

# Skill: brainstorm

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- user-provided input files

## Procedure

1. Choose a brainstorm id and run `codex-spec state set --brainstorm <brainstorm-id> --blocked false`.
2. Discuss goal, scope, non-goals, constraints, risks, user preferences, and candidate milestones.
3. Read only user-provided files. If more context is needed, ask for the specific path or decision.
4. Write `.agentflow/brainstorm/<brainstorm-id>/brief.md`.
5. Update `.agentflow/brainstorm/<brainstorm-id>/notes.md`, `questions.md`, and `source-map.md` when they add useful audit context.
6. Keep `brief.md` as `Status: draft` until the user confirms the brief is ready for planning.
7. When confirmed, update `brief.md` to `Status: ready-for-plan` or `Status: discarded`, write `summary.md`, run `codex-spec archive --brainstorm <brainstorm-id>`, then run `codex-spec state set --brainstorm null`.
8. Recommend starting `$plan` from a clean chat context.

## Brief Format

```text
Status: draft | ready-for-plan | discarded
Goal:
Confirmed requirements:
Non-goals:
User decisions:
Open questions:
User preferences:
Constraints:
Candidate milestones:
Risks:
Recommended planning focus:
```

## Scope

- Maintain `.agentflow/brainstorm/<brainstorm-id>/` and `.agentflow/state.json.current_brainstorm`.
- Leave roadmap, run, ADR, spec, test plan, and source work to later workflow skills.

## Final Reply

Return the brief path, current status, unresolved questions, and next recommended skill.
