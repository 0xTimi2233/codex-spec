---
name: resume
description: 从 state、planning session 和 dispatch ledger 恢复 workflow。
---

# Skill: resume

## 上下文输入

当这些路径不在当前上下文中，或文件内容可能已变化时读取：

- `codexspec/runtime/state.json`
- `.codex/prompts/file-index.md`
- `planning_track` 为 `explore` 时对应的 `codexspec/runtime/explore/<current_planning_session>/dispatch-ledger.md`
- `planning_track` 为 `explore` 时对应的 `codexspec/runtime/explore/<current_planning_session>/brief.md`
- 存在 active explore round 时对应的 `codexspec/runtime/explore/<current_planning_session>/rounds/<round-id>/round.md`
- `planning_track` 为 `preflight` 时对应的 `codexspec/runtime/preflight/<current_planning_session>/dispatch-ledger.md`
- `planning_track` 为 `preflight` 时对应的 `codexspec/runtime/preflight/<current_planning_session>/brief.md`
- `planning_track` 为 `preflight` 时对应的 `codexspec/runtime/preflight/<current_planning_session>/decisions/queue.md`
- `codexspec/runtime/runs/<run-id>/dispatch-ledger.md`
- 存在时的 `codexspec/runtime/runs/<run-id>/summary.md`

## 操作

1. 若 `planning_track` 为 `explore`，用 explore dispatch ledger 定位非结束 PM 调度；没有非结束行时读取最新 round 和 brief，然后继续或结束 `$plan` 的 explore track。
2. 若 `planning_track` 为 `preflight`，用 preflight dispatch ledger 定位非结束 PM 调度；没有非结束行时读取 decision queue 和 brief，然后继续或结束 `$plan` 的 preflight track。
3. 若 `current_run` 存在，读取当前 run 的 dispatch ledger。
4. 对非结束状态的行，优先继续记录中的 agent id。
5. 无法继续该子代理时，将该行标记为 `stale`，再基于当前文件产物创建新的有界 dispatch。

## 最终回复

返回恢复的 planning session 或 run 状态、缺失产物、stale dispatch 和建议的下一个 skill。
