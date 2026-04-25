# Test Plan Guide

测试计划由 Tester 维护。

测试计划写成：

```text
agentflow/spec/test-plan/<domain>.md
```

每个测试计划应该直接对应 `agentflow/spec/<domain>.md`。

| Test area | Required cases | Type | Tool/command | Pass criteria | Notes |
|---|---|---|---|---|---|
| Decode/input | | unit | | | |
| Validation | | unit/integration | | | |
| Behavior | | integration | | | |
| Error cases | | unit/integration | | | |
| Regression | | regression | | | |
| Performance | | benchmark | | | |

除非写出测试名称或命令，否则不能声称已覆盖。
