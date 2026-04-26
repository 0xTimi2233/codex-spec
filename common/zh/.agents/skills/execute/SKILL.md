---
name: execute
description: 从 approved gate 开始完成当前 milestone 的实现、审查、验证、归档和提交。
---

# Skill: execute

## 上下文输入

当这些路径不在当前上下文中，或文件内容可能已变化时读取：

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/gate.md`

## 操作

1. 确认 `.agentflow/runs/<run-id>/gate.md` 存在、包含 `status: approved`，并覆盖本次执行需要写入的源码/测试路径。
2. 执行 `codex-spec state set --phase executing --run <run-id>`。
3. 写 `.agentflow/runs/<run-id>/dispatch/developer-001.md`，列出允许读取和写入的文件范围。
4. 将 gate、已通过的设计和 test-plan 路径作为 Developer allowed inputs。追加 Developer 调度行，调度 Developer，写入 runtime agent id，并在收到 Developer 回复后更新该行。
5. Developer 写 implementation report、changed files、test result。
6. 执行 `codex-spec state set --phase code-reviewing --run <run-id>`。
7. 调度 Code Reviewer，输入包括 gate、Developer 产物、相关源码/测试路径、代码规范和 review ledger。
8. 当测试结果需要对照 test plan 做覆盖审查时，调度 Tester。
9. review 失败时，写 `.agentflow/runs/<run-id>/fix-requests/code-fix-<n>.md`，并路由给 Developer、Architect、Tester 或 PM。
10. review 通过时，执行 `codex-spec state set --phase ready-to-finish --run <run-id> --blocked false`。
11. 将验收证据写入 `.agentflow/runs/<run-id>/verification.md`。
12. 执行 `codex-spec state set --phase finishing --run <run-id>`。
13. 调度 Auditor 总结当前 run。
14. 需要同步长期文档时，调度对应 owner。
15. 写 `.agentflow/runs/<run-id>/summary.md`。
16. 确认 `dispatch-ledger.md` 没有 `queued`、`running` 或 `blocked` 行。
17. 执行 `codex-spec archive --run <run-id>`。
18. 执行 `codex-spec state set --phase idle --run null --milestone null --blocked false`。
19. 用简洁的用户可见 commit message 提交完成的 milestone 变更。若没有文件变化，在 summary 记录 no-op，不创建空提交。
20. 结束当前 milestone 的子代理上下文。

## 必须产出

- `.agentflow/runs/<run-id>/developer/implementation-report.md`
- `.agentflow/runs/<run-id>/developer/changed-files.md`
- `.agentflow/runs/<run-id>/developer/test-result.md`
- `.agentflow/runs/<run-id>/code-reviewer/review-report.md`
- `.agentflow/runs/<run-id>/code-reviewer/review-ledger.md`
- `.agentflow/runs/<run-id>/verification.md`
- `.agentflow/runs/<run-id>/auditor/audit-report.md`
- `.agentflow/runs/<run-id>/summary.md`
- 更新后的 `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/archives/<run-id>/`
- milestone git commit，或 summary 中的 no-op 记录

## 下一步

返回 milestone 结果、归档路径、提交状态、建议的下一 milestone 动作，或 blocker。
