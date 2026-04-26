# 文件协议

文件是工作流事实来源。聊天历史不是事实来源。所有路径都使用 repo-relative path，不使用绝对路径、代称或模糊名称。

## 语言

- 工作流产物、自然语言正文使用简体中文。
- 路径、命令和相关专业名词保持英文。

## 术语

| 术语 | 含义 |
|---|---|
| `workflow skill` | 主线程命令，例如 `$brainstorm`、`$plan`、`$design`、`$execute` 或 `$auto`。skill 编排工作流节点，并可创建 dispatch。 |
| `run-id` | 一个 milestone 执行单元，存放在 `.agentflow/runs/<run-id>/`。 |
| `brainstorm-id` | 一个 plan 前需求探索单元，存放在 `.agentflow/brainstorm/<brainstorm-id>/`。 |
| `brainstorm brief` | `.agentflow/brainstorm/<brainstorm-id>/brief.md`；brainstorm 产出的 planning 输入。 |
| `dispatch packet` | `.agentflow/runs/<run-id>/dispatch/<role>-<task-id>.md`；子代理一次任务读取的任务包。 |
| `task.md` | 当前 run 的目标、范围、约束、完成标准和用户决策。 |
| `gate.md` | 文档审查通过后生成的执行契约。Developer 和 Code Reviewer 以它作为实现边界。 |
| `dispatch-ledger.md` | 主线程维护的当前 run 调度状态表。 |
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

长期文件只在 milestone finish 阶段由对应 owner 同步。

## Brainstorm 文件

Brainstorm 文件记录一次 plan 前需求探索：

```text
.agentflow/brainstorm/<brainstorm-id>/
  brief.md
  notes.md
  questions.md
  source-map.md
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

`notes.md` 记录有效探索笔记。`questions.md` 记录已回答和未回答问题。`source-map.md` 记录用户提供的输入和已查看路径。`summary.md` 记录本次结果和归档状态。

PM planning 使用主线程指定的 brainstorm `brief.md` 路径。

## 当前 run 文件

```text
.agentflow/runs/<run-id>/
  dispatch-ledger.md
  task.md
  gate.md
  summary.md
  dispatch/
  pm/
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

## Gate 契约

`gate.md` 必须以机器可读 frontmatter 开头：

```yaml
---
status: approved
allowed_source_paths:
  - src/example-feature/**
allowed_test_paths:
  - tests/example-feature/**
required_tests:
  - npm test
doc_review_report: .agentflow/runs/<run-id>/doc-reviewer/review-report.md
---
```

Doc Reviewer 返回 `pass` 后，由主线程写入该文件。源码和测试写入只允许发生在 `executing` 阶段，并且目标路径必须被 `allowed_source_paths` 或 `allowed_test_paths` 覆盖。

## 归档文件

```text
.agentflow/archives/<run-id>/
.agentflow/archives/brainstorm/<brainstorm-id>/
```

`archives/` 是不可变历史。`codex-spec archive --run <run-id>` 会将完成的 `.agentflow/runs/<run-id>/` 移动到 `.agentflow/archives/<run-id>/`。`codex-spec archive --brainstorm <brainstorm-id>` 会将完成的 `.agentflow/brainstorm/<brainstorm-id>/` 移动到 `.agentflow/archives/brainstorm/<brainstorm-id>/`。归档不得覆盖已有归档。需要复用的事实必须同步到 `agentflow/` 或写入当前 run 的 `task.md`。

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
