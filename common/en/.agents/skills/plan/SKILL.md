---
name: plan
description: Explore, audit, or confirm requirements, then prepare the next milestone run.
---

# Skill: plan

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/glossary.md`
- `.codex/prompts/file-index.md`
- `codexspec/vision.md`
- `codexspec/roadmap.md`
- `codexspec/runtime/explore/<explore-id>/brief.md` when continuing an explore track
- `codexspec/runtime/preflight/<preflight-id>/brief.md` when continuing a preflight track
- source requirement paths specified by the user
- `codexspec/runtime/state.json`
- fields `current_planning_session` and `planning_track` in `codexspec/runtime/state.json` when a planning session is active

## Procedure

1. Bootstrap workflow context from protocol, agent TOML files, roadmap, and state when needed; load target project rules only when writing dispatch.
2. If an active run exists, stop and recommend `$resume`, `$status`, `$design`, or `$execute` according to the current phase.
3. Choose the track from user intent and available inputs:
   - `explore`: clarify vague or early requirements before formal planning.
   - `preflight`: audit existing requirement sources for planning blockers.
   - `commit`: confirm requirements, create a run, and dispatch PM.
4. If the track is unclear, ask the user for a numbered choice with impacts and a recommendation.
5. For `explore`, create or continue `codexspec/runtime/explore/<explore-id>/`, set `codex-spec-internal state set --planning-session <explore-id> --planning-track explore --blocked false`, write `codexspec/runtime/explore/<explore-id>/dispatch-ledger.md` when missing, write `codexspec/runtime/explore/<explore-id>/dispatch/pm-<n>.md` for the next question round or closure, append the PM row, dispatch PM, and update the row, `rounds/<round-id>/round.md`, and `brief.md` when PM replies.
6. For `preflight`, create or continue `codexspec/runtime/preflight/<preflight-id>/`, set `codex-spec-internal state set --planning-session <preflight-id> --planning-track preflight --blocked false`, write `codexspec/runtime/preflight/<preflight-id>/dispatch-ledger.md` when missing, write `codexspec/runtime/preflight/<preflight-id>/dispatch/pm-<n>.md` for requirement audit or closure, append the PM row, dispatch PM, and update the row, audit artifacts, and `brief.md` when PM replies.
7. When an explore or preflight track is closed as `ready-for-plan` or `discarded`, run `codex-spec-internal archive --explore <explore-id>` or `codex-spec-internal archive --preflight <preflight-id>`, then clear planning state with `codex-spec-internal state set --planning-session null --planning-track null`.
8. For `commit`, choose the roadmap milestone id for this run, create a run id, and write `codexspec/runtime/runs/<run-id>/dispatch-ledger.md` with the dispatch table header.
9. Run `codex-spec-internal state set --phase planning --run <run-id> --milestone <milestone-id> --planning-session null --planning-track null --blocked false`.
10. Write `codexspec/runtime/runs/<run-id>/dispatch/pm-001.md` with the planning input and self-contained PM output paths.
11. Append the PM row to `dispatch-ledger.md`, dispatch PM, record the runtime agent id, and update the row when the PM response arrives.
12. PM confirms requirements, scope, non-goals, roadmap milestones, acceptance criteria, and `pm/planning-summary.md`.
13. When requested by dispatch, PM may update `codexspec/vision.md` and `codexspec/roadmap.md`.
14. Confirm the planning package is self-contained before returning `$design` as next step.

## Planning Package

The `commit` track must copy every relevant requirement, decision, constraint, assumption, open risk, and acceptance criterion into the current run. This is a run-scoped planning record for the current milestone:

- `codexspec/runtime/runs/<run-id>/task.md`
- `codexspec/runtime/runs/<run-id>/pm/requirements.md`
- `codexspec/runtime/runs/<run-id>/pm/scope.md`
- `codexspec/runtime/runs/<run-id>/pm/acceptance-criteria.md`
- `codexspec/runtime/runs/<run-id>/pm/planning-summary.md`

Downstream design uses this package as the planning input. Reusable product knowledge belongs in `codexspec/`.

## PM Decision Handling

If PM returns a `Decision Request` that the main thread cannot resolve, present the numbered options to the user, record the selected answer in `task.md` under `User decisions`, and dispatch PM again with that decision as input.

## Required Outputs

For `explore`:

- `codexspec/runtime/explore/<explore-id>/dispatch-ledger.md`
- `codexspec/runtime/explore/<explore-id>/dispatch/pm-<n>.md`
- `codexspec/runtime/explore/<explore-id>/rounds/<round-id>/round.md`
- `codexspec/runtime/explore/<explore-id>/brief.md`
- `codexspec/runtime/explore/<explore-id>/summary.md` when the session closes

For `preflight`:

- `codexspec/runtime/preflight/<preflight-id>/dispatch-ledger.md`
- `codexspec/runtime/preflight/<preflight-id>/dispatch/pm-<n>.md`
- `codexspec/runtime/preflight/<preflight-id>/sources.md`
- `codexspec/runtime/preflight/<preflight-id>/requirement-map.md`
- `codexspec/runtime/preflight/<preflight-id>/blocker-ledger.md`
- `codexspec/runtime/preflight/<preflight-id>/assumptions.md`
- `codexspec/runtime/preflight/<preflight-id>/decisions/queue.md`
- `codexspec/runtime/preflight/<preflight-id>/decisions/batches/<batch-id>.md`
- `codexspec/runtime/preflight/<preflight-id>/brief.md`
- `codexspec/runtime/preflight/<preflight-id>/summary.md` when the session closes

For `commit`:

- `codexspec/runtime/runs/<run-id>/task.md`
- `codexspec/runtime/runs/<run-id>/dispatch-ledger.md`
- `codexspec/runtime/runs/<run-id>/dispatch/pm-001.md`
- `codexspec/runtime/runs/<run-id>/pm/requirements.md`
- `codexspec/runtime/runs/<run-id>/pm/scope.md`
- `codexspec/runtime/runs/<run-id>/pm/acceptance-criteria.md`
- `codexspec/runtime/runs/<run-id>/pm/planning-summary.md` with source coverage, copied requirements, decisions, open risks, and ready-for-design status
- updated `codexspec/vision.md` or `codexspec/roadmap.md` when PM dispatch requests it

## Next

Return active track, run id, created files, next step `$design`, or blocker.
