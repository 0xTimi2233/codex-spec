---
name: health
description: Check scaffold integrity and current workflow state.
---

# Skill: health

1. Run `codex-spec health`.
2. Read `.agentflow/state.json`.
3. If `current_run` is set, check required run files for the current phase using `.codex/prompts/main-workflow.md`.
4. Report exact missing repo-relative paths and suggested next command.
