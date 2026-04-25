---
name: review
description: 在 finish 前评审实现、测试和性能风险。
---

# Skill: review

## 先读

- `.codex/prompts/main-workflow.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/gate.md`
- `.agentflow/runs/<run-id>/developer/implementation-report.md`
- `.agentflow/runs/<run-id>/developer/changed-files.md`

## 操作规程

1. 确认 phase 是 `ready-to-review` 或 `reviewing`。
2. 执行 `codex-spec state set --phase reviewing --run <run-id>`。
3. spawn Reviewer 和 Tester。
4. 如果涉及热路径、并发、缓存、I/O 或底层代码，额外 spawn Performance。
5. 必须产出：
   - `.agentflow/runs/<run-id>/reviewer/review-report.md`
   - `.agentflow/runs/<run-id>/tester/test-report.md`
   - 可选 `.agentflow/runs/<run-id>/performance/performance-report.md`
6. 如果通过，设置 `ready-to-finish`；如果失败，设置 `executing` 并把修复要求写入 `.agentflow/runs/<run-id>/summary.md`。

## 最终回复

返回 pass/fail/blocked、报告路径，以及下一个命令 `$finish` 或 `$execute`。
