---
name: auto
description: 受控执行当前 run 的标准工作流，遇到打回或风险时停止。
---

# Skill: auto

## 先读

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

## 操作

按当前 phase 执行下一个缺失阶段：

```text
$plan -> $design -> $doc-review -> $execute -> $code-review -> $finish
```

每个阶段结束后读取 `.agentflow/state.json`、当前 run summary、最新 report 和 review ledger。

## 必须停止

出现以下任意情况时停止，不继续推进下一阶段：

- PM 返回 `fail`、`blocked`、`needs-context` 或 `done-with-concerns`
- Architect 返回 `fail`、`blocked`、`needs-context` 或 `done-with-concerns`
- Tester 返回 `fail`、`blocked`、`needs-context` 或 `done-with-concerns`
- Doc Reviewer 或 Code Reviewer 返回非 `pass`
- 出现 `.agentflow/runs/<run-id>/fix-requests/*.md`
- `.agentflow/state.json.blocked = true`
- 当前阶段必需产物缺失
- 需要用户、外部系统或破坏性操作决策

停止时，主线程写 `.agentflow/runs/<run-id>/summary.md`，报告状态、原因、最新证据路径和建议下一步。

## 最终回复

返回已完成阶段、停止原因、当前 state、相关 report/fix-request 路径，以及建议用户执行的下一个 skill。
