# Main Thread Protocol

This file is for the main thread only. Subagents must not read it.

The main thread is the orchestrator, integrator, and gatekeeper. It selects roles, creates dispatch packets, reads subagent replies, maintains dispatch status, advances state, and archives runs. It does not perform heavy design, implementation, or code review work.

## Workflow Bootstrap

At the start of a workflow skill, the main thread reads these files when they are absent from active context, may have changed, or are needed to verify current state:

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

Keep stable protocol context before dynamic run context. Treat `file-protocol.md`, `subagent-contract.md`, role prompts, and project prompts as the stable prelude. Dispatch packets carry only the dynamic assignment: goal, allowed paths, expected report, stop condition, and specific evidence paths. When launching a subagent, point to the dispatch packet path instead of repeating its contents. Re-read stable files only when they are missing from active context or may have changed; re-read dynamic state and run files before steps that depend on them.

## Workflow Script Boundary

Workflow skills may call deterministic project scripts such as `codex-spec-internal state`, `codex-spec-internal archive`, and `codex-spec-internal status` for file and state operations. These scripts report or mutate files only. Workflow routing, role selection, and next-step decisions remain the responsibility of the active skill and main thread.

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

The main thread updates a row when a subagent response arrives, when a subagent is closed, and before milestone finish clears milestone context. During resume, the main thread only acts on rows whose status is not an ending status. Ending statuses are `completed`, `failed`, `closed`, and `stale`.

When a resumable row has an agent id, `$spec:resume` attempts to continue that agent. If that is not possible, the main thread marks the row `stale` and appends a new dispatch row for the remaining bounded task.

## Scheduling Rule

For normal workflow progress, the main thread schedules from subagent replies and dispatch status. It should not read role-owned run artifacts to perform that role's work. Run artifacts provide audit history, recovery material, and inputs for later dispatches.

## Decision Routing

Any role may return a `Decision Request` when several valid paths exist and the choice crosses that role's boundary.

The main thread first resolves it from `task.md`, `gate.md`, project rules, and prior decisions. If the route is clear, record the choice in `task.md` or a fix request, then dispatch the responsible role.

Only unresolved PM or Architect decisions become user decision gates. Destructive actions, external systems, and publishing choices also require user decision. Present 2-4 numbered options with impact and a recommendation. After the user chooses, record the decision in `task.md` under `User decisions` or in `summary.md` for milestone-finish choices.

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

`$spec:plan`: select one internal track and keep its artifacts file-based.

`explore` track clarifies early or vague requirements. The main thread creates or resumes `.agentflow/explore/<explore-id>/`, records planning state, writes a PM dispatch, and routes user decisions. PM owns question rounds, decisions, and `brief.md`. When the session closes, the main thread archives it.

`preflight` track audits existing requirement sources before formal planning. The main thread creates or resumes `.agentflow/preflight/<preflight-id>/`, records planning state, writes a PM dispatch, and routes user decisions. PM owns requirement-map, blocker-ledger, assumptions, decision queue, decision batches, and `brief.md`. When the session closes, the main thread archives it.

`commit` track dispatches PM to confirm requirements, update vision/roadmap when requested, select the next milestone, create the milestone run, write `task.md`, and produce the self-contained PM package under `.agentflow/runs/<run-id>/pm/`.

If the track is unclear, ask the user for 2-4 numbered options with impact and a recommendation. If an explore or preflight session becomes `ready-for-plan`, recommend a clean chat context before the commit track.

`$spec:design`: require a current run and a self-contained planning package. Dispatch Architect and Tester. Architect writes design, spec, and ADR drafts; Tester writes a test plan from the design. Before Doc Reviewer dispatch, move to `doc-reviewing`. Then dispatch Doc Reviewer to check consistency across requirements, design, spec, ADR, and test plan. On pass, write `gate.md` and move to `ready-to-execute`; on failure, write `fix-requests/doc-fix-<n>.md` and route the fix.

`$spec:design` uses the current run planning package as its requirements source. Archived explore or preflight sessions and original user source documents are evidence only when a dispatch explicitly lists them.

`$spec:execute`: require a current run and approved `gate.md`. Complete the current milestone from approved `gate.md`: dispatch Developer, dispatch Code Reviewer, dispatch Tester when coverage review is needed, verify acceptance evidence, finish the run, archive it, commit or record no-op, clear current state, and close milestone subagents.

Before `$spec:execute`, `gate.md` must be an approved contract with allowed source/test paths and required tests. Do not dispatch Developer for source edits outside that contract.

Review, verification, finish, archive, and milestone commit are internal `$spec:execute` stages. They are not user-facing workflow skills.

## Rejection Routing

This rule applies to manual execution and `$spec:auto`.

When PM, Architect, or Tester returns `fail`, `blocked`, `needs-context`, or `done-with-concerns`, or Doc Reviewer or Code Reviewer returns anything other than `pass`, the main thread routes the issue first:

1. Use the subagent reply to identify the issue and evidence paths.
2. Resolve any `Decision Request` through "Decision Routing".
3. Write or update `.agentflow/runs/<run-id>/fix-requests/*.md`.
4. If the responsible role, allowed input paths, and allowed output paths are clear, dispatch that subagent with the fix request and relevant ledger as allowed input.
5. After the fix, return to the corresponding workflow step or review gate.

The main thread enters blocked, or stops `$spec:auto`, only when safe routing is not possible. Typical cases include:

- the main thread cannot choose the responsible role, fix scope, or next gate safely;
- a user, external system, or destructive operation decision is needed;
- required artifacts are missing and cannot be recreated through a clear dispatch;
- the same open issue still has no executable next step after a fix attempt;
- `.agentflow/state.json.blocked = true`.

When stopping, the main thread writes `.agentflow/runs/<run-id>/summary.md` with stop reason, evidence paths, and recommended next action.

## Auto Execution

`$spec:auto` runs roadmap milestones serially. If the user provides an inline requirement with `$spec:auto`, start with `$spec:plan` using that requirement, then continue through `$spec:design` and `$spec:execute`. If no inline requirement and no confirmed roadmap exists, stop and recommend `$spec:plan`. For each milestone, create or resume its run, run `$spec:design` when no approved gate exists, then run `$spec:execute`. After every step, the main thread uses state, dispatch status, and subagent replies. On rejection, route the issue through "Rejection Routing" first; stop automatic progress only when safe routing is not possible.

## Milestone Boundary

A run represents one milestone execution unit. `$spec:execute` owns finish, archive, commit or no-op, state cleanup, and subagent closure before the next milestone starts. Archived runs are history; future workflow context comes from `agentflow/` or the current run package, not from archived run files unless a dispatch lists them as evidence.

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

Then run `codex-spec-internal state set --phase blocked --blocked true`.
