---
name: verify
description: Collect acceptance evidence from the approved gate, test plan, implementation report, and review result before finish.
---

# Skill: verify

## Read First

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/gate.md`
- `.agentflow/runs/<run-id>/tester/test-plan.md`
- `.agentflow/runs/<run-id>/developer/test-result.md`
- `.agentflow/runs/<run-id>/code-reviewer/review-report.md`

## Procedure

1. Confirm code review has passed or identify the blocking review report.
2. Compare `gate.md` required tests and acceptance criteria with the test plan and Developer test result.
3. Write `.agentflow/runs/<run-id>/verification.md` with the evidence paths, commands observed, uncovered acceptance items, and user-facing checks.
4. If required evidence is missing and the owner is clear, write a fix request and route it through the responsible workflow node.
5. If evidence is sufficient, continue to `$finish`.

## Required Outputs

- `.agentflow/runs/<run-id>/verification.md`
- fix request path when verification is blocked

## Next

Return Decision. On pass, next step `$finish`; on fail or missing evidence, return the fix request path and responsible role.
