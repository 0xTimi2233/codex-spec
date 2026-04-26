# Main Thread Protocol

This file is for the main thread only. Subagents must not read it.

The main thread is the orchestrator, integrator, and gatekeeper. It selects roles, creates dispatch packets, reads subagent replies, maintains dispatch status, advances state, and archives runs. It does not perform heavy design, implementation, or code review work.

## Startup Context

At startup, the main thread reads:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.codex/prompts/subagent-contract.md`
- `.codex/prompts/roles/*.md`
- `.codex/prompts/project/*.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

Role and project prompts are read to write precise dispatch packets, not to forward every rule to every subagent.

## Context Cache Hygiene

Keep stable protocol context before dynamic run context. Treat `file-protocol.md`, `subagent-contract.md`, role prompts, and project prompts as the stable prelude. Dispatch packets carry only the dynamic assignment: goal, allowed paths, expected report, stop condition, and specific evidence paths. When launching a subagent, point to the dispatch packet path instead of repeating its contents.

## State Machine

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

## Dispatch Packet

Every subagent task starts with a dispatch file:

```text
.agentflow/runs/<run-id>/dispatch/<role>-<task-id>.md
```

Dispatch packets must contain:

```text
Role:
Goal:
Allowed input paths:
Allowed output paths:
Allowed source/test paths:
Project rules:
Expected report path:
Decision format:
Stop condition:
```

Subagents read only the dispatch-listed inputs, shared protocols, and their own role prompt.

When launching a subagent, the runtime prompt should point to the dispatch packet path only. Do not repeat the dispatch content in the launch prompt.

## Dispatch Ledger

The main thread maintains:

```text
.agentflow/runs/<run-id>/dispatch-ledger.md
```

Create the ledger when a run starts:

```markdown
| Dispatch ID | Role | Agent ID | Status | Dispatch Path | Report Path | Started At | Updated At | Notes |
|---|---|---|---|---|---|---|---|---|
```

Append one row for every dispatch. After creating a subagent, record its runtime agent id in that row.

```markdown
| architect-001 | architect | <runtime-agent-id> | running | .agentflow/runs/<run-id>/dispatch/architect-001.md | .agentflow/runs/<run-id>/architect/design.md | <iso-8601> | <iso-8601> | - |
```

Allowed status values are `queued`, `running`, `completed`, `blocked`, `failed`, `closed`, and `stale`.

The main thread updates a row when a subagent response arrives, when a subagent is closed, and before `$finish` clears milestone context. During resume, the main thread only acts on rows whose status is not an ending status. Ending statuses are `completed`, `failed`, `closed`, and `stale`.

When a resumable row has an agent id, `$resume` attempts to continue that agent. If that is not possible, the main thread marks the row `stale` and appends a new dispatch row for the remaining bounded task.

## Scheduling Rule

For normal workflow progress, the main thread schedules from subagent replies and dispatch status. It should not read role-owned run artifacts to perform that role's work. Run artifacts provide audit history, recovery material, and inputs for later dispatches.

## Review Ledger

Reviewer roles write their own review ledgers:

```text
.agentflow/runs/<run-id>/doc-reviewer/review-ledger.md
.agentflow/runs/<run-id>/code-reviewer/review-ledger.md
```

Ledgers carry issues across rounds:

```text
Issue ID:
Status: open | fixed | accepted-risk | obsolete
Evidence:
Required fix:
Resolution:
Verification:
```

The main thread preserves review ledgers across rounds and passes the relevant ledger path as allowed input. A new reviewer reads the ledger, not prior chat context.

## Workflow Step Duties

`$plan`: dispatch PM, write `task.md`, and collect PM artifacts.

`$design`: dispatch Architect and Tester. Architect writes design, spec, and ADR drafts; Tester writes a test plan from the design.

`$doc-review`: dispatch Doc Reviewer to check consistency across requirements, design, spec, ADR, and test plan. On failure, the main thread writes `fix-requests/doc-fix-<n>.md` and returns to `$design`.

`$execute`: dispatch Developer. Developer implements code and tests from the approved gate and writes implementation reports and test results.

Before `$execute`, `gate.md` must be an approved contract with allowed source/test paths and required tests. Do not dispatch Developer for source edits outside that contract.

`$code-review`: dispatch Code Reviewer. Dispatch Tester when test results need coverage review against the test plan. On failure, the main thread writes `fix-requests/code-fix-<n>.md` and returns to `$execute`.

`$verify`: collect acceptance evidence from the approved gate, test plan, implementation report, and code review result. If evidence is missing, route a fix request to the responsible workflow node.

`$verify` is not a separate state-machine phase. It runs while `.agentflow/state.json.current_phase` is `ready-to-finish`; `$finish` is the step that advances the phase to `finishing`.

`$finish`: dispatch Auditor to summarize the run; dispatch owners to sync long-lived docs; archive the run; clear the current run; end subagent context for the milestone.

## Rejection Routing

This rule applies to manual execution and `$auto`.

When PM, Architect, or Tester returns `fail`, `blocked`, `needs-context`, or `done-with-concerns`, or Doc Reviewer or Code Reviewer returns anything other than `pass`, the main thread routes the issue first:

1. Use the subagent reply to identify the issue and evidence paths.
2. Write or update `.agentflow/runs/<run-id>/fix-requests/*.md`.
3. If the responsible role, allowed input paths, and allowed output paths are clear, dispatch that subagent with the fix request and relevant ledger as allowed input.
4. After the fix, return to the corresponding workflow step or review gate.

The main thread enters blocked, or stops `$auto`, only when safe routing is not possible. Typical cases include:

- the main thread cannot choose the responsible role, fix scope, or next gate safely;
- a user, external system, or destructive operation decision is needed;
- required artifacts are missing and cannot be recreated through a clear dispatch;
- the same open issue still has no executable next step after a fix attempt;
- `.agentflow/state.json.blocked = true`.

When stopping, the main thread writes `.agentflow/runs/<run-id>/summary.md` with stop reason, evidence paths, and recommended next action.

## Auto Execution

`$auto` runs only the next missing workflow step for the current run. After every step, the main thread uses state, dispatch status, and subagent replies. On rejection, route the issue through "Rejection Routing" first; stop automatic progress only when safe routing is not possible.

## Milestone Boundary

A run represents one milestone execution unit. After `$finish` archives the run and clears state, the main thread must commit the code, test, and documentation changes for the completed milestone before starting a new milestone.

The commit message should briefly describe the completed user-facing change, for example `feat: add import workflow`, `fix: handle empty config`, or `docs: update setup guide`. If there are no file changes, do not create an empty commit; record the no-op in `.agentflow/runs/<run-id>/summary.md`.

## Blocked

When safe progress is impossible, the main thread writes:

```text
.agentflow/runs/<run-id>/summary.md
```

with:

```text
Status: blocked
Reason:
Needed decision:
Affected paths:
```

Then run `codex-spec state set --phase blocked --blocked true`.
