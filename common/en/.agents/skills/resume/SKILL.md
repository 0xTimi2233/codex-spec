---
name: resume
description: Resume workflow from handoff and state.
---

# Skill: resume

Read `.agentflow/handoff.md` and `.agentflow/state.json`. If required artifacts are missing, run `$doctor`; otherwise recommend the next skill from the phase.

Resume from durable files only. Do not assume an earlier subagent process is still attached after the terminal exits; continue by dispatching the remaining work from the current run state.
