---
name: spec:brainstorm
description: Explore requirements before planning and write a concise brief for PM planning.
---

# Skill: spec:brainstorm

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
5. Write each round to `.agentflow/brainstorm/<brainstorm-id>/rounds/round-<nnn>/round.md`. Do not rewrite earlier rounds except to complete the same open round.
6. After each answered round, update that round's status, user answers, decisions, and round summary. Start `round-<nnn+1>` only when another question batch is needed.
7. Keep `.agentflow/brainstorm/<brainstorm-id>/brief.md` as `Status: draft` while rounds are open.
8. When no blocking questions remain, ask the user to choose whether to finish as `ready-for-plan`, continue brainstorming, or discard the session.
9. When confirmed, merge the round decisions into `brief.md`, set `Status: ready-for-plan` or `Status: discarded`, write `summary.md`, run `codex-spec archive --brainstorm <brainstorm-id>`, then run `codex-spec state set --brainstorm null`.
10. Use `.agentflow/archives/brainstorm/<brainstorm-id>/brief.md` as the planning brief path after archive.
11. Recommend starting `$spec:plan` from a clean chat context.

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

## Round Format

```text
Round: 001
Status: open | answered | superseded
Question range: Q001-Q003
Inputs read:
- <repo-relative path>

Questions:
Q001:
Context:
Options:
1. <option> - Impact:
2. <option> - Impact:
Recommended:
User answer:
Decision:
Status: open | answered

Round summary:
Confirmed decisions:
Open questions:
Supersedes:
Next:
```

## Scope

- Maintain `.agentflow/brainstorm/<brainstorm-id>/` and `.agentflow/state.json.current_brainstorm`.
- Leave roadmap, run, ADR, spec, test plan, and source work to later workflow skills.

## Final Reply

Return the brief path, current status, unresolved questions, and next recommended skill.
