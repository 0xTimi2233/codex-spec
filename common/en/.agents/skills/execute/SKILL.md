---
name: execute
description: Execute an approved plan through the developer role.
---

# Skill: execute

## Read first

- `.codex/prompts/main-workflow.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/gate.md`

## Procedure

1. Confirm phase is `ready-to-execute` or `executing`.
2. Before source edits, run `codex-spec state set --phase executing --run <run-id>`.
3. Spawn Developer with exact run id and approved file scope.
4. Developer writes:
   - `.agentflow/runs/<run-id>/developer/implementation-report.md`
   - `.agentflow/runs/<run-id>/developer/changed-files.md`
5. Main thread checks reports and sets phase to `ready-to-review` or `blocked`.

## Blocked when

- `.agentflow/runs/<run-id>/gate.md` is missing;
- implementation requires a design change;
- tests fail outside the approved plan;
- source edits exceed approved scope.

## Final reply

Return changed files, commands run, test status, and next command: `$review` or the blocker.
