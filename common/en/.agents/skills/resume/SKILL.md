---
name: resume
description: Resume from handoff and state files.
---

# Skill: resume

1. Read `.agentflow/handoff.md`.
2. Read `.agentflow/state.json`.
3. Verify the `current_run` directory exists when set.
4. Decide the next skill from `.codex/prompts/main-workflow.md`.
5. Do not continue if required artifacts are missing; run `$health` first.
