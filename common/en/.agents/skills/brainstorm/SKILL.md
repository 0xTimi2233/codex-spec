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
4. Ask at most 1-3 blocking questions per round. Each question includes 2-4 numbered options, impact notes, and a recommended option. Free-form user answers are allowed.
5. After each answered round, update `questions.md`, fold confirmed answers into `brief.md`, and decide whether another question round is needed.
6. When no blocking questions remain, ask the user to choose whether to finish as `ready-for-plan`, continue brainstorming, or discard the session.
7. Write `.agentflow/brainstorm/<brainstorm-id>/brief.md`.
8. Update `.agentflow/brainstorm/<brainstorm-id>/notes.md`, `questions.md`, and `source-map.md` when they add useful audit context.
9. Keep `brief.md` as `Status: draft` until the user confirms the brief is ready for planning.
10. When confirmed, update `brief.md` to `Status: ready-for-plan` or `Status: discarded`, write `summary.md`, run `codex-spec archive --brainstorm <brainstorm-id>`, then run `codex-spec state set --brainstorm null`.
11. Use `.agentflow/archives/brainstorm/<brainstorm-id>/brief.md` as the planning brief path after archive.
12. Recommend starting `$plan` from a clean chat context.

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

## Question Format

```text
Q1:
Context:
Options:
1. <option> - Impact:
2. <option> - Impact:
Recommended:
User answer:
Status: open | answered
```

## Scope

- Maintain `.agentflow/brainstorm/<brainstorm-id>/` and `.agentflow/state.json.current_brainstorm`.
- Leave roadmap, run, ADR, spec, test plan, and source work to later workflow skills.

## Final Reply

Return the brief path, current status, unresolved questions, and next recommended skill.
