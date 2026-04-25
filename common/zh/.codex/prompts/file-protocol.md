# 文件协议

文件是工作流事实来源。聊天历史不是事实来源。所有路径都使用 repo-relative path，不使用绝对路径、代称或模糊名称。

## 长期文件

| Path | 用途 | Owner |
|---|---|---|
| `agentflow/vision.md` | 产品目标、范围、非目标、项目约束 | PM |
| `agentflow/roadmap.md` | milestone、状态、依赖、退出条件 | PM |
| `agentflow/adr/*.md` | 已接受的架构决策 | Architect |
| `agentflow/spec/*.md` | 稳定方案、接口、行为规格 | Architect |
| `agentflow/spec/test-plan/*.md` | 稳定测试计划和验收矩阵 | Tester |

长期文件只在 `$finish` 阶段由对应 owner 同步。

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
  fix-requests/
  fix-responses/
```

## 归档文件

```text
.agentflow/archives/<run-id>/
```

`archives/` 是不可变历史。后续 run 不从 `archives/` 读取上下文；需要复用的事实必须同步到 `agentflow/` 或写入当前 run 的 `task.md`。

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
