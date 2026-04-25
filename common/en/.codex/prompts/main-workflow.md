# Main Workflow Protocol

The main thread is the orchestrator, integrator, and gatekeeper. It must keep context clean: delegate role-specific work to subagents, read concise reports, resolve conflicts, and advance the workflow state.

## Repo-relative path rule

All workflow references must use repo-relative paths. Never write vague names like “approved plan” or absolute paths. Write `.agentflow/runs/<run-id>/gate.md`.

## State machine

| Phase | Meaning | Source edits allowed | Required artifacts before next phase | Next phase |
|---|---|---:|---|---|
| `idle` | No active run | No | none | `planning` |
| `planning` | Create run, collect PM/Architect/Tester input | No | `.agentflow/runs/<run-id>/task.md`, `.agentflow/runs/<run-id>/gate.md` | `ready-to-execute` or `blocked` |
| `ready-to-execute` | Approved plan is ready | No | `.agentflow/runs/<run-id>/gate.md` | `executing` |
| `executing` | Developer implements the approved plan | Yes | `.agentflow/runs/<run-id>/developer/implementation-report.md`, `.agentflow/runs/<run-id>/developer/changed-files.md` | `ready-to-review` or `blocked` |
| `ready-to-review` | Implementation waits for review | No | developer artifacts | `reviewing` |
| `reviewing` | Reviewer/Tester/Performance validate the work | No | `.agentflow/runs/<run-id>/reviewer/review-report.md`, `.agentflow/runs/<run-id>/tester/test-report.md` | `ready-to-finish` or `executing` |
| `ready-to-finish` | Review passed and run can close | No | review/test reports | `finishing` |
| `finishing` | Owners sync long-lived docs | No | `.agentflow/runs/<run-id>/summary.md` | `idle` |
| `blocked` | Needs user/external decision | No | `.agentflow/runs/<run-id>/summary.md` explains blocker | previous safe phase |
| `paused` | User paused workflow | No | `.agentflow/handoff.md` | previous phase |

## Role ownership

| Owner | Long-lived files | Run files |
|---|---|---|
| PM | `agentflow/vision.md`, `agentflow/roadmap.md` | `.agentflow/runs/<run-id>/pm/*` |
| Architect | `agentflow/adr/*.md`, technical sections of `agentflow/spec/*.md` | `.agentflow/runs/<run-id>/architect/*` |
| Tester | `agentflow/spec/test-plan/*.md` | `.agentflow/runs/<run-id>/tester/*` |
| Developer | source code and tests | `.agentflow/runs/<run-id>/developer/*` |
| Reviewer | none by default | `.agentflow/runs/<run-id>/reviewer/*` |
| Researcher | none by default | `.agentflow/runs/<run-id>/researcher/*` |
| Performance | none by default | `.agentflow/runs/<run-id>/performance/*` |

Long-lived files are updated only during `finish`, or when the main thread explicitly assigns a sync task.

## Standard run directory

```text
.agentflow/runs/<run-id>/
  task.md
  gate.md
  summary.md
  pm/journal.md
  pm/roadmap-update.md
  pm/final-status.md
  architect/journal.md
  architect/architecture-report.md
  architect/adr-draft.md
  architect/spec-draft.md
  tester/journal.md
  tester/test-plan.md
  tester/test-report.md
  developer/journal.md
  developer/implementation-report.md
  developer/changed-files.md
  reviewer/journal.md
  reviewer/review-report.md
  researcher/journal.md
  researcher/research-report.md
  performance/journal.md
  performance/performance-report.md
```

## Main-thread duties

1. Read `agentflow/vision.md`, `agentflow/roadmap.md`, `.agentflow/state.json`, and current run files.
2. Spawn only the required subagents for scoped work.
3. Collect concise role results and read role-owned run files.
4. Resolve conflicts between role outputs.
5. Write `.agentflow/runs/<run-id>/gate.md` and `.agentflow/runs/<run-id>/summary.md`.
6. Update `.agentflow/state.json` through `codex-spec state set ...`.
7. Run `codex-spec backup --label <label>` at phase boundaries.
8. Close subagent context at milestone boundaries and start the next milestone with fresh subagents.

## Blocked format

If safe progress is impossible, write `.agentflow/runs/<run-id>/summary.md`:

```text
Status: blocked
Reason: <specific blocker>
Needed decision: <question or action>
Affected paths:
- <repo-relative path>
```

Then set `.agentflow/state.json.blocked = true` through `codex-spec state set --blocked true`.
