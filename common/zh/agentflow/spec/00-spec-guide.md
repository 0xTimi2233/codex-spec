# Spec Guide

稳定的功能或模块规格写成：

```text
agentflow/spec/<domain>.md
```

示例：

```text
agentflow/spec/auth.md
agentflow/spec/api.md
agentflow/spec/cache.md
```

每个 spec 使用下面的表格：

| Section | Content |
|---|---|
| Owner | PM / Architect |
| Scope | 包含什么 |
| Non-goals | 不包含什么 |
| Inputs | 外部输入 |
| Outputs | 期望输出 |
| Behavior | 必须满足的行为 |
| Error handling | 错误行为 |
| Performance constraints | 可选 |
| Related ADRs | `agentflow/adr/...` |
| Test plan | `agentflow/spec/test-plan/<domain>.md` |

Spec 是稳定要求。临时执行记录写入 `.agentflow/runs/<run-id>/`。
