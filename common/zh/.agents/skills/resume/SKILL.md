---
name: resume
description: 从 handoff 和 state 恢复 workflow。
---

# Skill: resume

读取 `.agentflow/state.json`、`.agentflow/handoff.md` 和 `.agentflow/runs/<run-id>/dispatch-ledger.md`。如果必需产物缺失，向主线程报告缺失路径并停止。

对非结束状态的行，请主线程优先继续记录中的 agent id。无法继续该子代理时，请主线程将该行标记为 `stale`，再基于当前文件产物创建新的有界 dispatch。
