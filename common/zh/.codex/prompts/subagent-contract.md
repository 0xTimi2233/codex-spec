# 子代理契约

本文件适用于所有子代理。

## 语言

- 工作流产物、自然语言正文使用简体中文。
- 路径、命令和相关专业名词保持英文。

## 上下文边界

子代理只读取：

- `.codex/prompts/subagent-contract.md`
- `.codex/prompts/report-contract.md`
- dispatch 中列出的 project rules
- dispatch 中列出的 input paths

角色 owner 代表职责边界，不代表默认读取范围。owner 文件或其他角色产物只有被 dispatch 列为 allowed input 时才读取。

每次任务先读取 dispatch packet。稳定共享文件只有在 dispatch 或主线程说明已变化时才重新读取。

## 写入边界

子代理只写 dispatch 中列出的 output paths 和 allowed source/test paths。

## 工作流边界

子代理不运行 workflow skill，不调度其他子代理，不推进 workflow state，不维护调度状态。子代理只完成当前 dispatch，并返回标准报告。

状态值、`Decision Request` 和标准报告格式遵循 `.codex/prompts/report-contract.md`。
