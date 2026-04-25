---
name: resume
description: 从 handoff 和 state 文件恢复工作流。
---

# Skill: resume

1. 读取 `.agentflow/handoff.md`。
2. 读取 `.agentflow/state.json`。
3. 如果设置了 `current_run`，确认对应目录存在。
4. 根据 `.codex/prompts/main-workflow.md` 决定下一个 skill。
5. 如果必需产物缺失，不继续执行；先运行 `$health`。
