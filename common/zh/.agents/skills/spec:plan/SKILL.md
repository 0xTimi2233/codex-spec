---
name: spec:plan
description: 探索、审计或确认需求，并准备下一 milestone run。
---

# Skill: spec:plan

## 上下文输入

当这些路径不在当前上下文中，或文件内容可能已变化时读取：

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- 继续 explore track 时的 `.agentflow/explore/<explore-id>/brief.md`
- 继续 preflight track 时的 `.agentflow/preflight/<preflight-id>/brief.md`
- 用户指定的需求来源路径
- `.agentflow/state.json`
- active planning session 对应的 `.agentflow/state.json.current_planning_session` 和 `.agentflow/state.json.planning_track`

## 操作

1. 根据用户意图和可用输入选择 track：
   - `explore`：在正式 planning 前澄清模糊或早期需求。
   - `preflight`：审计已有需求来源中的 planning 阻塞点。
   - `commit`：确认需求、创建 run 并调度 PM。
2. track 不明确时，向用户给出带影响和推荐项的编号选项。
3. `explore`：创建或继续 `.agentflow/explore/<explore-id>/`，执行 `codex-spec state set --planning-session <explore-id> --planning-track explore --blocked false`，在 `rounds/round-<nnn>/round.md` 追加一轮，并更新 `brief.md`。
4. `preflight`：创建或继续 `.agentflow/preflight/<preflight-id>/`，执行 `codex-spec state set --planning-session <preflight-id> --planning-track preflight --blocked false`，更新需求审计文件，并更新 `brief.md`。
5. explore 或 preflight track 以 `ready-for-plan` 或 `discarded` 结束时，执行 `codex-spec archive --explore <explore-id>` 或 `codex-spec archive --preflight <preflight-id>`，再用 `codex-spec state set --planning-session null --planning-track null` 清理 planning state。
6. `commit`：创建 run id，写 `.agentflow/runs/<run-id>/dispatch-ledger.md`，包含调度表格表头。
7. 执行 `codex-spec state set --phase planning --run <run-id> --planning-session null --planning-track null --blocked false`。
8. 写 `.agentflow/runs/<run-id>/dispatch/pm-001.md`，包含 planning 输入和自包含 PM 输出路径。
9. 在 `dispatch-ledger.md` 追加 PM 记录，调度 PM，写入 runtime agent id，并在收到 PM 回复后更新该行。
10. PM 确认 requirements、scope、non-goals、roadmap milestones 和 acceptance criteria。
11. dispatch 明确要求时，PM 可以更新 `agentflow/vision.md` 和 `agentflow/roadmap.md`。
12. 写自包含 planning package。

## Planning Package

`commit` track 必须把所有相关需求、决策、约束、假设、未关闭风险和验收标准写入当前 run：

- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`
- `.agentflow/runs/<run-id>/pm/scope.md`
- `.agentflow/runs/<run-id>/pm/acceptance-criteria.md`
- `.agentflow/runs/<run-id>/pm/planning-summary.md`

后续 design 以该 package 作为 planning 来源。

## PM 决策处理

若 PM 返回 `User decision required`，将编号选项呈现给用户；把用户选择写入 `task.md` 的 `User decisions`，再带着该决策重新调度 PM。

## 必须产出

- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/dispatch-ledger.md`
- `.agentflow/runs/<run-id>/dispatch/pm-001.md`
- `.agentflow/runs/<run-id>/pm/requirements.md`
- `.agentflow/runs/<run-id>/pm/scope.md`
- `.agentflow/runs/<run-id>/pm/acceptance-criteria.md`
- `.agentflow/runs/<run-id>/pm/planning-summary.md`
- PM dispatch 要求时，更新 `agentflow/vision.md` 或 `agentflow/roadmap.md`

## 下一步

返回 active track、run id、创建文件、下一步 `$spec:design`，或 blocker。
