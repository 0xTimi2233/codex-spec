---
name: design
description: Dispatch Architect and Tester to produce design, spec, ADR draft, and test plan.
---

# Skill: design

## Read First

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`

## Procedure

1. Run `codex-spec state set --phase designing --run <run-id>`.
2. Write `.agentflow/runs/<run-id>/dispatch/architect-001.md`.
3. Append the Architect dispatch row to `.agentflow/runs/<run-id>/dispatch-ledger.md`, dispatch Architect, record the runtime agent id, and update the row when the Architect response arrives.
4. Architect writes design/spec/ADR drafts.
5. Write `.agentflow/runs/<run-id>/dispatch/tester-001.md`.
6. Append the Tester dispatch row to `.agentflow/runs/<run-id>/dispatch-ledger.md`, dispatch Tester, record the runtime agent id, and update the row when the Tester response arrives.
7. Tester writes a test plan from Architect artifacts.
8. Main thread checks artifact existence only; it does not perform document quality review.

## Required Outputs

- `.agentflow/runs/<run-id>/architect/design.md`
- `.agentflow/runs/<run-id>/architect/spec-draft.md`
- `.agentflow/runs/<run-id>/architect/adr-draft.md`
- `.agentflow/runs/<run-id>/tester/test-plan.md`
- updated `.agentflow/runs/<run-id>/dispatch-ledger.md`

## Next

Return design artifact paths, test plan path, next step `$doc-review`, or blocker.
