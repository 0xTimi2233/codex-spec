# File Protocol

Files are the workflow source of truth. Chat history is not a source of truth. Use repo-relative paths only; do not use absolute paths, aliases, or vague labels.

## Terms

| Term | Meaning |
|---|---|
| `workflow skill` | A main-thread command such as `$brainstorm`, `$plan`, `$design`, `$execute`, or `$auto`. Skills orchestrate workflow steps and may create dispatch packets. |
| `run-id` | One milestone execution unit stored under `.agentflow/runs/<run-id>/`. |
| `brainstorm-id` | One pre-plan discovery session stored under `.agentflow/brainstorm/<brainstorm-id>/`. |
| `brainstorm brief` | `.agentflow/brainstorm/<brainstorm-id>/brief.md`; the planning-ready result of a brainstorm session. |
| `dispatch packet` | `.agentflow/runs/<run-id>/dispatch/<role>-<task-id>.md`; the task packet a subagent reads for one assignment. |
| `task.md` | Current run goal, scope, constraints, done criteria, and user decisions. |
| `gate.md` | Approved execution contract produced after document review. Developer and Code Reviewer use it as the implementation boundary. |
| `dispatch-ledger.md` | Main-thread dispatch status table for the current run. |
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

Long-lived files are synced only during milestone finish by the owning role.

## Brainstorm Files

Brainstorm files capture one pre-plan discovery session:

```text
.agentflow/brainstorm/<brainstorm-id>/
  brief.md
  notes.md
  questions.md
  source-map.md
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

`notes.md` records useful exploration notes. `questions.md` records open and answered questions. `source-map.md` records user-provided inputs and inspected paths. `summary.md` records the session outcome and archive status.

PM planning uses the brainstorm `brief.md` path specified by the main thread.

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
  verification.md
  fix-requests/
  fix-responses/
```

## Gate Contract

`gate.md` must start with machine-readable frontmatter:

```yaml
---
status: approved
allowed_source_paths:
  - src/example-feature/**
allowed_test_paths:
  - tests/example-feature/**
required_tests:
  - npm test
doc_review_report: .agentflow/runs/<run-id>/doc-reviewer/review-report.md
---
```

The main thread writes this file after Doc Reviewer returns `pass`. Source and test edits are allowed only during `executing` and only when the target path is covered by `allowed_source_paths` or `allowed_test_paths`.

## Archive Files

```text
.agentflow/archives/<run-id>/
.agentflow/archives/brainstorm/<brainstorm-id>/
```

`archives/` is immutable history. `codex-spec archive --run <run-id>` moves the completed run from `.agentflow/runs/<run-id>/` into `.agentflow/archives/<run-id>/`. `codex-spec archive --brainstorm <brainstorm-id>` moves the completed brainstorm session from `.agentflow/brainstorm/<brainstorm-id>/` into `.agentflow/archives/brainstorm/<brainstorm-id>/`. Archives must not overwrite existing archives. Reusable facts must be synced into `agentflow/` or written into the current run's `task.md`.

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
