---
name: spec:design
description: 产出并审查当前 milestone 方案，然后创建 approved gate。
---

# Skill: spec:design

## 上下文输入

当这些路径不在当前上下文中，或文件内容可能已变化时读取：

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`

## 操作

1. 执行 `codex-spec state set --phase designing --run <run-id>`。
2. 写 `.agentflow/runs/<run-id>/dispatch/architect-001.md`。
3. 将 task 和 PM 产物路径作为 Architect allowed inputs。追加 Architect 调度行，调度 Architect，写入 runtime agent id，并在收到 Architect 回复后更新该行。
4. Architect 写设计、spec、ADR 草案。
5. 写 `.agentflow/runs/<run-id>/dispatch/tester-001.md`。
6. 将 Architect 产物路径作为 Tester allowed inputs。追加 Tester 调度行，调度 Tester，写入 runtime agent id，并在收到 Tester 回复后更新该行。
7. Tester 根据 Architect 产物写测试计划。
8. 写 `.agentflow/runs/<run-id>/dispatch/doc-reviewer-001.md`。
9. 将 PM、Architect、Tester 产物、项目规则和 doc review ledger 作为 Doc Reviewer allowed inputs。追加 Doc Reviewer 调度行，调度 Doc Reviewer，写入 runtime agent id，并在收到 Doc Reviewer 回复后更新该行。
10. 通过时写 `.agentflow/runs/<run-id>/gate.md`，包含 `status: approved`、允许源码/测试路径、必须运行的测试和 Doc Reviewer 报告路径。执行 `codex-spec state set --phase ready-to-execute --run <run-id> --blocked false`。
11. 失败时写 `.agentflow/runs/<run-id>/fix-requests/doc-fix-<n>.md`，并路由给 Architect、Tester 或 PM 修复。

## 必须产出

- `.agentflow/runs/<run-id>/architect/design.md`
- `.agentflow/runs/<run-id>/architect/spec-draft.md`
- `.agentflow/runs/<run-id>/architect/adr-draft.md`
- `.agentflow/runs/<run-id>/tester/test-plan.md`
- `.agentflow/runs/<run-id>/doc-reviewer/review-report.md`
- `.agentflow/runs/<run-id>/doc-reviewer/review-ledger.md`
- 更新后的 `.agentflow/runs/<run-id>/dispatch-ledger.md`
- 通过时：`.agentflow/runs/<run-id>/gate.md`

## 下一步

返回设计产物路径、测试计划路径、gate 状态、下一步 `$spec:execute`，或 blocker。
