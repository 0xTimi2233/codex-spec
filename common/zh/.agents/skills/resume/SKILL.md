---
name: resume
description: 从 state 和 dispatch ledger 恢复 workflow。
---

# Skill: resume

读取 `.agentflow/state.json`、`.agentflow/runs/<run-id>/dispatch-ledger.md`，以及存在时的 `.agentflow/runs/<run-id>/summary.md`。如果必需产物缺失，向主线程报告缺失路径并停止。

对非结束状态的行，优先继续记录中的 agent id。无法继续该子代理时，将该行标记为 `stale`，再基于当前文件产物创建新的有界 dispatch。
