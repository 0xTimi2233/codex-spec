---
name: spec:auto
description: 按 roadmap 串行执行 milestone，直到阻塞或完成。
---

# Skill: spec:auto

## 上下文输入

当这些路径不在当前上下文中，或文件内容可能已变化时读取：

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `codexspec/roadmap.md`
- `codexspec/runtime/state.json`

## 操作

用户在 `$spec:auto` 后提供 inline requirement 时，将该需求作为 `$spec:plan` 输入，然后继续执行产出的 milestone 的 `$spec:design` 和 `$spec:execute`。

没有 inline requirement 且没有已确认 roadmap 时停止，并建议执行 `$spec:plan`。

对每个 roadmap milestone，创建或恢复对应 run，并执行：

```text
$spec:design -> $spec:execute
```

若 milestone run 不存在，使用 `$spec:plan` 行为从 roadmap 条目创建 run task。每个节点结束后使用 `codexspec/runtime/state.json`、调度状态和子代理回报。

## 打回与停止

使用主线程的“打回与路由”规则。被路由的修复回到对应工作流节点或 review step 后，`$spec:auto` 继续自动推进。只有该规则判定无法安全路由时才停止。

## Milestone 提交

开始下一 milestone 前，执行主线程的“Milestone 边界”规则。

## 最终回复

返回已完成 milestones、路由修复或停止原因、当前 state、相关 report/fix-request 路径、milestone 提交状态，以及建议用户执行的下一步。
