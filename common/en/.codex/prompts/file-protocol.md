# File Protocol

Files are the workflow source of truth. Chat history is not a source of truth. Use repo-relative paths only; do not use absolute paths, aliases, or vague labels.

## Long-Lived Files

| Path | Purpose | Owner |
|---|---|---|
| `agentflow/vision.md` | Product goals, scope, non-goals, project constraints | PM |
| `agentflow/roadmap.md` | Milestones, status, dependencies, exit criteria | PM |
| `agentflow/adr/*.md` | Accepted architecture decisions | Architect |
| `agentflow/spec/*.md` | Stable designs, interfaces, behavior specs | Architect |
| `agentflow/spec/test-plan/*.md` | Stable test plans and acceptance matrices | Tester |

Long-lived files are synced only during `$finish` by the owning role.

## Current Run Files

```text
.agentflow/runs/<run-id>/
  dispatch-ledger.md
  task.md
  gate.md
  summary.md
  dispatch/
  pm/
  architect/
  tester/
  doc-reviewer/
  developer/
  code-reviewer/
  auditor/
  fix-requests/
  fix-responses/
```

`dispatch-ledger.md` is main-thread-only. Subagents report results to the main thread; the main thread appends and updates dispatch rows.

## Archive Files

```text
.agentflow/archives/<run-id>/
```

`archives/` is immutable history. Later runs do not read context from `archives/`; reusable facts must be synced into `agentflow/` or written into the current run's `task.md`.

## Report Format

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

Every report must list inputs read and outputs written. Do not claim tests passed unless tests were run or a test report was read.
