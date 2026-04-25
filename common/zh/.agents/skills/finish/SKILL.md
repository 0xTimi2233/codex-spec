---
name: finish
description: 关闭已通过评审的 run，并通过 owner 同步长期文档。
---

# Skill: finish

## 先读

- `.codex/prompts/main-workflow.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- `.agentflow/runs/<run-id>/reviewer/review-report.md`
- `.agentflow/runs/<run-id>/tester/test-report.md`

## 操作规程

1. 确认 review 通过，且 phase 为 `ready-to-finish`。
2. 执行 `codex-spec state set --phase finishing --run <run-id>`。
3. 按需让 owner 同步长期文件：
   - PM 更新 `agentflow/roadmap.md` 或 `agentflow/vision.md`。
   - Architect 同步 ADR/spec 更新。
   - Tester 同步 `agentflow/spec/test-plan/<domain>.md`。
4. 主线程写 `.agentflow/runs/<run-id>/summary.md`。
5. 执行 `codex-spec backup --label <run-id>-post`。
6. 设置 phase 为 `idle`，清空 current run，并关闭所有子代理上下文。

## 最终回复

返回最终状态、同步文件、backup label，以及 idle 确认。
