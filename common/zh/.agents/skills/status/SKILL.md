---
name: status
description: 查看当前工作流阶段、run 和下一步动作。
---

# Skill: status

1. 执行 `codex-spec status`。
2. 读取 `.agentflow/state.json`。
3. 如果存在 `current_run`，在存在时摘要 `.agentflow/runs/<run-id>/summary.md`。
4. 读取 `agentflow/roadmap.md`，查找下一个 ready milestone。
5. 回复 mode、phase、run id、milestone、blocked flag 和建议的下一个 skill。
