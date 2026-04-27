# 文件索引

所有路径都使用 repo-relative path。不使用绝对路径、代称或模糊名称。探索或审计任务的输入可使用 repo-relative 目录或 glob 作为 input scope；输出路径必须是具体文件。

## 长期文件

| Path | 用途 | Owner |
|---|---|---|
| `codexspec/vision.md` | 产品目标、范围、非目标、项目约束 | PM |
| `codexspec/roadmap.md` | milestone、状态、依赖、退出条件 | PM |
| `codexspec/adr/*.md` | 已接受的架构决策 | Architect |
| `codexspec/spec/*.md` | 稳定方案、接口、行为规格 | Architect |
| `codexspec/spec/test-plan/*.md` | 稳定测试计划和验收矩阵 | Tester |

长期文件是持久的产品、架构、规格和测试事实。运行时文件只记录工作过程和证据，不产生第二份事实。

## 运行时文件

```text
codexspec/runtime/state.json

codexspec/runtime/explore/<explore-id>/
  dispatch-ledger.md
  dispatch/
  brief.md
  rounds/<round-id>/round.md
  summary.md

codexspec/runtime/preflight/<preflight-id>/
  dispatch-ledger.md
  dispatch/
  sources.md
  requirement-map.md
  blocker-ledger.md
  assumptions.md
  decisions/queue.md
  decisions/batches/<batch-id>.md
  brief.md
  summary.md

codexspec/runtime/runs/<run-id>/
  dispatch-ledger.md
  task.md
  summary.md
  dispatch/<role>-<task-id>.md
  pm/requirements.md
  pm/scope.md
  pm/acceptance-criteria.md
  pm/planning-summary.md
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

PM package 是当前 milestone 的输入记录，不是可复用项目知识。run 中的角色产物是报告、ledger 和证据。

## 归档

```text
codexspec/runtime/archives/runs/<run-id>/
codexspec/runtime/archives/explore/<explore-id>/
codexspec/runtime/archives/preflight/<preflight-id>/
```

archive 是不可变历史。归档不得覆盖已有归档。可复用事实保存在 `codexspec/`；归档文件只在 dispatch 列出时读取。
