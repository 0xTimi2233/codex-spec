---
name: finish
description: 总结 run、同步长期文档、归档 run，并清空当前 run。
---

# Skill: finish

## 先读

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/gate.md`
- `.agentflow/runs/<run-id>/code-reviewer/review-report.md`

## 操作

1. 确认 phase 为 `ready-to-finish`。
2. 执行 `codex-spec state set --phase finishing --run <run-id>`.
3. 写 `.agentflow/runs/<run-id>/dispatch/auditor-001.md`。
4. 在 `.agentflow/runs/<run-id>/dispatch-ledger.md` 追加 Auditor 调度行，调度 Auditor，写入 runtime agent id，并在收到 Auditor 回复后更新该行。
5. Owner 按 dispatch 同步长期文件：PM 同步 roadmap/vision，Architect 同步 ADR/spec，Tester 同步 test-plan。每次 owner 同步都追加调度行、写入 runtime agent id，并更新该行。
6. 主线程写 `.agentflow/runs/<run-id>/summary.md`。
7. 归档前确认 `.agentflow/runs/<run-id>/dispatch-ledger.md` 没有 `queued`、`running` 或 `blocked` 行。
8. 执行 `codex-spec archive --run <run-id>`。
9. 执行 `codex-spec state set --phase idle --run null --milestone null --blocked false`。
10. 提交当前 milestone 的代码、测试和文档变化；提交信息应简洁描述用户可见变更。若没有文件变化，在 summary 记录 no-op，不创建空提交。
11. 结束当前 milestone 的子代理上下文。

## 必须产出

- `.agentflow/runs/<run-id>/auditor/audit-report.md`
- `.agentflow/runs/<run-id>/summary.md`
- 完成后的 `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/archives/<run-id>/`
- 当前 milestone 的 git commit，或 summary 中的 no-op 记录

## 下一步

返回归档路径和 idle 状态。
