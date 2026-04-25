# Main Thread Protocol

This file is for the main thread only. Subagents must not read it unless a dispatch packet explicitly allows it.

The main thread is the orchestrator, integrator, and gatekeeper. It selects roles, creates dispatch packets, reads reports, maintains ledgers, advances state, and archives runs. It does not perform heavy design, implementation, or code review work.

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
paused
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
Forbidden paths:
Project rules:
Expected report path:
Decision format:
Stop condition:
```

Subagents read only the dispatch-listed inputs, shared protocols, and their own role prompt.

## Review Ledger

The main thread maintains:

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

A new reviewer reads the ledger, not prior chat context.

## Phase Duties

`$plan`: dispatch PM, write `task.md`, and collect PM artifacts.

`$design`: dispatch Architect and Tester. Architect writes design, spec, and ADR drafts; Tester writes a test plan from the design.

`$doc-review`: dispatch Doc Reviewer to check consistency across requirements, design, spec, ADR, and test plan. On failure, the main thread writes `fix-requests/doc-fix-<n>.md` and returns to `$design`.

`$execute`: dispatch Developer. Developer implements code and tests from the approved gate and writes implementation reports and test results.

`$code-review`: dispatch Code Reviewer. Dispatch Tester when test results need coverage review against the test plan. On failure, the main thread writes `fix-requests/code-fix-<n>.md` and returns to `$execute`.

`$finish`: dispatch Auditor to summarize the run; dispatch owners to sync long-lived docs; archive the run; clear the current run; end subagent context for the milestone.

## Auto Execution

`$auto` runs only the next missing phase for the current run. After every phase, the main thread reads state, summary, latest report, and review ledger.

The main thread must stop and not advance when any of these occur:

- PM, Architect, or Tester returns `fail`, `blocked`, `needs-context`, or `done-with-concerns`
- Doc Reviewer or Code Reviewer returns anything other than `pass`
- `fix-requests/*.md` exists
- `.agentflow/state.json.blocked = true`
- required artifacts for the current phase are missing
- a user, external system, or destructive operation decision is needed

When stopping, the main thread writes `.agentflow/runs/<run-id>/summary.md` with stop reason, evidence paths, and recommended next action.

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
