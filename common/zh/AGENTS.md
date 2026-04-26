# AGENTS.md

本仓库使用项目本地 `codex-spec` 工作流。

主线程优先阅读：

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.codex/prompts/subagent-contract.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

规则：

- 主线程负责调度、dispatch、整合、state 推进和 run 归档。
- 子代理不得读取 `.codex/prompts/main-thread.md`。
- 子代理只读取 `.codex/prompts/subagent-contract.md`、`.codex/prompts/file-protocol.md`、自己的 role prompt、dispatch 明确列出的输入和项目规范。
- 所有报告使用 repo-relative path。
- 长期事实写入 `agentflow/`；当前 run 产物写入 `.agentflow/runs/<run-id>/`。
- `.agentflow/archives/` 是不可变历史，不作为后续 run 的上下文来源。
