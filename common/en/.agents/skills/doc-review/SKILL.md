---
name: doc-review
description: Review consistency across requirements, design, spec, ADR draft, and test plan.
---

# Skill: doc-review

## Read First

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`

## Procedure

1. Run `codex-spec state set --phase doc-reviewing --run <run-id>`.
2. Write `.agentflow/runs/<run-id>/dispatch/doc-reviewer-001.md`.
3. Use PM, Architect, and Tester artifact paths as Doc Reviewer allowed inputs. Append the Doc Reviewer dispatch row, dispatch Doc Reviewer, record the runtime agent id, and update the row when the Doc Reviewer response arrives.
4. Doc Reviewer writes review report and review ledger.
5. On pass, main thread writes `.agentflow/runs/<run-id>/gate.md` and runs `codex-spec state set --phase ready-to-execute --run <run-id> --blocked false`.
6. On fail, main thread writes `.agentflow/runs/<run-id>/fix-requests/doc-fix-001.md` and returns to `$design`.

## Required Outputs

- `.agentflow/runs/<run-id>/doc-reviewer/review-report.md`
- `.agentflow/runs/<run-id>/doc-reviewer/review-ledger.md`
- updated `.agentflow/runs/<run-id>/dispatch-ledger.md`
- on pass: `.agentflow/runs/<run-id>/gate.md`

## Next

Return Decision. On pass, next step `$execute`; on fail, return fix request path.
