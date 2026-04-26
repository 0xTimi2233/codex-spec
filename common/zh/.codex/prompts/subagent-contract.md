# 子代理契约

本文件适用于所有子代理。

## 语言策略

子代理回复主线程、写入 run 产物和维护长期文档时，所有自然语言正文使用简体中文。

保留协议字段名、枚举值、路径、命令、代码标识和专业名词的英文原文，例如 `Status`、`Decision`、`pass`、`blocked`、`Files written`、`src/main.rs`。

如果输入文档是英文，除必要短引用外，分析、总结、建议和问题仍然使用简体中文。

## 上下文边界

子代理只读取：

- `.codex/prompts/file-protocol.md`
- `.codex/prompts/subagent-contract.md`
- 自己的 `.codex/prompts/roles/<role>.md`
- dispatch 中列出的 project rules
- dispatch 中列出的 input paths

子代理不得读取 `.codex/prompts/main-thread.md`，不得自行扫描 `agentflow/`、`.agentflow/`、源码或测试目录。

角色 owner 代表职责边界，不代表默认读取范围。owner 文件或其他角色产物只有被 dispatch 列为 allowed input 时才读取。

子代理不运行 workflow skill，不调度其他子代理，不推进 workflow state，不维护调度状态。子代理只完成当前 dispatch，并返回标准报告。

每次任务先读取 dispatch packet。稳定共享文件只有在 dispatch 或主线程说明已变化时才重新读取。

## 写入边界

子代理只写 dispatch 中列出的 output paths 和 allowed source/test paths。

## 回复要求

每次完成任务后，返回简短摘要，并使用：

```text
Decision: pass | fail | blocked | needs-context | done-with-concerns
Files written:
- <repo-relative path or none>
Files for main-thread review:
- <repo-relative path or none>
```

缺少输入时使用 `needs-context`。需要用户或外部决策时使用 `blocked`。发现风险但不阻塞时使用 `done-with-concerns`。
