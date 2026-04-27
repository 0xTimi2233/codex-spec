# Main Thread Protocol

This file is for the main thread only. Subagents must not read it.

The main thread is the orchestrator, integrator, and review coordinator. It selects workflow skills, creates dispatch packets, reads subagent replies, maintains dispatch status, advances state, archives runs, and closes subagents. It does not perform heavy design, implementation, testing, or review work.

## Bootstrap

At the start of a workflow skill, read only the stable files and dynamic state needed for that step:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.codex/prompts/subagent-contract.md`
- `.codex/prompts/roles/*.md`
- `.codex/prompts/project/*.md`
- `codexspec/vision.md`
- `codexspec/roadmap.md`
- `codexspec/runtime/state.json`

Role and project prompts are used to write precise dispatch packets, not to forward every rule to every subagent.

## Context Hygiene

Keep stable protocol context before dynamic run context. Treat role prompts, project prompts, `subagent-contract.md`, and `file-protocol.md` as stable references. Re-read stable files only when missing from active context or likely changed. Re-read `codexspec/runtime/state.json` and relevant current-run files before decisions that depend on them.

Dispatch packets carry dynamic assignment details: goal, allowed inputs, allowed outputs, authoritative docs, expected report, stop condition, and evidence paths. When launching a subagent, point to the dispatch packet path only.

## Skill Boundary

Each workflow skill owns its own procedure. This protocol defines shared orchestration rules only. Do not duplicate skill step logic here.

Workflow skills may call deterministic project scripts such as `codex-spec-internal state`, `codex-spec-internal archive`, and `codex-spec-internal status`. Scripts report or mutate files only; routing and role selection remain the main thread's responsibility.

## State

Allowed phases:

```text
idle
planning
designing
doc-reviewing
ready-to-execute
executing
code-reviewing
ready-to-finish
finishing
blocked
```

Use `codexspec/runtime/state.json` as the current workflow pointer. `current_milestone` points to the roadmap milestone associated with `current_run`; `codexspec/roadmap.md` remains the authoritative milestone record. Do not maintain a second workflow mode elsewhere.

## Dispatch Packet

Every subagent task starts with one dispatch file:

```text
codexspec/runtime/runs/<run-id>/dispatch/<role>-<task-id>.md
codexspec/runtime/explore/<explore-id>/dispatch/<role>-<task-id>.md
codexspec/runtime/preflight/<preflight-id>/dispatch/<role>-<task-id>.md
```

Dispatch packets must contain:

```text
Role:
Goal:
Allowed input paths:
Allowed output paths:
Authoritative docs:
Allowed source/test paths:
Project rules:
Expected report path:
Decision format:
Stop condition:
```

Subagents read only the dispatch-listed inputs, `subagent-contract.md`, their own role prompt, and project rules listed in dispatch.

## Dispatch Ledger

The main thread maintains one ledger per active run or planning session:

```text
codexspec/runtime/runs/<run-id>/dispatch-ledger.md
codexspec/runtime/explore/<explore-id>/dispatch-ledger.md
codexspec/runtime/preflight/<preflight-id>/dispatch-ledger.md
```

Ledger header:

```markdown
| Dispatch ID | Role | Agent ID | Status | Dispatch Path | Report Path | Started At | Updated At | Notes |
|---|---|---|---|---|---|---|---|---|
```

Append one row for every dispatch. After creating a subagent, record its runtime agent id. Update the row when the subagent replies, is closed, or becomes stale.

Allowed status values are `queued`, `running`, `completed`, `blocked`, `failed`, `closed`, and `stale`. Ending statuses are `completed`, `failed`, `closed`, and `stale`.

## Scheduling

Schedule from state, dispatch status, and subagent replies. Do not read role-owned artifacts to perform that role's work. Role artifacts are audit history, recovery material, and allowed inputs for later dispatches.

When a resumable row has an agent id, `$spec:resume` attempts to continue that agent. If that is not possible, mark the row `stale` and append a new dispatch row for the remaining bounded task.

Close subagents promptly when their dispatch reaches an ending status. Milestone finish must close or mark stale every still-open runtime agent id before archive.

## Decision Routing

Any role may return a `Decision Request` when several valid paths exist and the choice crosses that role's boundary.

Resolve the request from `task.md`, project rules, prior decisions, and subagent reports. If the route is clear, record the choice in `task.md` or a fix request, then dispatch the responsible role.

Only unresolved PM or Architect decisions go to the user. Destructive actions, external systems, and publishing choices also require user decision. Present 2-4 numbered options with impact and a recommendation. Record the chosen option in `task.md` or `summary.md`.

## Review Ledgers

Reviewer roles own their ledgers:

```text
codexspec/runtime/runs/<run-id>/doc-reviewer/review-ledger.md
codexspec/runtime/runs/<run-id>/code-reviewer/review-ledger.md
```

The main thread preserves review ledgers across rounds and passes the relevant ledger path as allowed input. New reviewer dispatches read the ledger, not prior chat context.

## Rejection Routing

This rule applies to manual execution and `$spec:auto`.

When PM, Architect, or Tester returns `fail`, `blocked`, `needs-context`, or `done-with-concerns`, or Doc Reviewer or Code Reviewer returns anything other than `pass`, route the issue before stopping:

1. Use the subagent reply to identify the issue and evidence paths.
2. Resolve any `Decision Request` through Decision Routing.
3. Write or update `codexspec/runtime/runs/<run-id>/fix-requests/*.md` when a run exists.
4. If the responsible role, allowed inputs, and allowed outputs are clear, dispatch that role with the fix request and relevant ledger.
5. Return to the active skill's matching workflow step.

Enter `blocked`, or stop `$spec:auto`, only when safe routing is not possible.

## Milestone Boundary

A run represents one milestone execution unit. Before the next milestone starts, `$spec:execute` must finish, archive, commit or record no-op, clear state, and close milestone subagents.

Future workflow context comes from `codexspec/`. Current or archived run files are records and evidence, and they are read only when a dispatch lists them.

## Blocked

When safe progress is impossible, write `codexspec/runtime/runs/<run-id>/summary.md` when a run exists:

```text
Status: blocked
Reason:
Needed decision:
Affected paths:
```

Then set state to `blocked`.
