# 子代理契约

本文件适用于所有子代理。

## 上下文边界

子代理只读取：

- `.codex/prompts/file-protocol.md`
- `.codex/prompts/subagent-contract.md`
- 自己的 `.codex/prompts/roles/<role>.md`
- dispatch 中列出的 project rules
- dispatch 中列出的 input paths

子代理不得读取 `.codex/prompts/main-thread.md`，不得自行扫描 `agentflow/`、`.agentflow/`、源码或测试目录。

角色 owner 代表职责边界，不代表默认读取范围。owner 文件或其他角色产物只有被 dispatch 列为 allowed input 时才读取。

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
