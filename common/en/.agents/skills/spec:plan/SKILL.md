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
- `.agentflow/state.json.current_planning_session` and `.agentflow/state.json.planning_track` when a planning session is active

## Procedure

1. Choose the track from user intent and available inputs:
   - `explore`: clarify vague or early requirements before formal planning.
   - `preflight`: audit existing requirement sources for planning blockers.
   - `commit`: confirm requirements, create a run, and dispatch PM.
2. If the track is unclear, ask the user for a numbered choice with impacts and a recommendation.
3. For `explore`, create or continue `.agentflow/explore/<explore-id>/`, set `codex-spec state set --planning-session <explore-id> --planning-track explore --blocked false`, append a round under `rounds/round-<nnn>/round.md`, and update `brief.md`.
4. For `preflight`, create or continue `.agentflow/preflight/<preflight-id>/`, set `codex-spec state set --planning-session <preflight-id> --planning-track preflight --blocked false`, update requirement audit files, and update `brief.md`.
5. When an explore or preflight track is closed as `ready-for-plan` or `discarded`, run `codex-spec archive --explore <explore-id>` or `codex-spec archive --preflight <preflight-id>`, then clear planning state with `codex-spec state set --planning-session null --planning-track null`.
6. For `commit`, create a run id and write `.agentflow/runs/<run-id>/dispatch-ledger.md` with the dispatch table header.
7. Run `codex-spec state set --phase planning --run <run-id> --planning-session null --planning-track null --blocked false`.
8. Write `.agentflow/runs/<run-id>/dispatch/pm-001.md` with the planning input and self-contained PM output paths.
9. Append the PM row to `dispatch-ledger.md`, dispatch PM, record the runtime agent id, and update the row when the PM response arrives.
10. PM confirms requirements, scope, non-goals, roadmap milestones, and acceptance criteria.
11. When requested by dispatch, PM may update `agentflow/vision.md` and `agentflow/roadmap.md`.
12. Write the self-contained planning package.

## Planning Package

The `commit` track must copy every relevant requirement, decision, constraint, assumption, open risk, and acceptance criterion into the current run:

- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`
- `.agentflow/runs/<run-id>/pm/scope.md`
- `.agentflow/runs/<run-id>/pm/acceptance-criteria.md`
- `.agentflow/runs/<run-id>/pm/planning-summary.md`

Downstream design uses this package as the planning source.

## PM Decision Handling

If PM returns `User decision required`, present the numbered options to the user, record the selected answer in `task.md` under `User decisions`, and dispatch PM again with that decision as input.

## Required Outputs

- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/dispatch/pm-001.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`
- `.agentflow/runs/<run-id>/pm/scope.md`
- `.agentflow/runs/<run-id>/pm/acceptance-criteria.md`
- `.agentflow/runs/<run-id>/pm/planning-summary.md`
- updated `agentflow/vision.md` or `agentflow/roadmap.md` when PM dispatch requests it

## Next

Return active track, run id, created files, next step `$spec:design`, or blocker.
