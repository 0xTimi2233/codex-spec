# File Protocol

All agents and the main thread use files as shared state. Chat history is not a source of truth.

## Path language

Use repo-relative paths in every response and artifact. Do not use absolute paths, symbolic names, or vague labels.

Examples:

- good: `.agentflow/runs/2026-04-25T120000Z-auth/developer/implementation-report.md`
- bad: `/home/me/project/.agentflow/...`
- bad: `implementation report`

## Long-lived files

| Path | Purpose | Owner |
|---|---|---|
| `agentflow/vision.md` | Product goal, scope, non-goals, constraints | PM |
| `agentflow/roadmap.md` | Milestones, status, dependencies, exit criteria | PM |
| `agentflow/adr/*.md` | Accepted architecture decisions | Architect |
| `agentflow/spec/<domain>.md` | Stable feature/module specification | PM + Architect |
| `agentflow/spec/test-plan/<domain>.md` | Stable verification plan | Tester |

## Runtime files

| Path | Purpose | Writer |
|---|---|---|
| `.agentflow/state.json` | Small machine-readable workflow pointer | `codex-spec` CLI / hooks |
| `.agentflow/handoff.md` | Pause/resume note | Main thread |
| `.agentflow/runs/<run-id>/` | Current task collaboration record | Main thread + role agents |
| `.agentflow/backups/` | Phase boundary checkpoint | `codex-spec backup` |

## Required artifacts

| Phase | Required paths |
|---|---|
| `planning` | `.agentflow/runs/<run-id>/task.md`, `.agentflow/runs/<run-id>/gate.md` |
| `executing` | `.agentflow/runs/<run-id>/developer/implementation-report.md`, `.agentflow/runs/<run-id>/developer/changed-files.md` |
| `reviewing` | `.agentflow/runs/<run-id>/reviewer/review-report.md`, `.agentflow/runs/<run-id>/tester/test-report.md` |
| `finishing` | `.agentflow/runs/<run-id>/summary.md` |

## Required report format

```text
Status: pass | fail | blocked
Summary: <one paragraph>
Inputs read:
- <repo-relative path>
Outputs written:
- <repo-relative path>
Findings:
- <finding>
Required next action:
- <action or none>
Decision: pass | fail | blocked
```

## Draft then sync

Role agents write drafts under `.agentflow/runs/<run-id>/<role>/`. Long-lived files under `agentflow/` are synced only during `finish` or when the main thread explicitly asks a role owner to sync.
