---
name: execute
description: 调度 Developer 根据通过 gate 的 dispatch 实现代码和测试代码。
---

# Skill: execute

## 先读

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/gate.md`
- `.agentflow/runs/<run-id>/tester/test-plan.md`

## 操作

1. 确认 `.agentflow/runs/<run-id>/gate.md` 存在。
2. 执行 `codex-spec state set --phase executing --run <run-id>`.
3. 写 `.agentflow/runs/<run-id>/dispatch/developer-001.md`，列出允许读取和写入的文件范围。
4. 调度 Developer。
5. Developer 写 implementation report、changed files、test result。

## 必须产出

- `.agentflow/runs/<run-id>/developer/implementation-report.md`
- `.agentflow/runs/<run-id>/developer/changed-files.md`
- `.agentflow/runs/<run-id>/developer/test-result.md`

## 下一步

返回变更文件、命令、测试状态、下一步 `$code-review`，或 blocker。
