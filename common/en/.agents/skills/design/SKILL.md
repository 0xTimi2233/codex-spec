---
name: design
description: Update authoritative design documents, review them, and mark the run ready for execution.
---

# Skill: design

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.codex/prompts/main-thread.md`
- `codexspec/runtime/state.json`
- `codexspec/runtime/runs/<run-id>/dispatch-ledger.md`
- `codexspec/runtime/runs/<run-id>/task.md`
- `codexspec/runtime/runs/<run-id>/pm/requirements.md`
- `codexspec/runtime/runs/<run-id>/pm/scope.md`
- `codexspec/runtime/runs/<run-id>/pm/acceptance-criteria.md`
- `codexspec/runtime/runs/<run-id>/pm/planning-summary.md`

## Procedure

1. Before dispatching Architect, confirm `state.current_run` exists, the current phase can enter design, and `dispatch-ledger.md` plus the planning package are present. If not, stop and recommend `$plan` or `$resume` without mutating state.
2. After validation passes, run `codex-spec-internal state set --phase designing --run <run-id>`.
3. Write `codexspec/runtime/runs/<run-id>/dispatch/architect-001.md`.
4. Use the current run planning package as Architect allowed inputs. Append the Architect dispatch row, dispatch Architect, record the runtime agent id, and update the row when the Architect response arrives.
5. Architect updates dispatch-listed `codexspec/adr/*.md` and `codexspec/spec/*.md`, then reports changed document paths and recommended implementation scope.
6. Write `codexspec/runtime/runs/<run-id>/dispatch/tester-001.md`.
7. Use the planning package, Architect's changed `codexspec/` document paths, and Architect report as Tester allowed inputs. Append the Tester dispatch row, dispatch Tester, record the runtime agent id, and update the row when the Tester response arrives.
8. Tester updates dispatch-listed `codexspec/spec/test-plan/*.md`, then reports changed test-plan paths and required tests.
9. Run `codex-spec-internal state set --phase doc-reviewing --run <run-id>`.
10. Write `codexspec/runtime/runs/<run-id>/dispatch/doc-reviewer-001.md`.
11. Pass the planning package, changed `codexspec/` document paths reported by Architect and Tester, project rules, and the doc review ledger as Doc Reviewer allowed inputs. Append the Doc Reviewer row, dispatch Doc Reviewer, record the runtime agent id, and update the row when Doc Reviewer replies.
12. On pass, run `codex-spec-internal state set --phase ready-to-execute --run <run-id> --blocked false`.
13. On failure, write `codexspec/runtime/runs/<run-id>/fix-requests/doc-fix-<n>.md` and route the fix through Architect, Tester, or PM.

## Required Outputs

- updated `codexspec/adr/*.md` and `codexspec/spec/*.md` listed in Architect dispatch
- `codexspec/runtime/runs/<run-id>/architect/report.md`
- updated `codexspec/spec/test-plan/*.md` listed in Tester dispatch
- `codexspec/runtime/runs/<run-id>/tester/report.md`
- `codexspec/runtime/runs/<run-id>/doc-reviewer/review-report.md`
- `codexspec/runtime/runs/<run-id>/doc-reviewer/review-ledger.md`
- updated `codexspec/runtime/runs/<run-id>/dispatch-ledger.md`

## Next

Return changed authoritative document paths, doc review status, next step `$execute`, or blocker.
