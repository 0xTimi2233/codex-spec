---
name: code-review
description: 审查实现是否符合 gate、spec、test-plan、代码规范和 changed-files。
---

# Skill: code-review

## 先读

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/gate.md`
- `.agentflow/runs/<run-id>/developer/implementation-report.md`
- `.agentflow/runs/<run-id>/developer/changed-files.md`
- `.agentflow/runs/<run-id>/developer/test-result.md`

## 操作

1. 执行 `codex-spec state set --phase code-reviewing --run <run-id>`.
2. 写 `.agentflow/runs/<run-id>/dispatch/code-reviewer-001.md`。
3. 调度 Code Reviewer。
4. 在 `.agentflow/runs/<run-id>/dispatch-ledger.md` 追加 Code Reviewer 调度行；收到 Code Reviewer 回复后更新该行。
5. 如需测试覆盖审查，写 `.agentflow/runs/<run-id>/dispatch/tester-code-review-001.md` 并调度 Tester，追加 Tester 调度行，收到 Tester 回复后更新该行。
6. 通过时执行 `codex-spec state set --phase ready-to-finish --run <run-id> --blocked false`。
7. 失败时写 `.agentflow/runs/<run-id>/fix-requests/code-fix-001.md`，回到 `$execute`。若发现方案问题，回到 `$design`。

## 必须产出

- `.agentflow/runs/<run-id>/code-reviewer/review-report.md`
- `.agentflow/runs/<run-id>/code-reviewer/review-ledger.md`
- 更新后的 `.agentflow/runs/<run-id>/dispatch-ledger.md`
- 可选：`.agentflow/runs/<run-id>/tester/test-coverage-review.md`

## 下一步

返回 Decision。通过时下一步 `$finish`，失败时返回修复请求路径。
