---
name: design
description: 调度 Architect 和 Tester 产出设计、spec、ADR 草案和测试计划。
---

# Skill: design

## 先读

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`

## 操作

1. 执行 `codex-spec state set --phase designing --run <run-id>`.
2. 写 `.agentflow/runs/<run-id>/dispatch/architect-001.md`。
3. 将 task 和 PM 产物路径作为 Architect allowed inputs。追加 Architect 调度行，调度 Architect，写入 runtime agent id，并在收到 Architect 回复后更新该行。
4. Architect 写设计/spec/ADR 草案。
5. 写 `.agentflow/runs/<run-id>/dispatch/tester-001.md`。
6. 将 Architect 产物路径作为 Tester allowed inputs。追加 Tester 调度行，调度 Tester，写入 runtime agent id，并在收到 Tester 回复后更新该行。
7. Tester 根据 Architect 产物写测试计划。
8. 主线程只检查必需产物存在，不做文档质量审查。

## 必须产出

- `.agentflow/runs/<run-id>/architect/design.md`
- `.agentflow/runs/<run-id>/architect/spec-draft.md`
- `.agentflow/runs/<run-id>/architect/adr-draft.md`
- `.agentflow/runs/<run-id>/tester/test-plan.md`
- 更新后的 `.agentflow/runs/<run-id>/dispatch-ledger.md`

## 下一步

返回设计产物路径、测试计划路径、下一步 `$doc-review`，或 blocker。
