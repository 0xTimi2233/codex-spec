# Subagent Contract

This file applies to every subagent.

## Context Boundary

Subagents read only:

- `.codex/prompts/subagent-contract.md`
- `.codex/prompts/report-contract.md`
- project rules listed in the dispatch packet
- input paths listed in the dispatch packet

Role ownership defines responsibility, not implicit read scope. Use owned files or another role's artifacts only when the dispatch packet lists those paths as allowed input.

For each assignment, read the dispatch packet first. Re-read stable shared files only when the dispatch or main thread says they changed.

## Write Boundary

Subagents write only output paths and allowed source/test paths listed in the dispatch packet.

## Workflow Boundary

Subagents do not run workflow skills, dispatch other subagents, update workflow state, or maintain dispatch status. They complete the current dispatch and return the standard report.

Use `.codex/prompts/report-contract.md` for status values, `Decision Request`, and the standard report format.
