# 主线程工作流协议

主线程是 orchestrator、integrator 和 gatekeeper。主线程必须保持上下文干净：把角色工作分派给子代理，读取简短报告，解决冲突，并推进工作流状态。

## Repo-relative path 规则

所有 workflow 文件引用都必须使用 repo-relative path。不要写“approved plan”这种模糊名称，也不要写绝对路径。必须写 `.agentflow/runs/<run-id>/gate.md`。

## 状态机

| Phase | 含义 | 是否允许修改源码 | 进入下一阶段前必须存在的产物 | 下一阶段 |
|---|---|---:|---|---|
| `idle` | 没有活动 run | 否 | 无 | `planning` |
| `planning` | 创建 run，收集 PM/Architect/Tester 输入 | 否 | `.agentflow/runs/<run-id>/task.md`、`.agentflow/runs/<run-id>/gate.md` | `ready-to-execute` 或 `blocked` |
| `ready-to-execute` | approved plan 已准备好 | 否 | `.agentflow/runs/<run-id>/gate.md` | `executing` |
| `executing` | Developer 按 approved plan 实现 | 是 | `.agentflow/runs/<run-id>/developer/implementation-report.md`、`.agentflow/runs/<run-id>/developer/changed-files.md` | `ready-to-review` 或 `blocked` |
| `ready-to-review` | 实现等待评审 | 否 | developer 产物 | `reviewing` |
| `reviewing` | Reviewer/Tester/Performance 验证工作 | 否 | `.agentflow/runs/<run-id>/reviewer/review-report.md`、`.agentflow/runs/<run-id>/tester/test-report.md` | `ready-to-finish` 或 `executing` |
| `ready-to-finish` | review 通过，可以收口 | 否 | review/test 报告 | `finishing` |
| `finishing` | owner 同步长期文档 | 否 | `.agentflow/runs/<run-id>/summary.md` | `idle` |
| `blocked` | 需要用户或外部决策 | 否 | `.agentflow/runs/<run-id>/summary.md` 写清 blocker | 回到安全阶段 |
| `paused` | 用户暂停工作流 | 否 | `.agentflow/handoff.md` | 恢复到暂停前阶段 |

## 角色 ownership

| Owner | 长期文件 | Run 文件 |
|---|---|---|
| PM | `agentflow/vision.md`、`agentflow/roadmap.md` | `.agentflow/runs/<run-id>/pm/*` |
| Architect | `agentflow/adr/*.md`、`agentflow/spec/*.md` 的技术内容 | `.agentflow/runs/<run-id>/architect/*` |
| Tester | `agentflow/spec/test-plan/*.md` | `.agentflow/runs/<run-id>/tester/*` |
| Developer | 源码和测试代码 | `.agentflow/runs/<run-id>/developer/*` |
| Reviewer | 默认不拥有长期文件 | `.agentflow/runs/<run-id>/reviewer/*` |
| Researcher | 默认不拥有长期文件 | `.agentflow/runs/<run-id>/researcher/*` |
| Performance | 默认不拥有长期文件 | `.agentflow/runs/<run-id>/performance/*` |

长期文件只在 `finish` 阶段更新，或者主线程明确指派同步任务时更新。

## 标准 run 目录

```text
.agentflow/runs/<run-id>/
  task.md
  gate.md
  summary.md
  pm/journal.md
  pm/roadmap-update.md
  pm/final-status.md
  architect/journal.md
  architect/architecture-report.md
  architect/adr-draft.md
  architect/spec-draft.md
  tester/journal.md
  tester/test-plan.md
  tester/test-report.md
  developer/journal.md
  developer/implementation-report.md
  developer/changed-files.md
  reviewer/journal.md
  reviewer/review-report.md
  researcher/journal.md
  researcher/research-report.md
  performance/journal.md
  performance/performance-report.md
```

## 主线程职责

1. 读取 `agentflow/vision.md`、`agentflow/roadmap.md`、`.agentflow/state.json` 和当前 run 文件。
2. 只为明确范围的任务 spawn 需要的子代理。
3. 收集角色简短结果，并读取 role-owned run 文件。
4. 解决角色输出之间的冲突。
5. 写 `.agentflow/runs/<run-id>/gate.md` 和 `.agentflow/runs/<run-id>/summary.md`。
6. 通过 `codex-spec state set ...` 更新 `.agentflow/state.json`。
7. 在阶段边界运行 `codex-spec backup --label <label>`。
8. 在 milestone 边界关闭子代理上下文，下一个 milestone 使用新子代理。

## Blocked 格式

如果无法安全推进，写 `.agentflow/runs/<run-id>/summary.md`：

```text
Status: blocked
Reason: <具体 blocker>
Needed decision: <问题或动作>
Affected paths:
- <repo-relative path>
```

然后通过 `codex-spec state set --blocked true` 设置 `.agentflow/state.json.blocked = true`。
