---
name: status
description: Show current workflow phase, run, and next action.
---

# Skill: status

1. Run `codex-spec status`.
2. Read `.agentflow/state.json`.
3. If `current_run` exists, summarize `.agentflow/runs/<run-id>/summary.md` when present.
4. Read `agentflow/roadmap.md` for the next ready milestone.
5. Reply with mode, phase, run id, milestone, blocked flag, and next recommended skill.
