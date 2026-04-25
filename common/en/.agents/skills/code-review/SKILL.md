---
name: code-review
description: Review implementation against gate, spec, test plan, coding standards, and changed files.
---

# Skill: code-review

## Read First

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/gate.md`
- `.agentflow/runs/<run-id>/developer/implementation-report.md`
- `.agentflow/runs/<run-id>/developer/changed-files.md`
- `.agentflow/runs/<run-id>/developer/test-result.md`

## Procedure

1. Run `codex-spec state set --phase code-reviewing --run <run-id>`.
2. Write `.agentflow/runs/<run-id>/dispatch/code-reviewer-001.md`.
3. Dispatch Code Reviewer.
4. Append the Code Reviewer dispatch row to `.agentflow/runs/<run-id>/dispatch-ledger.md`; update it when the Code Reviewer response arrives.
5. If test coverage review is needed, write `.agentflow/runs/<run-id>/dispatch/tester-code-review-001.md`, dispatch Tester, append the Tester row, and update it when the Tester response arrives.
6. On pass, run `codex-spec state set --phase ready-to-finish --run <run-id> --blocked false`.
7. On fail, write `.agentflow/runs/<run-id>/fix-requests/code-fix-001.md` and return to `$execute`. If a design issue is found, return to `$design`.

## Required Outputs

- `.agentflow/runs/<run-id>/code-reviewer/review-report.md`
- `.agentflow/runs/<run-id>/code-reviewer/review-ledger.md`
- updated `.agentflow/runs/<run-id>/dispatch-ledger.md`
- optional: `.agentflow/runs/<run-id>/tester/test-coverage-review.md`

## Next

Return Decision. On pass, next step `$finish`; on fail, return fix request path.
