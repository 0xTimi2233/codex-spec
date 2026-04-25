---
name: design
description: Dispatch Architect and Tester to produce design, spec, ADR draft, and test plan.
---

# Skill: design

## Read First

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`

## Procedure

1. Run `codex-spec state set --phase designing --run <run-id>`.
2. Write `.agentflow/runs/<run-id>/dispatch/architect-001.md` and dispatch Architect.
3. Architect writes design/spec/ADR drafts.
4. Write `.agentflow/runs/<run-id>/dispatch/tester-001.md` and dispatch Tester.
5. Tester writes a test plan from Architect artifacts.
6. Main thread checks artifact existence only; it does not perform document quality review.

## Required Outputs

- `.agentflow/runs/<run-id>/architect/design.md`
- `.agentflow/runs/<run-id>/architect/spec-draft.md`
- `.agentflow/runs/<run-id>/architect/adr-draft.md`
- `.agentflow/runs/<run-id>/tester/test-plan.md`

## Next

Return design artifact paths, test plan path, next step `$doc-review`, or blocker.
