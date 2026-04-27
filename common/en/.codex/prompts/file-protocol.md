# File Protocol

Files are the workflow source of truth. Chat history is not a source of truth. Use repo-relative paths only; do not use absolute paths, aliases, or vague labels.

## Terms

| Term | Meaning |
|---|---|
| `workflow skill` | A main-thread command such as `$spec:plan`, `$spec:design`, `$spec:execute`, `$spec:auto`, `$spec:status`, or `$spec:resume`. Skills orchestrate workflow steps and may create dispatch packets. |
| `planning track` | The active `$spec:plan` track: `explore`, `preflight`, or `commit`. |
| `planning session` | One active pre-run planning session recorded in `.agentflow/state.json.current_planning_session`. |
| `run-id` | One milestone execution unit stored under `.agentflow/runs/<run-id>/`. |
| `explore-id` | One pre-run discovery session stored under `.agentflow/explore/<explore-id>/`. |
| `explore round` | `.agentflow/explore/<explore-id>/rounds/round-<nnn>/round.md`; one append-only question batch in an explore session. |
| `explore brief` | `.agentflow/explore/<explore-id>/brief.md`; the planning-ready result merged from explore rounds. |
| `preflight-id` | One pre-plan requirement audit stored under `.agentflow/preflight/<preflight-id>/`. |
| `preflight brief` | `.agentflow/preflight/<preflight-id>/brief.md`; the planning-ready result of a requirement preflight. |
| `planning package` | Self-contained, run-scoped PM input record under `.agentflow/runs/<run-id>/task.md` and `.agentflow/runs/<run-id>/pm/`. |
| `dispatch packet` | `.agentflow/<work-unit>/dispatch/<role>-<task-id>.md`; the task packet a subagent reads for one assignment. `<work-unit>` is `runs/<run-id>`, `explore/<explore-id>`, or `preflight/<preflight-id>`. |
| `authoritative docs` | Dispatch-listed `agentflow/` documents a role must follow for the current assignment. |
| `task.md` | Current run goal, scope, constraints, done criteria, and user decisions. |
| `dispatch-ledger.md` | Main-thread dispatch status table for the current run or planning session. |
| `review-ledger.md` | Reviewer-owned issue ledger for review rounds. |
| `verification.md` | Main-thread acceptance evidence collected before milestone finish. |
| `summary.md` | Current run stop or completion summary. |
| `fix-requests/` | Main-thread repair requests for responsible roles. |
| `role artifact` | Output written under `.agentflow/runs/<run-id>/<role>/`. |

## Long-Lived Files

| Path | Purpose | Owner |
|---|---|---|
| `agentflow/vision.md` | Product goals, scope, non-goals, project constraints | PM |
| `agentflow/roadmap.md` | Milestones, status, dependencies, exit criteria | PM |
| `agentflow/adr/*.md` | Accepted architecture decisions | Architect |
| `agentflow/spec/*.md` | Stable designs, interfaces, behavior specs | Architect |
| `agentflow/spec/test-plan/*.md` | Stable test plans and acceptance matrices | Tester |

These files are the only durable product, architecture, spec, and test facts. Current-run files record work and evidence; they do not create a second fact source. During design, Architect and Tester update dispatch-listed `agentflow/` documents. Doc Reviewer pass means those documents are consistent enough for execution.

## Explore Files

Explore files capture one pre-run discovery session. PM owns the session analysis artifacts; the main thread owns state, dispatch, decision routing, and archive.

```text
.agentflow/explore/<explore-id>/
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

`brief.md` is the PM planning input:

```text
Status: draft | ready-for-plan | discarded
Goal:
Confirmed requirements:
Non-goals:
User decisions:
Open questions:
User preferences:
Constraints:
Candidate milestones:
Risks:
Recommended planning focus:
```

Each `round.md` records one 1-3 question batch, user answers, decisions, inspected inputs, and round summary. Earlier rounds are stable history. `brief.md` is merged from rounds when the session is closed. `summary.md` records the session outcome and archive status.

PM planning uses the explore `brief.md` path specified by the main thread.

## Preflight Files

Preflight files audit existing requirements before planning. PM owns requirement analysis artifacts; the main thread owns state, dispatch, decision routing, and archive.

```text
.agentflow/preflight/<preflight-id>/
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

`brief.md` is a PM planning input:

```text
Status: ready-for-plan | blocked | needs-more-source | discarded
Source coverage:
Requirement map summary:
Critical blockers:
User decisions:
Accepted assumptions:
Planning constraints:
Open questions:
Recommended roadmap shape:
Recommended planning focus:
```

`requirement-map.md` lists requirement ids, source paths, domains, dependencies, and impact. `blocker-ledger.md` tracks P0/P1/P2 risks. `decisions/queue.md` is mutable current state; `decisions/batches/*.md` are stable user question history. `brief.md` is merged from the audit when preflight closes.

PM planning uses the preflight `brief.md` path specified by the main thread.

## Current Run Files

```text
.agentflow/runs/<run-id>/
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

The PM package is a current-milestone input record, not reusable project knowledge. It must be self-contained before `$spec:design` by copying the relevant requirements, decisions, constraints, assumptions, open risks, acceptance criteria, and source references needed for design into `.agentflow/runs/<run-id>/pm/requirements.md`, `.agentflow/runs/<run-id>/pm/scope.md`, `.agentflow/runs/<run-id>/pm/acceptance-criteria.md`, and `.agentflow/runs/<run-id>/pm/planning-summary.md`.

`pm/planning-summary.md` must include:

```text
Source coverage:
Copied requirements:
Decisions:
Open risks:
Ready for design: yes | no
```

Run role artifacts are reports, ledgers, and evidence. Do not store alternate ADR, spec, or test-plan facts under `.agentflow/runs/<run-id>/`; update the dispatch-listed `agentflow/` documents instead.

## Dispatch Scope

Developer and Code Reviewer use the Developer dispatch as the execution index. The dispatch points to the reviewed `agentflow/` documents and constrains the current edit scope:

```text
Authoritative docs:
  - agentflow/vision.md
  - agentflow/roadmap.md
  - agentflow/adr/example.md
  - agentflow/spec/example.md
  - agentflow/spec/test-plan/example.md
Allowed input paths:
  - src/example-feature/**
  - tests/example-feature/**
Allowed source/test paths:
  - src/example-feature/**
  - tests/example-feature/**
Required tests:
  - npm test
Expected report path:
  - .agentflow/runs/<run-id>/developer/implementation-report.md
```

The main thread builds execution dispatches from subagent reports and review results. It copies document paths, source/test scopes, and required tests; it does not derive them by interpreting ADR or spec content.

## Archive Files

```text
.agentflow/archives/<run-id>/
.agentflow/archives/explore/<explore-id>/
.agentflow/archives/preflight/<preflight-id>/
```

`archives/` is immutable history. `codex-spec-internal archive --run <run-id>` moves the completed run from `.agentflow/runs/<run-id>/` into `.agentflow/archives/<run-id>/`. `codex-spec-internal archive --explore <explore-id>` moves the completed explore session from `.agentflow/explore/<explore-id>/` into `.agentflow/archives/explore/<explore-id>/`. `codex-spec-internal archive --preflight <preflight-id>` moves the completed preflight from `.agentflow/preflight/<preflight-id>/` into `.agentflow/archives/preflight/<preflight-id>/`. Archives must not overwrite existing archives. Reusable facts live in `agentflow/`; archived run files are evidence only when a dispatch lists them.

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

## Decision Request

Use this block when the next safe step depends on a choice that crosses the current role boundary:

```text
User decision required:
Question:
Options:
1. <option> - <impact>
2. <option> - <impact>
Recommended option:
Blocking:
```
