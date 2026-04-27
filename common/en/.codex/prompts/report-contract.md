# Report Contract

This file defines shared status and reply formats.

## Status Values

Use one of these values in subagent reports:

- `pass`: the task passed and can proceed.
- `fail`: the task found blocking defects.
- `blocked`: user, external, or destructive decision is required.
- `needs-context`: required input paths or instructions are missing.
- `done-with-concerns`: the task is complete, but non-blocking risks remain.

## Decision Request

Return a `Decision Request` when several valid paths exist and the choice crosses the current role boundary.

Include:

- 2-4 numbered options
- impact of each option
- recommended option
- whether progress is blocked

## Standard Report

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
```

Every report must list inputs read and outputs written. Route `done-with-concerns` only when `Required next action` contains a concrete action. Do not claim tests passed unless tests were run or a test report was read.
