---
name: plan
description: 定义需求、范围、roadmap milestone，并创建当前 run。
---

# Skill: plan

## 先读

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

## 操作

1. 选择或创建 run id。
2. 写 `.agentflow/runs/<run-id>/dispatch-ledger.md`，包含调度表格表头。
3. 写 `.agentflow/runs/<run-id>/task.md`，包含 goal、scope、non-goals、constraints、done criteria。
4. 写 `.agentflow/runs/<run-id>/dispatch/pm-001.md`。
5. 在 `dispatch-ledger.md` 追加 PM 记录，调度 PM，写入 runtime agent id，并在收到 PM 回复后更新该行。
6. 写或更新 `.agentflow/runs/<run-id>/summary.md`。
7. 执行 `codex-spec state set --phase planning --run <run-id> --blocked false`。

## PM 决策处理

若 PM 返回 `User decision required`，将编号选项呈现给用户；把用户选择写入 `task.md` 的 `User decisions`，再带着该决策重新调度 PM。

## 必须产出

- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/dispatch/pm-001.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`

## 下一步

返回 run id、创建文件、下一步 `$design`，或 blocker。
