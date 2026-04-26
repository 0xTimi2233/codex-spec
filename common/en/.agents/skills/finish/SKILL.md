---
name: finish
description: Summarize the run, sync long-lived docs, archive the run, and clear current run.
---

# Skill: finish

## Read First

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`

## Procedure

1. Confirm phase is `ready-to-finish`.
2. Confirm `.agentflow/runs/<run-id>/verification.md` exists. If verification is not applicable, keep a short rationale and include it when writing summary.
3. Run `codex-spec state set --phase finishing --run <run-id>`.
4. Write `.agentflow/runs/<run-id>/dispatch/auditor-001.md`.
5. Use current run artifact paths as Auditor allowed inputs. Append the Auditor dispatch row, dispatch Auditor, record the runtime agent id, and update the row when the Auditor response arrives.
6. Owners sync long-lived files by dispatch: PM syncs roadmap/vision, Architect syncs ADR/spec, Tester syncs test-plan. Append a dispatch row, record the runtime agent id, and update the row for each owner sync.
7. Main thread writes `.agentflow/runs/<run-id>/summary.md`.
8. Ensure `.agentflow/runs/<run-id>/dispatch-ledger.md` has no `queued`, `running`, or `blocked` rows before archiving.
9. Run `codex-spec archive --run <run-id>` to move the completed run into immutable archives.
10. Run `codex-spec state set --phase idle --run null --milestone null --blocked false`.
11. Commit the code, test, and documentation changes for the current milestone; the commit message should briefly describe the user-facing change. If there are no file changes, record the no-op in summary and do not create an empty commit.
12. End subagent context for the current milestone.

## Required Outputs

- `.agentflow/runs/<run-id>/auditor/audit-report.md`
- `.agentflow/runs/<run-id>/verification.md` or a summary note explaining why verification was not applicable
- `.agentflow/runs/<run-id>/summary.md`
- finalized `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/archives/<run-id>/`
- git commit for the current milestone, or a no-op record in summary

## Next

Return archive path and idle state.
