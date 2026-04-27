# 报告契约

本文件定义共享状态和回复格式。

## 语言要求

- 工作流产物、自然语言正文使用简体中文。
- 路径、命令和相关专业名词保持英文。

## 状态值

子代理报告使用以下值之一：

- `pass`：任务通过，可以继续。
- `fail`：发现阻塞缺陷。
- `blocked`：需要用户、外部系统或破坏性操作决策。
- `needs-context`：缺少必要输入路径或指令。
- `done-with-concerns`：任务完成，但仍有非阻塞风险。

## Decision Request

当存在多个合理路径且选择跨越当前角色边界时，返回 `Decision Request`。

包含：

- 2-4 个编号选项
- 每个选项的影响
- 推荐项
- 是否阻塞推进

## 标准报告

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
```

每份报告必须列出读取输入和写入输出。`done-with-concerns` 仅在 `Required next action` 存在明确动作时路由。未运行测试且未读取测试报告时，不要声称测试已通过。
