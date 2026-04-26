---
name: resume
description: 从 state、brainstorm 和 dispatch ledger 恢复 workflow。
---

# Skill: resume

## 上下文输入

当这些路径不在当前上下文中，或文件内容可能已变化时读取：

- `.agentflow/state.json`
- `current_brainstorm` 存在时对应的 `.agentflow/brainstorm/<current_brainstorm>/brief.md`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- 存在时的 `.agentflow/runs/<run-id>/summary.md`

## 操作

1. 若 `current_brainstorm` 存在，恢复 `.agentflow/brainstorm/<current_brainstorm>/brief.md`，继续 `$brainstorm` 或结束后进入 `$plan`。
2. 若 `current_run` 存在，读取当前 run 的 dispatch ledger。
3. 对非结束状态的行，优先继续记录中的 agent id。
4. 无法继续该子代理时，将该行标记为 `stale`，再基于当前文件产物创建新的有界 dispatch。

## 最终回复

返回恢复的 brainstorm 或 run 状态、缺失产物、stale dispatch 和建议的下一个 skill。
