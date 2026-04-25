# Test Plan Guide

Tester owns test plans.

Create test plans as:

```text
agentflow/spec/test-plan/<domain>.md
```

Each test plan should map directly to `agentflow/spec/<domain>.md`.

| Test area | Required cases | Type | Tool/command | Pass criteria | Notes |
|---|---|---|---|---|---|
| Decode/input | | unit | | | |
| Validation | | unit/integration | | | |
| Behavior | | integration | | | |
| Error cases | | unit/integration | | | |
| Regression | | regression | | | |
| Performance | | benchmark | | | |

Do not claim coverage unless tests are named or commands are recorded.
