---
name: status
description: 查看当前 workflow state、run 和下一步建议。
---

# Skill: status

执行 `codex-spec status`，读取 `.agentflow/state.json`、当前 run dispatch ledger 和当前 run 摘要，返回 phase、run id、blocked flag、未结束调度和建议的下一个 skill。
