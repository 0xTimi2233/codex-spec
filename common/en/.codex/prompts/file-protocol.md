# File Protocol

This file defines workflow file meanings. It is reference material for the main thread and for subagents only when a dispatch explicitly lists it.

Use repo-relative paths only. Do not use absolute paths, aliases, or vague labels.

## Terms

| Term | Meaning |
|---|---|
| `workflow skill` | A main-thread command such as `$spec:plan`, `$spec:design`, `$spec:execute`, `$spec:auto`, `$spec:status`, or `$spec:resume`. |
| `planning track` | The active `$spec:plan` track: `explore`, `preflight`, or `commit`. |
| `planning session` | One active pre-run planning session recorded in `codexspec/runtime/state.json.current_planning_session`. |
| `run-id` | One milestone execution unit stored under `codexspec/runtime/runs/<run-id>/`. |
| `explore-id` | One pre-run discovery session stored under `codexspec/runtime/explore/<explore-id>/`. |
| `preflight-id` | One pre-plan requirement audit stored under `codexspec/runtime/preflight/<preflight-id>/`. |
| `planning package` | Self-contained, run-scoped PM input record under `codexspec/runtime/runs/<run-id>/task.md` and `codexspec/runtime/runs/<run-id>/pm/`. |
| `dispatch packet` | `codexspec/runtime/<work-unit>/dispatch/<role>-<task-id>.md`; the task packet a subagent reads for one assignment. `<work-unit>` is `runs/<run-id>`, `explore/<explore-id>`, or `preflight/<preflight-id>`. |
| `authoritative docs` | Dispatch-listed `codexspec/` documents a role must follow for the current assignment. |
| `dispatch-ledger.md` | Main-thread dispatch status table for the current run or planning session. |
| `review-ledger.md` | Reviewer-owned issue ledger for review rounds. |
| `verification.md` | Main-thread acceptance evidence collected before milestone finish. |
| `summary.md` | Current run stop or completion summary. |
| `fix-requests/` | Main-thread repair requests for responsible roles. |
| `role artifact` | Output written under `codexspec/runtime/runs/<run-id>/<role>/`. |

## Long-Lived Files

| Path | Purpose | Owner |
|---|---|---|
| `codexspec/vision.md` | Product goals, scope, non-goals, project constraints | PM |
| `codexspec/roadmap.md` | Milestones, status, dependencies, exit criteria | PM |
| `codexspec/adr/*.md` | Accepted architecture decisions | Architect |
| `codexspec/spec/*.md` | Stable designs, interfaces, behavior specs | Architect |
| `codexspec/spec/test-plan/*.md` | Stable test plans and acceptance matrices | Tester |

These files are the durable product, architecture, spec, and test facts. Runtime files record work and evidence; they do not create a second fact source.

## Explore Files

Explore files capture one pre-run discovery session.

```text
codexspec/runtime/explore/<explore-id>/
  dispatch-ledger.md
  dispatch/
  brief.md
  rounds/
    round-001/
      round.md
    round-002/
      round.md
  summary.md
```

`round.md` records one question batch, user answers, decisions, inspected inputs, and round summary. Earlier rounds are stable history. `brief.md` is merged from rounds when the session is closed and is the planning input when a later dispatch lists it.

## Preflight Files

Preflight files audit existing requirements before planning.

```text
codexspec/runtime/preflight/<preflight-id>/
  dispatch-ledger.md
  dispatch/
  sources.md
  requirement-map.md
  blocker-ledger.md
  assumptions.md
  decisions/
    queue.md
    batches/
      batch-001.md
      batch-002.md
  brief.md
  summary.md
```

`requirement-map.md` lists requirement ids, source paths, domains, dependencies, and impact. `blocker-ledger.md` tracks planning risks. `decisions/queue.md` is mutable current state; `decisions/batches/*.md` are stable user question history. `brief.md` is merged from the audit when the session closes and is the planning input when a later dispatch lists it.

## Current Run Files

```text
codexspec/runtime/runs/<run-id>/
  dispatch-ledger.md
  task.md
  summary.md
  dispatch/
  pm/
    requirements.md
    scope.md
    acceptance-criteria.md
    planning-summary.md
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

The PM package is a current-milestone input record, not reusable project knowledge. It copies the requirements, decisions, constraints, assumptions, open risks, acceptance criteria, and source references needed for design into `codexspec/runtime/runs/<run-id>/pm/requirements.md`, `codexspec/runtime/runs/<run-id>/pm/scope.md`, `codexspec/runtime/runs/<run-id>/pm/acceptance-criteria.md`, and `codexspec/runtime/runs/<run-id>/pm/planning-summary.md`.

Run role artifacts are reports, ledgers, and evidence. Do not store alternate ADR, spec, or test-plan facts under `codexspec/runtime/runs/<run-id>/`; update the dispatch-listed `codexspec/` documents instead.

## Archive Files

```text
codexspec/runtime/archives/runs/<run-id>/
codexspec/runtime/archives/explore/<explore-id>/
codexspec/runtime/archives/preflight/<preflight-id>/
```

`archives/` is immutable history. Archives must not overwrite existing archives. Reusable facts live in `codexspec/`; archived run files are evidence only when a dispatch lists them.
