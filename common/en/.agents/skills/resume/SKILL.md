---
name: resume
description: Resume workflow from handoff and state.
---

# Skill: resume

Read `.agentflow/state.json`, `.agentflow/handoff.md`, and `.agentflow/runs/<run-id>/agents.json`. If required artifacts are missing, run `codex-spec doctor`; otherwise recommend the next skill from the phase.

When `agents.json` contains `running` or `blocked` entries, try to reconnect to those agent ids before dispatching replacements. If reconnecting fails, mark the entry `stale` and dispatch a new bounded task from the current file artifacts.
