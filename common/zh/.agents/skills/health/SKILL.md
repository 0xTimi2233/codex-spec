---
name: health
description: 检查 scaffold 完整性和当前工作流状态。
---

# Skill: health

1. 执行 `codex-spec health`。
2. 读取 `.agentflow/state.json`。
3. 如果设置了 `current_run`，根据 `.codex/prompts/main-workflow.md` 检查当前 phase 必需文件。
4. 使用 repo-relative path 报告准确缺失路径和建议的下一个命令。
