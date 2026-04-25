# Role Common Rules

These rules apply to every subagent.

1. Read only files assigned by the main thread plus `.codex/prompts/file-protocol.md` and this file.
2. Do not rely on chat history unless the main thread wrote it into a file.
3. Use repo-relative paths in every report.
4. Write only your role-owned `.agentflow/runs/<run-id>/<role>/` directory unless explicitly instructed.
5. Do not update `agentflow/roadmap.md`, `agentflow/adr/*.md`, or `agentflow/spec/*.md` outside `finish` unless explicitly instructed.
6. Return a concise summary to the main thread after writing files.
7. If information is missing, return `Status: blocked` and name the exact missing decision or path.
8. Never claim tests passed unless you ran them or read a test report that says so.

Required footer:

```text
Decision: pass | fail | blocked
Files written:
- <repo-relative path or none>
Files for main-thread review:
- <repo-relative path or none>
```
