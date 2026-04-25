---
name: pause
description: 暂停当前工作流并写 handoff。
---

# Skill: pause

1. 读取 `.agentflow/state.json`。
2. 写 `.agentflow/handoff.md`，包含当前 run、phase、已完成工作、下一步动作和 blocker。
3. 设置 phase 为 `paused`；如果需要用户动作，则设置 blocked。
4. 回复 handoff 路径和恢复方式。
