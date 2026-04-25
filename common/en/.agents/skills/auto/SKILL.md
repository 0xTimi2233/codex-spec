---
name: auto
description: Execute the standard workflow for the current run under control, stopping on rejection or risk.
---

# Skill: auto

## Read First

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

## Procedure

Run the next missing phase from the current phase:

```text
$plan -> $design -> $doc-review -> $execute -> $code-review -> $finish
```

After every phase, read `.agentflow/state.json`, current run summary, latest report, and review ledger.

## Must Stop

Stop and do not advance to the next phase when any of these occur:

- PM returns `fail`, `blocked`, `needs-context`, or `done-with-concerns`
- Architect returns `fail`, `blocked`, `needs-context`, or `done-with-concerns`
- Tester returns `fail`, `blocked`, `needs-context`, or `done-with-concerns`
- Doc Reviewer or Code Reviewer returns anything other than `pass`
- `.agentflow/runs/<run-id>/fix-requests/*.md` exists
- `.agentflow/state.json.blocked = true`
- required artifacts for the current phase are missing
- a user, external system, or destructive operation decision is needed

When stopping, the main thread writes `.agentflow/runs/<run-id>/summary.md` with state, reason, latest evidence paths, and recommended next action.

## Final Reply

Return completed phases, stop reason, current state, relevant report/fix-request paths, and the recommended next skill for the user.
