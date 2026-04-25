# AGENTS.md

本仓库使用项目本地 `codex-spec` 工作流。

优先阅读：

- `.codex/prompts/main-workflow.md`
- `.codex/prompts/file-protocol.md`
- `.codex/prompts/role-common.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

规则：

- 所有报告必须使用 repo-relative path。
- 长期项目知识写入 `agentflow/`。
- 单次任务产物写入 `.agentflow/runs/<run-id>/`。
- 子代理保持干净上下文，只写自己角色拥有的 run artifact，除非主线程明确指派。
- 主线程负责调度、整合和 gate 决策。
