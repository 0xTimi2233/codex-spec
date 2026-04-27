# 文件协议

文件是工作流事实来源。聊天历史不是事实来源。所有路径都使用 repo-relative path，不使用绝对路径、代称或模糊名称。

## 语言

- 工作流产物、自然语言正文使用简体中文。
- 路径、命令和相关专业名词保持英文。

## 术语

| 术语 | 含义 |
|---|---|
| `workflow skill` | 主线程命令，例如 `$spec:plan`、`$spec:design`、`$spec:execute`、`$spec:auto`、`$spec:status` 或 `$spec:resume`。skill 编排工作流节点，并可创建 dispatch。 |
| `planning track` | 当前 `$spec:plan` track：`explore`、`preflight` 或 `commit`。 |
| `planning session` | 一个 active pre-run planning session，记录在 `.agentflow/state.json.current_planning_session`。 |
| `run-id` | 一个 milestone 执行单元，存放在 `.agentflow/runs/<run-id>/`。 |
| `explore-id` | 一个 pre-run 探索单元，存放在 `.agentflow/explore/<explore-id>/`。 |
| `explore round` | `.agentflow/explore/<explore-id>/rounds/round-<nnn>/round.md`；explore session 中一组追加式问题记录。 |
| `explore brief` | `.agentflow/explore/<explore-id>/brief.md`；由 explore rounds 合并得到的 planning 输入。 |
| `preflight-id` | 一个 plan 前需求审计单元，存放在 `.agentflow/preflight/<preflight-id>/`。 |
| `preflight brief` | `.agentflow/preflight/<preflight-id>/brief.md`；requirement preflight 产出的 planning 输入。 |
| `planning package` | 当前 run 的自包含、run-scoped PM 输入记录，位于 `.agentflow/runs/<run-id>/task.md` 和 `.agentflow/runs/<run-id>/pm/`。 |
| `dispatch packet` | `.agentflow/<work-unit>/dispatch/<role>-<task-id>.md`；子代理一次任务读取的任务包。`<work-unit>` 是 `runs/<run-id>`、`explore/<explore-id>` 或 `preflight/<preflight-id>`。 |
| `authoritative docs` | dispatch 列出的、当前任务必须遵循的 `agentflow/` 文档。 |
| `task.md` | 当前 run 的目标、范围、约束、完成标准和用户决策。 |
| `dispatch-ledger.md` | 主线程维护的当前 run 或 planning session 调度状态表。 |
| `review-ledger.md` | Reviewer 维护的跨轮问题记录。 |
| `verification.md` | milestone finish 前由主线程收集的验收证据。 |
| `summary.md` | 当前 run 的停止或完成摘要。 |
| `fix-requests/` | 主线程写给责任角色的修复请求。 |
| `role artifact` | 写入 `.agentflow/runs/<run-id>/<role>/` 的角色产物。 |

## 长期文件

| Path | 用途 | Owner |
|---|---|---|
| `agentflow/vision.md` | 产品目标、范围、非目标、项目约束 | PM |
| `agentflow/roadmap.md` | milestone、状态、依赖、退出条件 | PM |
| `agentflow/adr/*.md` | 已接受的架构决策 | Architect |
| `agentflow/spec/*.md` | 稳定方案、接口、行为规格 | Architect |
| `agentflow/spec/test-plan/*.md` | 稳定测试计划和验收矩阵 | Tester |

这些文件是唯一持久的产品、架构、规格和测试事实。当前 run 文件只记录工作过程和证据，不产生第二份事实。design 阶段，Architect 和 Tester 更新 dispatch 列出的 `agentflow/` 文档。Doc Reviewer pass 表示这些文档已一致，可进入执行。

## Explore 文件

Explore 文件记录一次 pre-run 需求探索。PM 负责 session 分析产物；主线程负责 state、dispatch、决策路由和归档。

```text
.agentflow/explore/<explore-id>/
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

`brief.md` 是 PM planning 输入：

```text
Status: draft | ready-for-plan | discarded
Goal:
Confirmed requirements:
Non-goals:
User decisions:
Open questions:
User preferences:
Constraints:
Candidate milestones:
Risks:
Recommended planning focus:
```

每个 `round.md` 记录一轮 1-3 个问题、用户回答、决策、读取输入和 round summary。旧 round 是稳定历史。session 结束时，将 rounds 合并为 `brief.md`。`summary.md` 记录本次结果和归档状态。

PM planning 使用主线程指定的 explore `brief.md` 路径。

## Preflight 文件

Preflight 文件在 planning 前审计已有需求。PM 负责需求分析产物；主线程负责 state、dispatch、决策路由和归档。

```text
.agentflow/preflight/<preflight-id>/
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

`brief.md` 是 PM planning 输入：

```text
Status: ready-for-plan | blocked | needs-more-source | discarded
Source coverage:
Requirement map summary:
Critical blockers:
User decisions:
Accepted assumptions:
Planning constraints:
Open questions:
Recommended roadmap shape:
Recommended planning focus:
```

`requirement-map.md` 记录 requirement id、来源路径、领域、依赖和影响。`blocker-ledger.md` 跟踪 P0/P1/P2 风险。`decisions/queue.md` 是可更新的当前状态；`decisions/batches/*.md` 是稳定的用户提问历史。preflight 结束时，将审计结果合并为 `brief.md`。

PM planning 使用主线程指定的 preflight `brief.md` 路径。

## 当前 run 文件

```text
.agentflow/runs/<run-id>/
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

PM package 是当前 milestone 的输入记录，不是可复用项目知识。它在 `$spec:design` 前必须自包含，将设计所需的相关需求、决策、约束、假设、未关闭风险、验收标准和来源引用写入 `.agentflow/runs/<run-id>/pm/requirements.md`、`.agentflow/runs/<run-id>/pm/scope.md`、`.agentflow/runs/<run-id>/pm/acceptance-criteria.md` 和 `.agentflow/runs/<run-id>/pm/planning-summary.md`。

`pm/planning-summary.md` 必须包含：

```text
Source coverage:
Copied requirements:
Decisions:
Open risks:
Ready for design: yes | no
```

run 中的角色产物是报告、ledger 和证据。不要在 `.agentflow/runs/<run-id>/` 下保存另一份 ADR、spec 或 test-plan 事实；需要更新时，直接更新 dispatch 列出的 `agentflow/` 文档。

## Dispatch Scope

Developer 和 Code Reviewer 使用 Developer dispatch 作为执行索引。dispatch 指向已审查通过的 `agentflow/` 文档，并限制本次编辑范围：

```text
Authoritative docs:
  - agentflow/vision.md
  - agentflow/roadmap.md
  - agentflow/adr/example.md
  - agentflow/spec/example.md
  - agentflow/spec/test-plan/example.md
Allowed input paths:
  - src/example-feature/**
  - tests/example-feature/**
Allowed source/test paths:
  - src/example-feature/**
  - tests/example-feature/**
Required tests:
  - npm test
Expected report path:
  - .agentflow/runs/<run-id>/developer/implementation-report.md
```

主线程根据子代理报告和 review 结果构造执行 dispatch。主线程只复制文档路径、源码/测试范围和 required tests，不通过理解 ADR 或 spec 内容自行推导。

## 归档文件

```text
.agentflow/archives/<run-id>/
.agentflow/archives/explore/<explore-id>/
.agentflow/archives/preflight/<preflight-id>/
```

`archives/` 是不可变历史。`codex-spec-internal archive --run <run-id>` 会将完成的 `.agentflow/runs/<run-id>/` 移动到 `.agentflow/archives/<run-id>/`。`codex-spec-internal archive --explore <explore-id>` 会将完成的 `.agentflow/explore/<explore-id>/` 移动到 `.agentflow/archives/explore/<explore-id>/`。`codex-spec-internal archive --preflight <preflight-id>` 会将完成的 `.agentflow/preflight/<preflight-id>/` 移动到 `.agentflow/archives/preflight/<preflight-id>/`。归档不得覆盖已有归档。可复用事实保存在 `agentflow/`；归档 run 只在 dispatch 列为证据时读取。

## 报告格式

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
Decision: pass | fail | blocked | needs-context | done-with-concerns
```

每份报告必须列出读取输入和写入输出。没有运行测试时，不得声称测试通过。

## Decision Request

下一步依赖跨越当前角色边界的选择时使用：

```text
User decision required:
Question:
Options:
1. <方案> - <影响>
2. <方案> - <影响>
Recommended option:
Blocking:
```
