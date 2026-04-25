# Spec Guide

Create stable feature or module specs as:

```text
agentflow/spec/<domain>.md
```

Examples:

```text
agentflow/spec/auth.md
agentflow/spec/api.md
agentflow/spec/cache.md
```

Use this table inside each spec:

| Section | Content |
|---|---|
| Owner | PM / Architect |
| Scope | What is included |
| Non-goals | What is excluded |
| Inputs | External inputs |
| Outputs | Expected outputs |
| Behavior | Required behavior |
| Error handling | Required error behavior |
| Performance constraints | Optional |
| Related ADRs | `agentflow/adr/...` |
| Test plan | `agentflow/spec/test-plan/<domain>.md` |

Specs are stable requirements. Temporary execution records belong in `.agentflow/runs/<run-id>/`.
