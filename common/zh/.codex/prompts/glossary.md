# 术语表

本文件定义工作流共享术语。

| 术语 | 含义 |
|---|---|
| `workflow skill` | 主线程工作流命令，例如 `$spec:plan`、`$spec:design`、`$spec:execute`、`$spec:auto`、`$spec:status` 或 `$spec:resume`。 |
| `planning track` | 当前 `$spec:plan` track：`explore`、`preflight` 或 `commit`。 |
| `planning session` | 一个 active pre-run planning session，记录在 `codexspec/runtime/state.json.current_planning_session`。 |
| `run-id` | 一个 milestone 执行单元，存放在 `codexspec/runtime/runs/<run-id>/`。 |
| `explore-id` | 一个 pre-run 探索单元，存放在 `codexspec/runtime/explore/<explore-id>/`。 |
| `preflight-id` | 一个 plan 前需求审计单元，存放在 `codexspec/runtime/preflight/<preflight-id>/`。 |
| `planning package` | `codexspec/runtime/runs/<run-id>/task.md` 和 `codexspec/runtime/runs/<run-id>/pm/` 下的自包含、run-scoped PM 输入记录。 |
| `dispatch packet` | 子代理一次任务读取的任务包。 |
| `authoritative docs` | dispatch 列出的、当前任务必须遵循的 `codexspec/` 文档。 |
| `dispatch ledger` | 主线程维护的当前 run 或 planning session 调度状态表。 |
| `review ledger` | Reviewer 维护的跨轮问题记录。 |
| `role artifact` | 写入 `codexspec/runtime/runs/<run-id>/<role>/` 的角色产物。 |
| `archive` | 不可变运行历史。archive 是证据，不是未来默认上下文。 |
