---
name: spec:plan
description: Explore, audit, or confirm requirements, then prepare the next milestone run.
---

# Skill: spec:plan

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/explore/<explore-id>/brief.md` when continuing an explore track
- `.agentflow/preflight/<preflight-id>/brief.md` when continuing a preflight track
- source requirement paths specified by the user
- `.agentflow/state.json`
- fields `current_planning_session` and `planning_track` in `.agentflow/state.json` when a planning session is active

## Procedure

1. Bootstrap workflow context from protocol, role prompts, project rules, roadmap, and state when needed.
2. If an active run exists, stop and recommend `$spec:resume`, `$spec:status`, `$spec:design`, or `$spec:execute` according to the current phase.
3. Choose the track from user intent and available inputs:
   - `explore`: clarify vague or early requirements before formal planning.
   - `preflight`: audit existing requirement sources for planning blockers.
   - `commit`: confirm requirements, create a run, and dispatch PM.
4. If the track is unclear, ask the user for a numbered choice with impacts and a recommendation.
5. For `explore`, create or continue `.agentflow/explore/<explore-id>/`, set `codex-spec-internal state set --planning-session <explore-id> --planning-track explore --blocked false`, write `.agentflow/explore/<explore-id>/dispatch-ledger.md` when missing, write `.agentflow/explore/<explore-id>/dispatch/pm-<n>.md` for the next question round or closure, append the PM row, dispatch PM, and update the row when PM replies.
6. For `preflight`, create or continue `.agentflow/preflight/<preflight-id>/`, set `codex-spec-internal state set --planning-session <preflight-id> --planning-track preflight --blocked false`, write `.agentflow/preflight/<preflight-id>/dispatch-ledger.md` when missing, write `.agentflow/preflight/<preflight-id>/dispatch/pm-<n>.md` for requirement audit or closure, append the PM row, dispatch PM, and update the row when PM replies.
7. When an explore or preflight track is closed as `ready-for-plan` or `discarded`, run `codex-spec-internal archive --explore <explore-id>` or `codex-spec-internal archive --preflight <preflight-id>`, then clear planning state with `codex-spec-internal state set --planning-session null --planning-track null`.
8. For `commit`, create a run id and write `.agentflow/runs/<run-id>/dispatch-ledger.md` with the dispatch table header.
9. Run `codex-spec-internal state set --phase planning --run <run-id> --planning-session null --planning-track null --blocked false`.
10. Write `.agentflow/runs/<run-id>/dispatch/pm-001.md` with the planning input and self-contained PM output paths.
11. Append the PM row to `dispatch-ledger.md`, dispatch PM, record the runtime agent id, and update the row when the PM response arrives.
12. PM confirms requirements, scope, non-goals, roadmap milestones, acceptance criteria, and `pm/planning-summary.md`.
13. When requested by dispatch, PM may update `agentflow/vision.md` and `agentflow/roadmap.md`.
14. Confirm the planning package is self-contained before returning `$spec:design` as next step.

## Planning Package

The `commit` track must copy every relevant requirement, decision, constraint, assumption, open risk, and acceptance criterion into the current run. This is a run-scoped planning record for the current milestone:

- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`
- `.agentflow/runs/<run-id>/pm/scope.md`
- `.agentflow/runs/<run-id>/pm/acceptance-criteria.md`
- `.agentflow/runs/<run-id>/pm/planning-summary.md`

Downstream design uses this package as the planning input. Reusable product knowledge belongs in `agentflow/`.

## PM Decision Handling

If PM returns `User decision required`, present the numbered options to the user, record the selected answer in `task.md` under `User decisions`, and dispatch PM again with that decision as input.

## Required Outputs

For `explore`:

- `.agentflow/explore/<explore-id>/dispatch-ledger.md`
- `.agentflow/explore/<explore-id>/dispatch/pm-<n>.md`
- `.agentflow/explore/<explore-id>/brief.md`
- `.agentflow/explore/<explore-id>/summary.md` when the session closes

For `preflight`:

- `.agentflow/preflight/<preflight-id>/dispatch-ledger.md`
- `.agentflow/preflight/<preflight-id>/dispatch/pm-<n>.md`
- `.agentflow/preflight/<preflight-id>/brief.md`
- `.agentflow/preflight/<preflight-id>/summary.md` when the session closes

For `commit`:

- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/dispatch/pm-001.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`
- `.agentflow/runs/<run-id>/pm/scope.md`
- `.agentflow/runs/<run-id>/pm/acceptance-criteria.md`
- `.agentflow/runs/<run-id>/pm/planning-summary.md` with source coverage, copied requirements, decisions, open risks, and ready-for-design status
- updated `agentflow/vision.md` or `agentflow/roadmap.md` when PM dispatch requests it

## Next

Return active track, run id, created files, next step `$spec:design`, or blocker.
