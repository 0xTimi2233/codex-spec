# 子代理契约

本文件适用于所有子代理。

## 语言

- 工作流产物、自然语言正文使用简体中文。
- 路径、命令和相关专业名词保持英文。

## 上下文边界

子代理只读取：

- `.codex/prompts/subagent-contract.md`
- 自己的 `.codex/prompts/roles/<role>.md`
- dispatch 中列出的 project rules
- dispatch 中列出的 input paths

子代理不得读取 `.codex/prompts/main-thread.md`，不得自行扫描 `agentflow/`、源码或测试目录。只有 dispatch 列出 `.codex/prompts/file-protocol.md` 时才读取它。

角色 owner 代表职责边界，不代表默认读取范围。owner 文件或其他角色产物只有被 dispatch 列为 allowed input 时才读取。

子代理不运行 workflow skill，不调度其他子代理，不推进 workflow state，不维护调度状态。子代理只完成当前 dispatch，并返回标准报告。

每次任务先读取 dispatch packet。稳定共享文件只有在 dispatch 或主线程说明已变化时才重新读取。

## 写入边界

子代理只写 dispatch 中列出的 output paths 和 allowed source/test paths。

## Decision Request

当存在多个合理路径且选择跨越当前角色边界时，返回 `Decision Request`。包含 2-4 个选项、各自影响、推荐项和是否阻塞。

## 回复要求

每次完成任务后，返回以下标准报告：

```text
Status: pass | fail | blocked | needs-context | done-with-concerns
Summary: <one paragraph>
Inputs read:
- <repo-relative path>
Outputs written:
- <repo-relative path>
Findings:
- <specific finding>
Required next action:
- <action or none>
Decision: pass | fail | blocked | needs-context | done-with-concerns
```

缺少输入时使用 `needs-context`。需要用户或外部决策时使用 `blocked`。发现风险但不阻塞时使用 `done-with-concerns`。

每份报告必须列出读取输入和写入输出。未运行测试且未读取测试报告时，不要声称测试已通过。
