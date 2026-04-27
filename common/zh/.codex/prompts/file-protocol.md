# 文件协议

本文件定义工作流文件语义。它是主线程的参考材料；子代理只有在 dispatch 明确列出时才读取。

所有路径都使用 repo-relative path。不使用绝对路径、代称或模糊名称。

## 语言

- 工作流产物、自然语言正文使用简体中文。
- 路径、命令和相关专业名词保持英文。

## 术语

| 术语 | 含义 |
|---|---|
| `workflow skill` | 主线程命令，例如 `$spec:plan`、`$spec:design`、`$spec:execute`、`$spec:auto`、`$spec:status` 或 `$spec:resume`。 |
| `planning track` | 当前 `$spec:plan` track：`explore`、`preflight` 或 `commit`。 |
| `planning session` | 一个 active pre-run planning session，记录在 `codexspec/runtime/state.json.current_planning_session`。 |
| `run-id` | 一个 milestone 执行单元，存放在 `codexspec/runtime/runs/<run-id>/`。 |
| `explore-id` | 一个 pre-run 探索单元，存放在 `codexspec/runtime/explore/<explore-id>/`。 |
| `preflight-id` | 一个 plan 前需求审计单元，存放在 `codexspec/runtime/preflight/<preflight-id>/`。 |
| `planning package` | `codexspec/runtime/runs/<run-id>/task.md` 和 `codexspec/runtime/runs/<run-id>/pm/` 下的自包含、run-scoped PM 输入记录。 |
| `dispatch packet` | `codexspec/runtime/<work-unit>/dispatch/<role>-<task-id>.md`；子代理一次任务读取的任务包。`<work-unit>` 是 `runs/<run-id>`、`explore/<explore-id>` 或 `preflight/<preflight-id>`。 |
| `authoritative docs` | dispatch 列出的、当前任务必须遵循的 `codexspec/` 文档。 |
| `dispatch-ledger.md` | 主线程维护的当前 run 或 planning session 调度状态表。 |
| `review-ledger.md` | Reviewer 维护的跨轮问题记录。 |
| `verification.md` | milestone finish 前由主线程收集的验收证据。 |
| `summary.md` | 当前 run 的停止或完成摘要。 |
| `fix-requests/` | 主线程写给责任角色的修复请求。 |
| `role artifact` | 写入 `codexspec/runtime/runs/<run-id>/<role>/` 的角色产物。 |

## 长期文件

| Path | 用途 | Owner |
|---|---|---|
| `codexspec/vision.md` | 产品目标、范围、非目标、项目约束 | PM |
| `codexspec/roadmap.md` | milestone、状态、依赖、退出条件 | PM |
| `codexspec/adr/*.md` | 已接受的架构决策 | Architect |
| `codexspec/spec/*.md` | 稳定方案、接口、行为规格 | Architect |
| `codexspec/spec/test-plan/*.md` | 稳定测试计划和验收矩阵 | Tester |

这些文件是持久的产品、架构、规格和测试事实。运行时文件只记录工作过程和证据，不产生第二份事实。

## Explore 文件

Explore 文件记录一次 pre-run 需求探索。

```text
codexspec/runtime/explore/<explore-id>/
  dispatch-ledger.md
  dispatch/
  brief.md
  rounds/
    round-001/
      round.md
    round-002/
      round.md
  summary.md
```

`round.md` 记录一轮问题、用户回答、决策、读取输入和 round summary。旧 round 是稳定历史。session 结束时，将 rounds 合并为 `brief.md`；后续 dispatch 列出该路径时，它作为 planning 输入。

## Preflight 文件

Preflight 文件审计 planning 前的已有需求。

```text
codexspec/runtime/preflight/<preflight-id>/
  dispatch-ledger.md
  dispatch/
  sources.md
  requirement-map.md
  blocker-ledger.md
  assumptions.md
  decisions/
    queue.md
    batches/
      batch-001.md
      batch-002.md
  brief.md
  summary.md
```

`requirement-map.md` 记录 requirement id、来源路径、领域、依赖和影响。`blocker-ledger.md` 跟踪 planning 风险。`decisions/queue.md` 是可更新的当前状态；`decisions/batches/*.md` 是稳定的用户提问历史。preflight 结束时，将审计结果合并为 `brief.md`；后续 dispatch 列出该路径时，它作为 planning 输入。

## 当前 run 文件

```text
codexspec/runtime/runs/<run-id>/
  dispatch-ledger.md
  task.md
  summary.md
  dispatch/
  pm/
    requirements.md
    scope.md
    acceptance-criteria.md
    planning-summary.md
  architect/
  tester/
  doc-reviewer/
  developer/
  code-reviewer/
  auditor/
  verification.md
  fix-requests/
  fix-responses/
```

PM package 是当前 milestone 的输入记录，不是可复用项目知识。它将设计所需的需求、决策、约束、假设、未关闭风险、验收标准和来源引用复制到 `codexspec/runtime/runs/<run-id>/pm/requirements.md`、`codexspec/runtime/runs/<run-id>/pm/scope.md`、`codexspec/runtime/runs/<run-id>/pm/acceptance-criteria.md` 和 `codexspec/runtime/runs/<run-id>/pm/planning-summary.md`。

run 中的角色产物是报告、ledger 和证据。不要在 `codexspec/runtime/runs/<run-id>/` 下保存另一份 ADR、spec 或 test-plan 事实；需要更新时，直接更新 dispatch 列出的 `codexspec/` 文档。

## 归档文件

```text
codexspec/runtime/archives/runs/<run-id>/
codexspec/runtime/archives/explore/<explore-id>/
codexspec/runtime/archives/preflight/<preflight-id>/
```

`archives/` 是不可变历史。归档不得覆盖已有归档。可复用事实保存在 `codexspec/`；归档 run 只在 dispatch 列为证据时读取。
