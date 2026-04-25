# 主线程协议

本文件只供主线程读取。子代理不得读取本文件，除非 dispatch 明确允许。

主线程是 orchestrator、integrator、gatekeeper。主线程负责选择角色、创建 dispatch、读取报告、维护 ledger、推进 state、归档 run。主线程不承担重设计、重实现、重代码审查。

## 启动上下文

主线程初始化时读取：

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.codex/prompts/subagent-contract.md`
- `.codex/prompts/roles/*.md`
- `.codex/prompts/project/*.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

读取 role 和 project prompt 的目的，是写出精确 dispatch，不是把所有规范转发给每个子代理。

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
paused
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
Forbidden paths:
Project rules:
Expected report path:
Decision format:
Stop condition:
```

子代理只读取 dispatch 列出的输入、共享协议、自己的 role prompt。

## Review Ledger

主线程维护：

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

新一轮 reviewer 读取 ledger，不读取旧聊天上下文。

## 工作流节点职责

`$plan`：调度 PM，写 `task.md` 和 PM 产物。

`$design`：调度 Architect 和 Tester。Architect 写设计、spec、ADR 草案；Tester 根据设计写测试计划。

`$doc-review`：调度 Doc Reviewer，审查需求、设计、spec、ADR、test plan 的一致性。失败时主线程写 `fix-requests/doc-fix-<n>.md` 并回到 `$design`。

`$execute`：调度 Developer。Developer 根据通过 gate 的 dispatch 写代码、测试代码、实现报告和测试结果。

`$code-review`：调度 Code Reviewer。必要时调度 Tester 审查测试结果是否覆盖 test plan。失败时主线程写 `fix-requests/code-fix-<n>.md` 并回到 `$execute`。

`$finish`：调度 Auditor 总结当前 run；调度 owner 同步长期文档；归档 run；清空 current run；结束当前 milestone 子代理上下文。

## 打回与路由

该规则适用于手动执行和 `$auto`。

当 PM、Architect、Tester 返回 `fail`、`blocked`、`needs-context` 或 `done-with-concerns`，或 Doc Reviewer、Code Reviewer 返回非 `pass` 时，主线程先处理路由：

1. 读取相关 report、review ledger 和证据路径。
2. 写或更新 `.agentflow/runs/<run-id>/fix-requests/*.md`。
3. 若责任角色、允许输入路径和允许输出路径明确，调度对应子代理处理，并把 fix request 和相关 ledger 作为 allowed input。
4. 修复后回到对应的工作流节点或 review gate。

只有无法安全路由时，主线程才进入 blocked，或让 `$auto` 停止。典型情况包括：

- 主线程无法判断责任角色、修复范围或下一步 gate。
- 需要用户、外部系统或破坏性操作决策。
- 必需产物缺失，且无法通过明确 dispatch 补齐。
- 同一 open issue 经修复后仍缺少可执行下一步。
- `.agentflow/state.json.blocked = true`。

停止时，主线程写 `.agentflow/runs/<run-id>/summary.md`，报告停止原因、证据路径和建议下一步。

## 自动执行

`$auto` 只执行当前 run 的下一个缺失工作流节点。每个节点结束后，主线程读取 state、summary、最新 report 和 review ledger。遇到打回时，先按“打回与路由”处理；只有无法安全路由时才停止自动推进。

## Milestone 边界

一个 run 表示一个 milestone 的执行单元。`$finish` 完成归档和 state 清理后，主线程必须提交当前 milestone 产生的代码、测试和文档变化，然后才能开始新的 milestone。

提交信息应简洁描述本次完成的用户可见变更，例如 `feat: add import workflow`、`fix: handle empty config`、`docs: update setup guide`。若没有文件变化，不创建空提交，并在 `.agentflow/runs/<run-id>/summary.md` 记录 no-op。

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
