# 文件协议

所有 agent 和主线程都通过文件共享状态。聊天历史不是事实来源。

## 路径语言

每个回复和 artifact 都必须使用 repo-relative path。不要使用绝对路径、代称或模糊名称。

示例：

- 正确：`.agentflow/runs/2026-04-25T120000Z-auth/developer/implementation-report.md`
- 错误：`/home/me/project/.agentflow/...`
- 错误：`implementation report`

## 长期文件

| Path | 用途 | Owner |
|---|---|---|
| `agentflow/vision.md` | 产品目标、范围、非目标、约束 | PM |
| `agentflow/roadmap.md` | Milestone、状态、依赖、退出条件 | PM |
| `agentflow/adr/*.md` | 已接受的架构决策 | Architect |
| `agentflow/spec/<domain>.md` | 稳定功能/模块规格 | PM + Architect |
| `agentflow/spec/test-plan/<domain>.md` | 稳定验证计划 | Tester |

## 运行文件

| Path | 用途 | Writer |
|---|---|---|
| `.agentflow/state.json` | 极简机器状态指针 | `codex-spec` CLI / hooks |
| `.agentflow/handoff.md` | pause/resume 交接说明 | 主线程 |
| `.agentflow/runs/<run-id>/` | 当前任务协作记录 | 主线程 + 角色代理 |
| `.agentflow/backups/` | 阶段边界 checkpoint | `codex-spec backup` |

## 必需产物

| Phase | Required paths |
|---|---|
| `planning` | `.agentflow/runs/<run-id>/task.md`、`.agentflow/runs/<run-id>/gate.md` |
| `executing` | `.agentflow/runs/<run-id>/developer/implementation-report.md`、`.agentflow/runs/<run-id>/developer/changed-files.md` |
| `reviewing` | `.agentflow/runs/<run-id>/reviewer/review-report.md`、`.agentflow/runs/<run-id>/tester/test-report.md` |
| `finishing` | `.agentflow/runs/<run-id>/summary.md` |

## 必需报告格式

```text
Status: pass | fail | blocked
Summary: <一段摘要>
Inputs read:
- <repo-relative path>
Outputs written:
- <repo-relative path>
Findings:
- <finding>
Required next action:
- <action or none>
Decision: pass | fail | blocked
```

## Draft then sync

角色代理先把草案写入 `.agentflow/runs/<run-id>/<role>/`。`agentflow/` 下的长期文件只在 `finish` 阶段同步，或者由主线程明确要求对应 owner 同步。
