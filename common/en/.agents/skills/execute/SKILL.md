---
name: execute
description: Complete the current milestone from an approved gate through implementation, review, verification, archive, and commit.
---

# Skill: execute

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/gate.md`

## Procedure

1. Confirm `.agentflow/runs/<run-id>/gate.md` exists, has `status: approved`, and covers the source/test paths needed for this execution.
2. Run `codex-spec state set --phase executing --run <run-id>`.
3. Write `.agentflow/runs/<run-id>/dispatch/developer-001.md` with allowed input and write scope.
4. Use gate, approved design, and test-plan paths as Developer allowed inputs. Append the Developer dispatch row, dispatch Developer, record the runtime agent id, and update the row when the Developer response arrives.
5. Developer writes implementation report, changed files, and test result.
6. Run `codex-spec state set --phase code-reviewing --run <run-id>`.
7. Dispatch Code Reviewer with gate, Developer outputs, relevant source/test paths, coding standards, and review ledger.
8. Dispatch Tester when test result coverage needs checking against the test plan.
9. On review failure, write `.agentflow/runs/<run-id>/fix-requests/code-fix-<n>.md` and route to Developer, Architect, Tester, or PM.
10. On review pass, run `codex-spec state set --phase ready-to-finish --run <run-id> --blocked false`.
11. Collect acceptance evidence into `.agentflow/runs/<run-id>/verification.md`.
12. Run `codex-spec state set --phase finishing --run <run-id>`.
13. Dispatch Auditor to summarize the run.
14. Dispatch owners to sync long-lived docs when needed.
15. Write `.agentflow/runs/<run-id>/summary.md`.
16. Confirm `dispatch-ledger.md` has no `queued`, `running`, or `blocked` rows.
17. Run `codex-spec archive --run <run-id>`.
18. Run `codex-spec state set --phase idle --run null --milestone null --blocked false`.
19. Commit the completed milestone changes with a short user-facing commit message. If there are no file changes, record the no-op in summary and do not create an empty commit.
20. Close the milestone subagent context.

## Required Outputs

- `.agentflow/runs/<run-id>/developer/implementation-report.md`
- `.agentflow/runs/<run-id>/developer/changed-files.md`
- `.agentflow/runs/<run-id>/developer/test-result.md`
- `.agentflow/runs/<run-id>/code-reviewer/review-report.md`
- `.agentflow/runs/<run-id>/code-reviewer/review-ledger.md`
- `.agentflow/runs/<run-id>/verification.md`
- `.agentflow/runs/<run-id>/auditor/audit-report.md`
- `.agentflow/runs/<run-id>/summary.md`
- updated `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/archives/<run-id>/`
- milestone git commit or summary no-op record

## Next

Return milestone result, archive path, commit status, next recommended milestone action, or blocker.
