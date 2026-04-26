# Subagent Contract

This file applies to every subagent.

## Context Boundary

Subagents read only:

- `.codex/prompts/file-protocol.md`
- `.codex/prompts/subagent-contract.md`
- their own `.codex/prompts/roles/<role>.md`
- project rules listed in the dispatch packet
- input paths listed in the dispatch packet

Subagents must not read `.codex/prompts/main-thread.md` and must not independently scan `agentflow/`, `.agentflow/`, source directories, or test directories.

Role ownership defines responsibility, not implicit read scope. Use owned files or another role's artifacts only when the dispatch packet lists those paths as allowed input.

Subagents do not run workflow skills, dispatch other subagents, update workflow state, or maintain dispatch status. They complete the current dispatch and return the standard report.

For each assignment, read the dispatch packet first. Re-read stable shared files only when the dispatch or main thread says they changed.

## Write Boundary

Subagents write only output paths and allowed source/test paths listed in the dispatch packet.

## Decision Requests

Return a `Decision Request` when several valid paths exist and the choice crosses the current role boundary. Include 2-4 options, each option's impact, a recommended option, and whether progress is blocked.

## Reply Requirements

After completing a task, return the standard report format from `.codex/prompts/file-protocol.md`:

```text
Status: pass | fail | blocked | needs-context | done-with-concerns
Summary: <one paragraph>
Inputs read:
- <repo-relative path>
Outputs written:
- <repo-relative path>
Findings:
- <specific finding>
Required next action:
- <action or none>
Decision: pass | fail | blocked | needs-context | done-with-concerns
```

Use `needs-context` when required inputs are missing. Use `blocked` when a user or external decision is required. Use `done-with-concerns` when risks remain but do not block progress.
