---
name: spec:design
description: Update authoritative design documents, review them, and mark the run ready for execution.
---

# Skill: spec:design

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/runtime/state.json`
- `agentflow/runtime/runs/<run-id>/dispatch-ledger.md`
- `agentflow/runtime/runs/<run-id>/task.md`
- `agentflow/runtime/runs/<run-id>/pm/requirements.md`
- `agentflow/runtime/runs/<run-id>/pm/scope.md`
- `agentflow/runtime/runs/<run-id>/pm/acceptance-criteria.md`
- `agentflow/runtime/runs/<run-id>/pm/planning-summary.md`

## Procedure

1. Run `codex-spec-internal state set --phase designing --run <run-id>`.
2. Confirm a current run exists and the planning package is present before dispatching Architect. If not, stop and recommend `$spec:plan`.
3. Write `agentflow/runtime/runs/<run-id>/dispatch/architect-001.md`.
4. Use the current run planning package as Architect allowed inputs. Append the Architect dispatch row, dispatch Architect, record the runtime agent id, and update the row when the Architect response arrives.
5. Architect updates dispatch-listed `agentflow/adr/*.md` and `agentflow/spec/*.md`, then reports changed document paths and recommended implementation scope.
6. Write `agentflow/runtime/runs/<run-id>/dispatch/tester-001.md`.
7. Use Architect's changed `agentflow/` document paths and report as Tester allowed inputs. Append the Tester dispatch row, dispatch Tester, record the runtime agent id, and update the row when the Tester response arrives.
8. Tester updates dispatch-listed `agentflow/spec/test-plan/*.md`, then reports changed test-plan paths and required tests.
9. Run `codex-spec-internal state set --phase doc-reviewing --run <run-id>`.
10. Write `agentflow/runtime/runs/<run-id>/dispatch/doc-reviewer-001.md`.
11. Pass the planning package, changed `agentflow/` document paths reported by Architect and Tester, project rules, and the doc review ledger as Doc Reviewer allowed inputs. Append the Doc Reviewer row, dispatch Doc Reviewer, record the runtime agent id, and update the row when Doc Reviewer replies.
12. On pass, run `codex-spec-internal state set --phase ready-to-execute --run <run-id> --blocked false`.
13. On failure, write `agentflow/runtime/runs/<run-id>/fix-requests/doc-fix-<n>.md` and route the fix through Architect, Tester, or PM.

## Required Outputs

- updated `agentflow/adr/*.md` and `agentflow/spec/*.md` listed in Architect dispatch
- `agentflow/runtime/runs/<run-id>/architect/report.md`
- updated `agentflow/spec/test-plan/*.md` listed in Tester dispatch
- `agentflow/runtime/runs/<run-id>/tester/report.md`
- `agentflow/runtime/runs/<run-id>/doc-reviewer/review-report.md`
- `agentflow/runtime/runs/<run-id>/doc-reviewer/review-ledger.md`
- updated `agentflow/runtime/runs/<run-id>/dispatch-ledger.md`

## Next

Return changed authoritative document paths, doc review status, next step `$spec:execute`, or blocker.
