---
name: spec:execute
description: Complete the current milestone from reviewed authoritative documents through implementation, review, verification, archive, and commit.
---

# Skill: spec:execute

## Context Inputs

Read these paths only when they are not already in the active context or their contents may have changed:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/glossary.md`
- `.codex/prompts/file-index.md`
- `codexspec/runtime/state.json`
- `codexspec/runtime/runs/<run-id>/dispatch-ledger.md`
- `codexspec/runtime/runs/<run-id>/doc-reviewer/review-report.md`

## Procedure

1. Confirm the current run is `ready-to-execute` and the latest Doc Reviewer report has `Status: pass`.
2. Run `codex-spec-internal state set --phase executing --run <run-id>`.
3. Write `codexspec/runtime/runs/<run-id>/dispatch/developer-001.md` with authoritative `codexspec/` document paths, allowed source/test write scope, required tests, scope sources, and Developer output paths.
4. Build scope from the Architect report and Tester test-plan report; use the Doc Reviewer report only to confirm there are no blocking gaps or conflicts. Do not derive scope by interpreting ADR or spec content. Append the Developer dispatch row, dispatch Developer, record the runtime agent id, and update the row when the Developer response arrives.
5. Developer writes implementation report, changed files, and test result.
6. Run `codex-spec-internal state set --phase code-reviewing --run <run-id>`.
7. Dispatch Code Reviewer with the Developer dispatch, authoritative `codexspec/` document paths, Developer outputs, relevant source/test paths, coding standards, and review ledger.
8. Dispatch Tester when test result coverage needs checking against the test plan.
9. On review failure, write `codexspec/runtime/runs/<run-id>/fix-requests/code-fix-<n>.md` and route to Developer, Architect, Tester, or PM.
10. On review pass, run `codex-spec-internal state set --phase ready-to-finish --run <run-id> --blocked false`.
11. Collect acceptance evidence into `codexspec/runtime/runs/<run-id>/verification.md`.
12. Run `codex-spec-internal state set --phase finishing --run <run-id>`.
13. Dispatch Auditor to summarize the run.
14. Confirm required long-lived document changes already happened during `$spec:plan` or `$spec:design`. Do not introduce new ADR, spec, or test-plan changes during finish.
15. Close any still-open runtime agent ids recorded in `dispatch-ledger.md` and confirm there are no `queued`, `running`, or `blocked` rows.
16. Update the current milestone result in `codexspec/roadmap.md`.
17. Write `codexspec/runtime/runs/<run-id>/summary.md` with result, evidence, roadmap update, archive plan, and commit or no-op plan.
18. Commit completed user-facing code, test, and long-lived documentation changes; if there is no commit-worthy diff, do not create an empty commit.
19. After commit or no-op succeeds, run `codex-spec-internal archive --run <run-id>`.
20. After archive succeeds, run `codex-spec-internal state set --phase idle --run null --milestone null --blocked false`.

## Required Outputs

- `codexspec/runtime/runs/<run-id>/developer/implementation-report.md`
- `codexspec/runtime/runs/<run-id>/developer/changed-files.md`
- `codexspec/runtime/runs/<run-id>/developer/test-result.md`
- `codexspec/runtime/runs/<run-id>/code-reviewer/review-report.md`
- `codexspec/runtime/runs/<run-id>/code-reviewer/review-ledger.md`
- `codexspec/runtime/runs/<run-id>/verification.md`
- `codexspec/runtime/runs/<run-id>/auditor/audit-report.md`
- `codexspec/runtime/runs/<run-id>/summary.md`
- updated `codexspec/roadmap.md`
- updated `codexspec/runtime/runs/<run-id>/dispatch-ledger.md`
- `codexspec/runtime/archives/runs/<run-id>/`
- milestone git commit or summary no-op record

## Next

Return milestone result, archive path, commit status, next recommended milestone action, or blocker.
