---
name: finish
description: Close a reviewed run and sync long-lived documents through their owners.
---

# Skill: finish

## Read first

- `.codex/prompts/main-workflow.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/reviewer/review-report.md`
- `.agentflow/runs/<run-id>/tester/test-report.md`

## Procedure

1. Confirm review passed and phase is `ready-to-finish`.
2. Run `codex-spec state set --phase finishing --run <run-id>`.
3. Ask owners to sync only their long-lived files when needed:
   - PM updates `agentflow/roadmap.md` or `agentflow/vision.md`.
   - Architect syncs ADR/spec updates.
   - Tester syncs `agentflow/spec/test-plan/<domain>.md`.
4. Main thread writes `.agentflow/runs/<run-id>/summary.md`.
5. Run `codex-spec backup --label <run-id>-post`.
6. Set phase to `idle`, clear current run, and close all subagent context.

## Final reply

Return final status, synced files, backup label, and idle confirmation.
