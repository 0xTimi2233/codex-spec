# File Index

Use repo-relative paths only. Do not use absolute paths, aliases, or vague labels. Discovery or audit inputs may use repo-relative directories or globs as input scopes; output paths must be concrete files.

## Long-Lived Files

| Path | Purpose | Owner |
|---|---|---|
| `codexspec/vision.md` | Product goals, scope, non-goals, project constraints | PM |
| `codexspec/roadmap.md` | Milestones, status, dependencies, exit criteria | PM |
| `codexspec/adr/*.md` | Accepted architecture decisions | Architect |
| `codexspec/spec/*.md` | Stable designs, interfaces, behavior specs | Architect |
| `codexspec/spec/test-plan/*.md` | Stable test plans and acceptance matrices | Tester |

Long-lived files are the durable product, architecture, spec, and test facts. Runtime files record work and evidence; they do not create a second fact source.

## Runtime Files

```text
codexspec/runtime/state.json

codexspec/runtime/explore/<explore-id>/
  dispatch-ledger.md
  dispatch/
  brief.md
  rounds/<round-id>/round.md
  summary.md

codexspec/runtime/preflight/<preflight-id>/
  dispatch-ledger.md
  dispatch/
  sources.md
  requirement-map.md
  blocker-ledger.md
  assumptions.md
  decisions/queue.md
  decisions/batches/<batch-id>.md
  brief.md
  summary.md

codexspec/runtime/runs/<run-id>/
  dispatch-ledger.md
  task.md
  summary.md
  dispatch/<role>-<task-id>.md
  pm/requirements.md
  pm/scope.md
  pm/acceptance-criteria.md
  pm/planning-summary.md
  architect/
  tester/
  doc-reviewer/
  developer/
  code-reviewer/
  auditor/
  verification.md
  fix-requests/
  fix-responses/
```

The PM package is a current-milestone input record, not reusable project knowledge. Run role artifacts are reports, ledgers, and evidence.

## Archives

```text
codexspec/runtime/archives/runs/<run-id>/
codexspec/runtime/archives/explore/<explore-id>/
codexspec/runtime/archives/preflight/<preflight-id>/
```

Archives are immutable history. Archives must not overwrite existing archives. Reusable facts live in `codexspec/`; archived files are read only when a dispatch lists them.
