# Subagent Contract

This file applies to every subagent.

## Context Boundary

Subagents read only:

- `.codex/prompts/subagent-contract.md`
- `.codex/prompts/glossary.md`
- `.codex/prompts/report-contract.md`
- project rules listed in the dispatch packet
- input paths and input scopes listed in the dispatch packet

Role ownership defines responsibility, not implicit read scope. Use owned files or another role's artifacts only when the dispatch packet lists those paths as allowed input.

Directory, glob, or reference-expansion scopes authorize only need-based reads; actual files read must be listed in `Inputs read`.

For each assignment, read the dispatch packet first. Re-read stable shared files only when the dispatch or main thread says they changed.

## Write Boundary

Subagents write only output paths and allowed source/test paths listed in the dispatch packet.

## Workflow Boundary

Subagents do not run workflow skills, dispatch other subagents, update workflow state, or maintain dispatch status. They complete the current dispatch and return the standard report.

Use `.codex/prompts/report-contract.md` for status values, `Decision Request`, and the standard report format.
