---
name: status
description: Show current workflow state, planning session, run, and next action.
---

# Skill: status

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.codex/prompts/main-thread.md`

## Procedure

Run the internal `codex-spec-internal status` command for raw state, then inspect the relevant ledger or summary as needed.

Return phase, planning track, planning session, run id, blocked flag, active dispatches, and recommended next skill.
