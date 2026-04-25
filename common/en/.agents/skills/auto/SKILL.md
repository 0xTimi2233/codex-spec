---
name: auto
description: Execute the standard workflow for the current run under control; route clear rejections to fixes and stop only when safe progress is not possible.
---

# Skill: auto

## Read First

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

## Procedure

Run the next missing workflow step from the current state phase:

```text
$plan -> $design -> $doc-review -> $execute -> $code-review -> $finish
```

After every step, read `.agentflow/state.json`, current run summary, latest report, and review ledger.

## Rejection And Stop Rules

On rejection or a non-pass decision, the main thread first reads the report, review ledger, and evidence paths, then writes or updates `.agentflow/runs/<run-id>/fix-requests/*.md`. If the responsible role, allowed input paths, and allowed output paths are clear, dispatch that subagent to handle the fix, then return to the corresponding workflow step or review gate.

Stop automatic progress only when any of these occur:

- the main thread cannot choose the responsible role, fix scope, or next gate safely;
- a user, external system, or destructive operation decision is needed;
- required artifacts are missing and cannot be recreated through a clear dispatch;
- the same open issue still has no executable next step after a fix attempt;
- `.agentflow/state.json.blocked = true`.

When stopping, the main thread writes `.agentflow/runs/<run-id>/summary.md` with state, reason, latest evidence paths, and recommended next action.

## Milestone Commit

After `$finish` archives the run and clears state, the main thread commits the code, test, and documentation changes for the completed milestone before starting the next milestone. If there are no file changes, do not create an empty commit; record the no-op in summary.

## Final Reply

Return completed steps, routed fix attempts or stop reason, current state, relevant report/fix-request paths, milestone commit status, and the recommended next skill for the user.
