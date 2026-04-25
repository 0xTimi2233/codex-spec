---
name: finish
description: 总结 run、同步长期文档、归档 run，并清空当前 run。
---

# Skill: finish

## 先读

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/gate.md`
- `.agentflow/runs/<run-id>/code-reviewer/review-report.md`

## 操作

1. 确认 phase 为 `ready-to-finish`。
2. 执行 `codex-spec state set --phase finishing --run <run-id>`.
3. 写 `.agentflow/runs/<run-id>/dispatch/auditor-001.md` 并调度 Auditor。
4. Owner 按 dispatch 同步长期文件：PM 同步 roadmap/vision，Architect 同步 ADR/spec，Tester 同步 test-plan。
5. 主线程写 `.agentflow/runs/<run-id>/summary.md`。
6. 执行 `codex-spec archive --run <run-id>`。
7. 执行 `codex-spec state set --phase idle --run null --milestone null --blocked false`。
8. 提交当前 milestone 的代码、测试和文档变化；提交信息包含 run id 或 milestone id。若没有文件变化，在 summary 记录 no-op，不创建空提交。
9. 结束当前 milestone 的子代理上下文。

## 必须产出

- `.agentflow/runs/<run-id>/auditor/audit-report.md`
- `.agentflow/runs/<run-id>/summary.md`
- `.agentflow/archives/<run-id>/`
- 当前 milestone 的 git commit，或 summary 中的 no-op 记录

## 下一步

返回归档路径和 idle 状态。
