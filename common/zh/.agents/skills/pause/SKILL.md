---
name: pause
description: 暂停当前 workflow 并写 handoff。
---

# Skill: pause

读取 `.agentflow/state.json`，写 `.agentflow/handoff.md`，包含 current run、phase、已完成工作、下一步动作和 blocker。然后执行 `codex-spec state set --phase paused --blocked true`。
