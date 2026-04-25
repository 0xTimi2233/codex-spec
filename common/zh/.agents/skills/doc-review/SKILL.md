---
name: doc-review
description: 审查需求、设计、spec、ADR 草案和测试计划的一致性。
---

# Skill: doc-review

## 先读

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`
- `.agentflow/runs/<run-id>/architect/design.md`
- `.agentflow/runs/<run-id>/architect/spec-draft.md`
- `.agentflow/runs/<run-id>/architect/adr-draft.md`
- `.agentflow/runs/<run-id>/tester/test-plan.md`

## 操作

1. 执行 `codex-spec state set --phase doc-reviewing --run <run-id>`.
2. 写 `.agentflow/runs/<run-id>/dispatch/doc-reviewer-001.md`。
3. 在 `.agentflow/runs/<run-id>/dispatch-ledger.md` 追加 Doc Reviewer 调度行，调度 Doc Reviewer，写入 runtime agent id，并在收到 Doc Reviewer 回复后更新该行。
4. Doc Reviewer 写 review report 和 review ledger。
5. 通过时主线程写 `.agentflow/runs/<run-id>/gate.md`，并执行 `codex-spec state set --phase ready-to-execute --run <run-id> --blocked false`。
6. 失败时主线程写 `.agentflow/runs/<run-id>/fix-requests/doc-fix-001.md`，回到 `$design`。

## 必须产出

- `.agentflow/runs/<run-id>/doc-reviewer/review-report.md`
- `.agentflow/runs/<run-id>/doc-reviewer/review-ledger.md`
- 更新后的 `.agentflow/runs/<run-id>/dispatch-ledger.md`
- 通过时：`.agentflow/runs/<run-id>/gate.md`

## 下一步

返回 Decision。通过时下一步 `$execute`，失败时返回修复请求路径。
