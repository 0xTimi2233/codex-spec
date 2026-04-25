---
name: execute
description: Dispatch Developer to implement code and test code from the approved gate.
---

# Skill: execute

## Read First

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/gate.md`
- `.agentflow/runs/<run-id>/tester/test-plan.md`

## Procedure

1. Confirm `.agentflow/runs/<run-id>/gate.md` exists.
2. Run `codex-spec state set --phase executing --run <run-id>`.
3. Write `.agentflow/runs/<run-id>/dispatch/developer-001.md` with allowed input and write scope.
4. Dispatch Developer.
5. Append the Developer dispatch row to `.agentflow/runs/<run-id>/dispatch-ledger.md`; update it when the Developer response arrives.
6. Developer writes implementation report, changed files, and test result.

## Required Outputs

- `.agentflow/runs/<run-id>/developer/implementation-report.md`
- `.agentflow/runs/<run-id>/developer/changed-files.md`
- `.agentflow/runs/<run-id>/developer/test-result.md`
- updated `.agentflow/runs/<run-id>/dispatch-ledger.md`

## Next

Return changed files, commands, test status, next step `$code-review`, or blocker.
