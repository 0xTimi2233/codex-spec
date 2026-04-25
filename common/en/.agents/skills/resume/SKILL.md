---
name: resume
description: Resume workflow from state and dispatch ledger.
---

# Skill: resume

Read `.agentflow/state.json`, `.agentflow/runs/<run-id>/dispatch-ledger.md`, and `.agentflow/runs/<run-id>/summary.md` when present. If required artifacts are missing, report the missing paths to the main thread and stop.

For rows whose status is not an ending status, continue the recorded agent id when possible. If continuing the agent is not possible, mark the row `stale` and create a new bounded dispatch from current file artifacts.
