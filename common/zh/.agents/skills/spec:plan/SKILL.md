---
name: spec:plan
description: 探索、审计或确认需求，并准备下一 milestone run。
---

# Skill: spec:plan

## 上下文输入

当这些路径不在当前上下文中，或文件内容可能已变化时读取：

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `codexspec/vision.md`
- `codexspec/roadmap.md`
- 继续 explore track 时的 `codexspec/runtime/explore/<explore-id>/brief.md`
- 继续 preflight track 时的 `codexspec/runtime/preflight/<preflight-id>/brief.md`
- 用户指定的需求来源路径
- `codexspec/runtime/state.json`
- active planning session 存在时，读取 `codexspec/runtime/state.json` 中的 `current_planning_session` 和 `planning_track` 字段

## 操作

1. 按需补充协议、role prompts、project rules、roadmap 和 state 上下文。
2. 若存在 active run，停止并根据当前 phase 建议 `$spec:resume`、`$spec:status`、`$spec:design` 或 `$spec:execute`。
3. 根据用户意图和可用输入选择 track：
   - `explore`：在正式 planning 前澄清模糊或早期需求。
   - `preflight`：审计已有需求来源中的 planning 阻塞点。
   - `commit`：确认需求、创建 run 并调度 PM。
4. track 不明确时，向用户给出带影响和推荐项的编号选项。
5. `explore`：创建或继续 `codexspec/runtime/explore/<explore-id>/`，执行 `codex-spec-internal state set --planning-session <explore-id> --planning-track explore --blocked false`，缺失时写 `codexspec/runtime/explore/<explore-id>/dispatch-ledger.md`，写 `codexspec/runtime/explore/<explore-id>/dispatch/pm-<n>.md` 处理下一轮问题或 closure，追加 PM 调度行，调度 PM，并在 PM 回复后更新该行。
6. `preflight`：创建或继续 `codexspec/runtime/preflight/<preflight-id>/`，执行 `codex-spec-internal state set --planning-session <preflight-id> --planning-track preflight --blocked false`，缺失时写 `codexspec/runtime/preflight/<preflight-id>/dispatch-ledger.md`，写 `codexspec/runtime/preflight/<preflight-id>/dispatch/pm-<n>.md` 处理需求审计或 closure，追加 PM 调度行，调度 PM，并在 PM 回复后更新该行。
7. explore 或 preflight track 以 `ready-for-plan` 或 `discarded` 结束时，执行 `codex-spec-internal archive --explore <explore-id>` 或 `codex-spec-internal archive --preflight <preflight-id>`，再用 `codex-spec-internal state set --planning-session null --planning-track null` 清理 planning state。
8. `commit`：为当前 run 选择 roadmap milestone id，创建 run id，写 `codexspec/runtime/runs/<run-id>/dispatch-ledger.md`，包含调度表格表头。
9. 执行 `codex-spec-internal state set --phase planning --run <run-id> --milestone <milestone-id> --planning-session null --planning-track null --blocked false`。
10. 写 `codexspec/runtime/runs/<run-id>/dispatch/pm-001.md`，包含 planning 输入和自包含 PM 输出路径。
11. 在 `dispatch-ledger.md` 追加 PM 记录，调度 PM，写入 runtime agent id，并在收到 PM 回复后更新该行。
12. PM 确认 requirements、scope、non-goals、roadmap milestones、acceptance criteria 和 `pm/planning-summary.md`。
13. dispatch 明确要求时，PM 可以更新 `codexspec/vision.md` 和 `codexspec/roadmap.md`。
14. 返回 `$spec:design` 作为下一步前，确认 planning package 已自包含。

## Planning Package

`commit` track 必须把所有相关需求、决策、约束、假设、未关闭风险和验收标准写入当前 run。这是当前 milestone 的 run-scoped planning 记录：

- `codexspec/runtime/runs/<run-id>/task.md`
- `codexspec/runtime/runs/<run-id>/pm/requirements.md`
- `codexspec/runtime/runs/<run-id>/pm/scope.md`
- `codexspec/runtime/runs/<run-id>/pm/acceptance-criteria.md`
- `codexspec/runtime/runs/<run-id>/pm/planning-summary.md`

后续 design 以该 package 作为 planning input。可复用产品知识保存在 `codexspec/`。

## PM 决策处理

若 PM 返回主线程无法自行解决的 `Decision Request`，将编号选项呈现给用户；把用户选择写入 `task.md` 的 `User decisions`，再带着该决策重新调度 PM。

## 必须产出

`explore` track：

- `codexspec/runtime/explore/<explore-id>/dispatch-ledger.md`
- `codexspec/runtime/explore/<explore-id>/dispatch/pm-<n>.md`
- `codexspec/runtime/explore/<explore-id>/brief.md`
- session 关闭时的 `codexspec/runtime/explore/<explore-id>/summary.md`

`preflight` track：

- `codexspec/runtime/preflight/<preflight-id>/dispatch-ledger.md`
- `codexspec/runtime/preflight/<preflight-id>/dispatch/pm-<n>.md`
- `codexspec/runtime/preflight/<preflight-id>/brief.md`
- session 关闭时的 `codexspec/runtime/preflight/<preflight-id>/summary.md`

`commit` track：

- `codexspec/runtime/runs/<run-id>/task.md`
- `codexspec/runtime/runs/<run-id>/dispatch-ledger.md`
- `codexspec/runtime/runs/<run-id>/dispatch/pm-001.md`
- `codexspec/runtime/runs/<run-id>/pm/requirements.md`
- `codexspec/runtime/runs/<run-id>/pm/scope.md`
- `codexspec/runtime/runs/<run-id>/pm/acceptance-criteria.md`
- `codexspec/runtime/runs/<run-id>/pm/planning-summary.md`，包含 source coverage、copied requirements、decisions、open risks 和 ready-for-design status
- PM dispatch 要求时，更新 `codexspec/vision.md` 或 `codexspec/roadmap.md`

## 下一步

返回 active track、run id、创建文件、下一步 `$spec:design`，或 blocker。
