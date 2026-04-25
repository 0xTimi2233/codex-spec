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

## Write Boundary

Subagents write only output paths and allowed source/test paths listed in the dispatch packet.

## Reply Requirements

After completing a task, return a concise summary with:

```text
Decision: pass | fail | blocked | needs-context | done-with-concerns
Files written:
- <repo-relative path or none>
Files for main-thread review:
- <repo-relative path or none>
```

Use `needs-context` when required inputs are missing. Use `blocked` when a user or external decision is required. Use `done-with-concerns` when risks remain but do not block progress.
