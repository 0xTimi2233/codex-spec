---
name: resume
description: 从 handoff 和 state 恢复 workflow。
---

# Skill: resume

读取 `.agentflow/state.json`、`.agentflow/handoff.md` 和 `.agentflow/runs/<run-id>/agents.json`。如果必需产物缺失，先运行 `codex-spec doctor`；否则根据 phase 建议下一个 skill。

当 `agents.json` 存在 `running` 或 `blocked` 条目时，先尝试连接已记录的 agent id。连接失败时，将条目标记为 `stale`，再基于当前文件产物派发新的有界任务。
