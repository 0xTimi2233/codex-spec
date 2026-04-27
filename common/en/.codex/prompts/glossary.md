# Glossary

This file defines shared workflow terms.

| Term | Meaning |
|---|---|
| `workflow skill` | A main-thread workflow command such as `$plan`, `$design`, `$execute`, `$auto`, `$status`, or `$resume`. |
| `planning track` | The active `$plan` track: `explore`, `preflight`, or `commit`. |
| `planning session` | One active pre-run planning session recorded in `codexspec/runtime/state.json.current_planning_session`. |
| `run-id` | One milestone execution unit stored under `codexspec/runtime/runs/<run-id>/`. |
| `explore-id` | One pre-run discovery session stored under `codexspec/runtime/explore/<explore-id>/`. |
| `preflight-id` | One pre-plan requirement audit stored under `codexspec/runtime/preflight/<preflight-id>/`. |
| `planning package` | Self-contained, run-scoped PM input record under `codexspec/runtime/runs/<run-id>/task.md` and `codexspec/runtime/runs/<run-id>/pm/`. |
| `dispatch packet` | Task packet a subagent reads for one assignment. |
| `authoritative docs` | Dispatch-listed `codexspec/` documents a role must follow for the current assignment. |
| `dispatch ledger` | Main-thread dispatch status table for the current run or planning session. |
| `review ledger` | Reviewer-owned issue ledger for review rounds. |
| `role artifact` | Role output written under `codexspec/runtime/runs/<run-id>/<role>/`. |
| `archive` | Immutable runtime history. Archives are evidence, not future default context. |
