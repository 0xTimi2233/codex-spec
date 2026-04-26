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

## Procedure

1. Run `codex-spec state set --phase code-reviewing --run <run-id>`.
2. Write `.agentflow/runs/<run-id>/dispatch/code-reviewer-001.md`.
3. Use gate and Developer artifact paths as Code Reviewer allowed inputs. Append the Code Reviewer dispatch row, dispatch Code Reviewer, record the runtime agent id, and update the row when the Code Reviewer response arrives.
4. If test coverage review is needed, write `.agentflow/runs/<run-id>/dispatch/tester-code-review-001.md`, append the Tester row, dispatch Tester, record the runtime agent id, and update the row when the Tester response arrives.
5. On pass, run `codex-spec state set --phase ready-to-finish --run <run-id> --blocked false`.
6. On fail, write `.agentflow/runs/<run-id>/fix-requests/code-fix-001.md` and return to `$execute`. If a design issue is found, return to `$design`.

## Required Outputs

- `.agentflow/runs/<run-id>/code-reviewer/review-report.md`
- `.agentflow/runs/<run-id>/code-reviewer/review-ledger.md`
- updated `.agentflow/runs/<run-id>/dispatch-ledger.md`
- optional: `.agentflow/runs/<run-id>/tester/test-coverage-review.md`

## Next

Return Decision. On pass, next step `$verify`; on fail, return fix request path.
