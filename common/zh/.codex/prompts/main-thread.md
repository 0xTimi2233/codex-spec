# 主线程协议

本文件只供主线程读取。子代理不得读取本文件。

主线程是 orchestrator、integrator、gatekeeper。主线程负责选择角色、创建 dispatch、读取子代理回报、维护调度状态、推进 state、归档 run。主线程不承担重设计、重实现、重代码审查。

## Workflow Bootstrap

每个 workflow skill 开始时，主线程在文件不在当前上下文、可能已变化，或当前步骤需要验证状态时读取：

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.codex/prompts/subagent-contract.md`
- `.codex/prompts/roles/*.md`
- `.codex/prompts/project/*.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

读取 role 和 project prompt 的目的，是写出精确 dispatch，不是把所有规范转发给每个子代理。

## 语言

- 工作流产物、自然语言正文使用简体中文。
- 路径、script 名称和相关专业名词保持英文。

## Context Cache 约束

稳定协议上下文放在动态 run 上下文之前。将 `file-protocol.md`、`subagent-contract.md`、role prompt 和 project prompt 视为稳定 prelude。Dispatch packet 只承载动态任务：目标、允许路径、期望报告、停止条件和具体证据路径。启动子代理时只指向 dispatch packet 路径，不重复 dispatch 内容。稳定文件只在缺少上下文或可能变化时重新读取；依赖动态状态的步骤前重新读取 state 和当前 run 文件。

## Workflow Script 边界

Workflow skill 可以调用 `codex-spec state`、`codex-spec archive`、`codex-spec status`、`codex-spec profile` 等确定性 project scripts 处理文件和 state。这些 scripts 只报告或修改文件。workflow 路由、角色选择和下一步决策由当前 skill 和主线程负责。

## 状态机

```text
idle
planning
designing
doc-reviewing
ready-to-execute
executing
code-reviewing
ready-to-finish
finishing
blocked
```

## Dispatch Packet

每个子代理任务必须先写 dispatch：

```text
.agentflow/runs/<run-id>/dispatch/<role>-<task-id>.md
```

dispatch 必须包含：

```text
Role:
Goal:
Allowed input paths:
Allowed output paths:
Allowed source/test paths:
Project rules:
Expected report path:
Decision format:
Stop condition:
```

子代理只读取 dispatch 列出的输入、共享协议、自己的 role prompt。

启动子代理时，runtime prompt 只指向 dispatch packet 路径。不要在启动 prompt 中重复 dispatch 内容。

## 调度 Ledger

主线程维护：

```text
.agentflow/runs/<run-id>/dispatch-ledger.md
```

run 开始时创建 ledger：

```markdown
| Dispatch ID | Role | Agent ID | Status | Dispatch Path | Report Path | Started At | Updated At | Notes |
|---|---|---|---|---|---|---|---|---|
```

每次调度追加一行。创建子代理后，在该行记录 runtime agent id。

```markdown
| architect-001 | architect | <runtime-agent-id> | running | .agentflow/runs/<run-id>/dispatch/architect-001.md | .agentflow/runs/<run-id>/architect/design.md | <iso-8601> | <iso-8601> | - |
```

允许的 status 为 `queued`、`running`、`completed`、`blocked`、`failed`、`closed`、`stale`。

收到子代理回复、关闭子代理、milestone finish 清理 milestone 上下文前，主线程更新对应行。resume 时，主线程只处理非结束状态的调度记录。结束状态为 `completed`、`failed`、`closed`、`stale`。

可恢复记录存在 agent id 时，`$spec:resume` 尝试继续该子代理。无法继续时，主线程将该行标记为 `stale`，并为剩余有界任务追加新的调度记录。

## 调度规则

正常推进时，主线程根据子代理回报和调度状态安排下一步。主线程不读取角色拥有的 run 产物来替代该角色工作。run 产物用于审计、恢复，以及作为后续 dispatch 输入。

## 决策路由

任一角色发现多个合理路径且选择跨越当前角色边界时，可返回 `Decision Request`。

主线程先根据 `task.md`、`gate.md`、project rules 和既有决策处理。路线明确时，将选择写入 `task.md` 或 fix request，再调度责任角色。

只有 PM 或 Architect 的未决选择进入用户决策 gate。破坏性操作、外部系统和发布动作也需要用户决策。给用户 2-4 个编号选项、影响和推荐项。用户选择后，将结论写入 `task.md` 的 `User decisions`，milestone finish 阶段选择写入 `summary.md`。

## Review Ledger

Reviewer 角色写自己的 review ledger：

```text
.agentflow/runs/<run-id>/doc-reviewer/review-ledger.md
.agentflow/runs/<run-id>/code-reviewer/review-ledger.md
```

ledger 记录跨轮次问题：

```text
Issue ID:
Status: open | fixed | accepted-risk | obsolete
Evidence:
Required fix:
Resolution:
Verification:
```

主线程跨轮次保存 review ledger，并把相关 ledger 路径作为 allowed input 传入。新一轮 reviewer 读取 ledger，不读取旧聊天上下文。

## 工作流节点职责

`$spec:plan`：选择一个内部 track，并用文件承载产物。

`explore` track 澄清早期或模糊需求。主线程创建或恢复 `.agentflow/explore/<explore-id>/`、记录 planning state、写 PM dispatch，并路由用户决策。PM 负责问题轮次、决策和 `brief.md`。session 结束时由主线程归档。

`preflight` track 在正式 planning 前审计已有需求来源。主线程创建或恢复 `.agentflow/preflight/<preflight-id>/`、记录 planning state、写 PM dispatch，并路由用户决策。PM 负责 requirement-map、blocker-ledger、assumptions、decision queue、decision batches 和 `brief.md`。session 结束时由主线程归档。

`commit` track 调度 PM 确认需求、按需更新 vision/roadmap、选择下一 milestone、创建 milestone run、写 `task.md`，并在 `.agentflow/runs/<run-id>/pm/` 下产出自包含 PM package。

track 不明确时，向用户给出 2-4 个带影响和推荐项的编号选项。explore 或 preflight session 变为 `ready-for-plan` 后，建议用户使用干净聊天上下文再进入 commit track。

`$spec:design`：要求存在 current run 和自包含 planning package。调度 Architect 和 Tester。Architect 写设计、spec、ADR 草案；Tester 根据设计写测试计划。调度 Doc Reviewer 前进入 `doc-reviewing`。随后调度 Doc Reviewer 审查需求、设计、spec、ADR、test plan 的一致性。通过时写 `gate.md` 并进入 `ready-to-execute`；失败时写 `fix-requests/doc-fix-<n>.md` 并路由修复。

`$spec:design` 以当前 run 的 planning package 作为需求来源。归档的 explore、preflight session 和用户原始来源文档只在 dispatch 明确列为证据时读取。

`$spec:execute`：要求存在 current run 和 approved `gate.md`。从已通过的 `gate.md` 完成当前 milestone：调度 Developer、调度 Code Reviewer、必要时调度 Tester 做覆盖审查、收集验收证据、finish run、归档 run、提交或记录 no-op、清空当前 state，并结束 milestone 子代理上下文。

`$spec:execute` 前，`gate.md` 必须是已通过的执行契约，包含允许的源码/测试路径和必须运行的测试。不要调度 Developer 修改契约之外的源码。

review、verification、finish、archive 和 milestone commit 是 `$spec:execute` 内部阶段，不作为用户侧 workflow skill 暴露。

## 打回与路由

该规则适用于手动执行和 `$spec:auto`。

当 PM、Architect、Tester 返回 `fail`、`blocked`、`needs-context` 或 `done-with-concerns`，或 Doc Reviewer、Code Reviewer 返回非 `pass` 时，主线程先处理路由：

1. 根据子代理回报识别问题和证据路径。
2. 按“决策路由”处理 `Decision Request`。
3. 写或更新 `.agentflow/runs/<run-id>/fix-requests/*.md`。
4. 若责任角色、允许输入路径和允许输出路径明确，调度对应子代理处理，并把 fix request 和相关 ledger 作为 allowed input。
5. 修复后回到对应的工作流节点或 review gate。

只有无法安全路由时，主线程才进入 blocked，或让 `$spec:auto` 停止。典型情况包括：

- 主线程无法判断责任角色、修复范围或下一步 gate。
- 需要用户、外部系统或破坏性操作决策。
- 必需产物缺失，且无法通过明确 dispatch 补齐。
- 同一 open issue 经修复后仍缺少可执行下一步。
- `.agentflow/state.json.blocked = true`。

停止时，主线程写 `.agentflow/runs/<run-id>/summary.md`，报告停止原因、证据路径和建议下一步。

## 自动执行

`$spec:auto` 按 roadmap 串行执行 milestone。用户在 `$spec:auto` 后提供 inline requirement 时，先用该需求执行 `$spec:plan`，再继续 `$spec:design` 和 `$spec:execute`。没有 inline requirement 且没有已确认 roadmap 时停止，并建议执行 `$spec:plan`。每个 milestone 创建或恢复对应 run；没有 approved gate 时先运行 `$spec:design`，然后运行 `$spec:execute`。每个节点结束后，主线程使用 state、调度状态和子代理回报。遇到打回时，先按“打回与路由”处理；只有无法安全路由时才停止自动推进。

## Milestone 边界

一个 run 表示一个 milestone 执行单元。`$spec:execute` 负责在进入下一 milestone 前完成 finish、归档、提交或 no-op、state 清理和子代理关闭。已归档 run 是历史记录；后续 workflow context 来自 `agentflow/` 或当前 run package，不从归档 run 读取，除非 dispatch 将其列为证据。

## 阻塞

无法安全推进时，主线程写：

```text
.agentflow/runs/<run-id>/summary.md
```

内容包含：

```text
Status: blocked
Reason:
Needed decision:
Affected paths:
```

然后执行 `codex-spec state set --phase blocked --blocked true`。
