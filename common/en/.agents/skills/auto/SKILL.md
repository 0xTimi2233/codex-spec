---
name: auto
description: Run roadmap milestones automatically with clean subagent contexts per milestone.
---

# Skill: auto

## Read first

- `.codex/prompts/main-workflow.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

## Procedure

1. Run `$health` equivalent checks.
2. Select the first `Status: ready` milestone whose dependencies are satisfied.
3. For that milestone, run `$plan -> $execute -> $review -> $finish`.
4. After finish, close all subagent contexts and start the next milestone with fresh subagents.
5. Stop only when no ready milestone exists or a blocker appears.

## Must stop when

- roadmap dependency is not satisfied;
- required user decision is missing;
- hook blocks a transition;
- tests or review repeatedly fail;
- high-risk or destructive action is required.

## Final reply

Return completed milestones, current state, next ready milestone if any, and blocker if stopped.
