---
name: finish
description: Summarize the run, sync long-lived docs, archive the run, and clear current run.
---

# Skill: finish

## Read First

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/gate.md`
- `.agentflow/runs/<run-id>/code-reviewer/review-report.md`

## Procedure

1. Confirm phase is `ready-to-finish`.
2. Run `codex-spec state set --phase finishing --run <run-id>`.
3. Write `.agentflow/runs/<run-id>/dispatch/auditor-001.md` and dispatch Auditor.
4. Owners sync long-lived files by dispatch: PM syncs roadmap/vision, Architect syncs ADR/spec, Tester syncs test-plan.
5. Main thread writes `.agentflow/runs/<run-id>/summary.md`.
6. Run `codex-spec archive --run <run-id>`.
7. Run `codex-spec state set --phase idle --run null --milestone null --blocked false`.
8. End subagent context for the current milestone.

## Required Outputs

- `.agentflow/runs/<run-id>/auditor/audit-report.md`
- `.agentflow/runs/<run-id>/summary.md`
- `.agentflow/archives/<run-id>/`

## Next

Return archive path and idle state.
