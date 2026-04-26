---
name: verify
description: finish 前根据通过的 gate、测试计划、实现报告和 review 结果收集验收证据。
---

# Skill: verify

## 先读

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/gate.md`
- `.agentflow/runs/<run-id>/tester/test-plan.md`
- `.agentflow/runs/<run-id>/developer/test-result.md`
- `.agentflow/runs/<run-id>/code-reviewer/review-report.md`

## 操作

1. 确认 code review 已通过，或指出阻塞的 review 报告。
2. 将 `gate.md` 中必须测试和验收项，与测试计划、Developer 测试结果交叉核对。
3. 写 `.agentflow/runs/<run-id>/verification.md`，记录证据路径、已观察命令、未覆盖验收项和用户可见检查项。
4. 若缺少必要证据且责任角色明确，写 fix request，并路由回对应工作流节点。
5. 证据充分时，继续 `$finish`。

## 必须产出

- `.agentflow/runs/<run-id>/verification.md`
- 验证阻塞时的 fix request 路径

## 下一步

返回 Decision。通过时下一步 `$finish`；失败或证据缺失时返回 fix request 路径和责任角色。
