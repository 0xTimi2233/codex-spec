---
name: plan
description: 确认需求、更新 roadmap，并准备下一 milestone run。
---

# Skill: plan

## 上下文输入

当这些路径不在当前上下文中，或文件内容可能已变化时读取：

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json.current_brainstorm` 存在时对应的 `.agentflow/brainstorm/<current_brainstorm>/brief.md`
- brainstorm 归档后的 `.agentflow/archives/brainstorm/<brainstorm-id>/brief.md`
- 主线程指定的 brainstorm `brief.md` 路径
- `.agentflow/state.json`

## 操作

1. 若 `.agentflow/state.json.current_brainstorm` 存在，使用 `.agentflow/brainstorm/<current_brainstorm>/brief.md` 将 brainstorm 结束为 `ready-for-plan` 或 `discarded`，归档后清空 `current_brainstorm`。
2. 当 brainstorm brief 变为 `ready-for-plan` 后，建议用户清空聊天上下文。
3. 使用主线程指定的 `.agentflow/archives/brainstorm/<brainstorm-id>/brief.md` 或用户提供的需求输入作为 PM planning 输入。
4. 调度 PM 确认需求、scope、non-goals、roadmap milestones 和验收标准。
5. dispatch 明确要求时，PM 可以更新 `agentflow/vision.md` 和 `agentflow/roadmap.md`。
6. 选择下一 milestone，选择或创建 run id，并写 `.agentflow/runs/<run-id>/task.md`。
7. 写 `.agentflow/runs/<run-id>/dispatch-ledger.md`，包含调度表格表头。
8. 写 `.agentflow/runs/<run-id>/dispatch/pm-001.md`。
9. 在 `dispatch-ledger.md` 追加 PM 记录，调度 PM，写入 runtime agent id，并在收到 PM 回复后更新该行。
10. 写或更新 `.agentflow/runs/<run-id>/summary.md`。
11. 执行 `codex-spec state set --phase planning --run <run-id> --blocked false`。

## PM 决策处理

若 PM 返回 `User decision required`，将编号选项呈现给用户；把用户选择写入 `task.md` 的 `User decisions`，再带着该决策重新调度 PM。

## 必须产出

- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/dispatch/pm-001.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`
- PM dispatch 要求时，更新 `agentflow/vision.md` 或 `agentflow/roadmap.md`

## 下一步

返回 run id、创建文件、下一步 `$design`，或 blocker。
