---
name: spec:design
description: Produce and review the current milestone design, then create an approved gate.
---

# Skill: spec:design

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`
- `.agentflow/runs/<run-id>/pm/scope.md`
- `.agentflow/runs/<run-id>/pm/acceptance-criteria.md`
- `.agentflow/runs/<run-id>/pm/planning-summary.md`

## Procedure

1. Run `codex-spec-internal state set --phase designing --run <run-id>`.
2. Confirm a current run exists and the planning package is present before dispatching Architect. If not, stop and recommend `$spec:plan`.
3. Write `.agentflow/runs/<run-id>/dispatch/architect-001.md`.
4. Use the current run planning package as Architect allowed inputs. Append the Architect dispatch row, dispatch Architect, record the runtime agent id, and update the row when the Architect response arrives.
5. Architect writes design/spec/ADR drafts.
6. Write `.agentflow/runs/<run-id>/dispatch/tester-001.md`.
7. Use Architect artifact paths as Tester allowed inputs. Append the Tester dispatch row, dispatch Tester, record the runtime agent id, and update the row when the Tester response arrives.
8. Tester writes a test plan from Architect artifacts.
9. Run `codex-spec-internal state set --phase doc-reviewing --run <run-id>`.
10. Write `.agentflow/runs/<run-id>/dispatch/doc-reviewer-001.md`.
11. Pass the planning package, Architect artifacts, Tester artifacts, project rules, and the doc review ledger as Doc Reviewer allowed inputs. Append the Doc Reviewer row, dispatch Doc Reviewer, record the runtime agent id, and update the row when Doc Reviewer replies.
12. On pass, write `.agentflow/runs/<run-id>/gate.md` with `status: approved`, allowed source/test paths, required tests, and the Doc Reviewer report path. Run `codex-spec-internal state set --phase ready-to-execute --run <run-id> --blocked false`.
13. On failure, write `.agentflow/runs/<run-id>/fix-requests/doc-fix-<n>.md` and route the fix through Architect, Tester, or PM.

## Required Outputs

- `.agentflow/runs/<run-id>/architect/design.md`
- `.agentflow/runs/<run-id>/architect/spec-draft.md`
- `.agentflow/runs/<run-id>/architect/adr-draft.md`
- `.agentflow/runs/<run-id>/tester/test-plan.md`
- `.agentflow/runs/<run-id>/doc-reviewer/review-report.md`
- `.agentflow/runs/<run-id>/doc-reviewer/review-ledger.md`
- updated `.agentflow/runs/<run-id>/dispatch-ledger.md`
- on pass: `.agentflow/runs/<run-id>/gate.md`

## Next

Return design artifact paths, test plan path, gate status, next step `$spec:execute`, or blocker.
