---
name: auto
description: 按 roadmap 串行执行 milestone，直到阻塞或完成。
---

# Skill: auto

## 上下文输入

当这些路径不在当前上下文中，或文件内容可能已变化时读取：

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

## 操作

没有已确认 roadmap 时停止，并建议执行 `$plan`。

对每个 roadmap milestone，创建或恢复对应 run，并执行：

```text
$design -> $execute
```

若 milestone run 不存在，使用 `$plan` 行为从 roadmap 条目创建 run task。每个节点结束后使用 `.agentflow/state.json`、调度状态和子代理回报。

## 打回与停止

出现打回或非通过结论时，主线程根据子代理回报写或更新 `.agentflow/runs/<run-id>/fix-requests/*.md`。若责任角色、允许输入路径和允许输出路径明确，调度对应子代理处理，并在修复后回到对应工作流节点或 review gate。

只有以下情况停止自动推进：

- 主线程无法判断责任角色、修复范围或下一步 gate。
- 需要用户、外部系统或破坏性操作决策。
- 必需产物缺失，且无法通过明确 dispatch 补齐。
- 同一 open issue 经修复后仍缺少可执行下一步。
- `.agentflow/state.json.blocked = true`。

停止时，主线程写 `.agentflow/runs/<run-id>/summary.md`，报告状态、原因、最新证据路径和建议下一步。

## Milestone 提交

当 `$execute` 完成归档和 state 清理后，主线程提交当前 milestone 的代码、测试和文档变化；提交完成后才能开始下一 milestone。若没有文件变化，不创建空提交，并在 summary 中记录 no-op。

## 最终回复

返回已完成 milestones、路由修复或停止原因、当前 state、相关 report/fix-request 路径、milestone 提交状态，以及建议用户执行的下一步。
