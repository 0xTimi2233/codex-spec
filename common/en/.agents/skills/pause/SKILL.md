---
name: pause
description: Pause the current workflow and write a handoff.
---

# Skill: pause

1. Read `.agentflow/state.json`.
2. Write `.agentflow/handoff.md` with current run, phase, completed work, next action, and blockers.
3. Set phase to `paused` and set `blocked` when user action is required.
4. Reply with the handoff path and how to resume.
