---
name: design
description: 更新权威设计文档、完成审查，并将 run 标记为可执行。
---

# Skill: design

## 上下文输入

当这些路径不在当前上下文中，或文件内容可能已变化时读取：

- `.codex/prompts/main-thread.md`
- `codexspec/runtime/state.json`
- `codexspec/runtime/runs/<run-id>/dispatch-ledger.md`
- `codexspec/runtime/runs/<run-id>/task.md`
- `codexspec/runtime/runs/<run-id>/pm/requirements.md`
- `codexspec/runtime/runs/<run-id>/pm/scope.md`
- `codexspec/runtime/runs/<run-id>/pm/acceptance-criteria.md`
- `codexspec/runtime/runs/<run-id>/pm/planning-summary.md`

## 操作

1. 调度 Architect 前，确认 `state.current_run` 存在、当前 phase 可进入 design、`dispatch-ledger.md` 和 planning package 已存在。否则停止并建议 `$plan` 或 `$resume`，不要修改 state。
2. 校验通过后，执行 `codex-spec-internal state set --phase designing --run <run-id>`。
3. 写 `codexspec/runtime/runs/<run-id>/dispatch/architect-001.md`。
4. 将当前 run 的 planning package 作为 Architect allowed inputs。追加 Architect 调度行，调度 Architect，写入 runtime agent id，并在收到 Architect 回复后更新该行。
5. Architect 更新 dispatch 列出的 `codexspec/adr/*.md` 和 `codexspec/spec/*.md`，并在报告中列出变更文档路径和建议实现范围。
6. 写 `codexspec/runtime/runs/<run-id>/dispatch/tester-001.md`。
7. 将 planning package、Architect 变更的 `codexspec/` 文档路径和报告作为 Tester allowed inputs。追加 Tester 调度行，调度 Tester，写入 runtime agent id，并在收到 Tester 回复后更新该行。
8. Tester 更新 dispatch 列出的 `codexspec/spec/test-plan/*.md`，并在报告中列出变更 test-plan 路径和 required tests。
9. 执行 `codex-spec-internal state set --phase doc-reviewing --run <run-id>`。
10. 写 `codexspec/runtime/runs/<run-id>/dispatch/doc-reviewer-001.md`。
11. 将 planning package、Architect 和 Tester 报告列出的 `codexspec/` 变更文档路径、项目规则和 doc review ledger 作为 Doc Reviewer allowed inputs。追加 Doc Reviewer 调度行，调度 Doc Reviewer，写入 runtime agent id，并在收到 Doc Reviewer 回复后更新该行。
12. 通过时执行 `codex-spec-internal state set --phase ready-to-execute --run <run-id> --blocked false`。
13. 失败时写 `codexspec/runtime/runs/<run-id>/fix-requests/doc-fix-<n>.md`，并路由给 Architect、Tester 或 PM 修复。

## 必须产出

- Architect dispatch 列出的更新后 `codexspec/adr/*.md` 和 `codexspec/spec/*.md`
- `codexspec/runtime/runs/<run-id>/architect/report.md`
- Tester dispatch 列出的更新后 `codexspec/spec/test-plan/*.md`
- `codexspec/runtime/runs/<run-id>/tester/report.md`
- `codexspec/runtime/runs/<run-id>/doc-reviewer/review-report.md`
- `codexspec/runtime/runs/<run-id>/doc-reviewer/review-ledger.md`
- 更新后的 `codexspec/runtime/runs/<run-id>/dispatch-ledger.md`

## 下一步

返回变更后的权威文档路径、doc review 状态、下一步 `$execute`，或 blocker。
