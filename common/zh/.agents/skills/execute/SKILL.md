---
name: execute
description: 通过 Developer 角色执行 approved plan。
---

# Skill: execute

## 先读

- `.codex/prompts/main-workflow.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/gate.md`

## 操作规程

1. 确认 phase 是 `ready-to-execute` 或 `executing`。
2. 修改源码前执行 `codex-spec state set --phase executing --run <run-id>`。
3. spawn Developer，并传入准确 run id 和 approved file scope。
4. Developer 写：
   - `.agentflow/runs/<run-id>/developer/implementation-report.md`
   - `.agentflow/runs/<run-id>/developer/changed-files.md`
5. 主线程检查报告，并设置 `ready-to-review` 或 `blocked`。

## Blocked 条件

- 缺少 `.agentflow/runs/<run-id>/gate.md`；
- 实现需要修改设计；
- 测试失败且超出 approved plan；
- 源码修改超过 approved scope。

## 最终回复

返回修改文件、执行命令、测试状态，以及下一个命令 `$review` 或 blocker。
