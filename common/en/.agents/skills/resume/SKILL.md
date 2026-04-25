---
name: resume
description: Resume workflow from handoff and state.
---

# Skill: resume

Read `.agentflow/state.json`, `.agentflow/handoff.md`, and `.agentflow/runs/<run-id>/dispatch-ledger.md`. If required artifacts are missing, report the missing paths to the main thread and stop.

For rows whose status is not an ending status, ask the main thread to continue the recorded agent id when possible. If continuing the agent is not possible, ask the main thread to mark the row `stale` and create a new bounded dispatch from current file artifacts.
