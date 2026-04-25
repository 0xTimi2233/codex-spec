---
name: review
description: Review implementation, tests, and performance before finish.
---

# Skill: review

## Read first

- `.codex/prompts/main-workflow.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/gate.md`
- `.agentflow/runs/<run-id>/developer/implementation-report.md`
- `.agentflow/runs/<run-id>/developer/changed-files.md`

## Procedure

1. Confirm phase is `ready-to-review` or `reviewing`.
2. Run `codex-spec state set --phase reviewing --run <run-id>`.
3. Spawn Reviewer and Tester.
4. Spawn Performance if hot path, concurrency, cache, IO, or low-level code changed.
5. Required outputs:
   - `.agentflow/runs/<run-id>/reviewer/review-report.md`
   - `.agentflow/runs/<run-id>/tester/test-report.md`
   - optional `.agentflow/runs/<run-id>/performance/performance-report.md`
6. If pass, set `ready-to-finish`; if fail, set `executing` and write fixes to `.agentflow/runs/<run-id>/summary.md`.

## Final reply

Return pass/fail/blocked, report paths, and next command: `$finish` or `$execute`.
