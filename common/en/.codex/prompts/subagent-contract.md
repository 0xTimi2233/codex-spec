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

Role ownership defines responsibility, not implicit read scope. Read owned files only when the dispatch packet lists them as allowed input paths.

Subagents do not share hidden state with each other. Use another role's artifacts only when the dispatch packet lists those paths as allowed input.

Subagents must not read or write `.agentflow/runs/<run-id>/dispatch-ledger.md`, `.agentflow/state.json`, archive directories, or unrelated role directories. The dispatch ledger is maintained only by the main thread and is never a subagent input.

## Write Boundary

Subagents write only output paths and allowed source/test paths listed in the dispatch packet. Unless explicitly allowed by dispatch, they must not write long-lived files, state, archives, or other role directories.

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
