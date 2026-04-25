---
name: pause
description: Pause the current workflow and write handoff.
---

# Skill: pause

Read `.agentflow/state.json`, write `.agentflow/handoff.md` with current run, phase, completed work, next action, and blocker. Then run `codex-spec state set --phase paused --blocked true`.
