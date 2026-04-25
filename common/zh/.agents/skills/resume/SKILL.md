---
name: resume
description: 从 handoff 和 state 恢复 workflow。
---

# Skill: resume

读取 `.agentflow/handoff.md` 和 `.agentflow/state.json`。如果必需产物缺失，先运行 `$health`；否则根据 phase 建议下一个 skill。
