---
name: brainstorm
description: 在 plan 前探索需求，并写出供 PM 规划使用的简短 brief。
---

# Skill: brainstorm

## 上下文输入

当这些路径不在当前上下文中，或文件内容可能已变化时读取：

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- 用户提供的输入文件

## 操作

1. 选择 brainstorm id，并执行 `codex-spec state set --brainstorm <brainstorm-id> --blocked false`。
2. 讨论 goal、scope、non-goals、constraints、risks、用户偏好和候选 milestones。
3. 只读取用户提供的文件。需要更多上下文时，请用户给出具体路径或决策。
4. 写 `.agentflow/brainstorm/<brainstorm-id>/brief.md`。
5. 当内容具备审计价值时，更新 `.agentflow/brainstorm/<brainstorm-id>/notes.md`、`questions.md` 和 `source-map.md`。
6. 用户确认可进入 planning 前，`brief.md` 保持 `Status: draft`。
7. 用户确认后，将 `brief.md` 更新为 `Status: ready-for-plan` 或 `Status: discarded`，写 `summary.md`，执行 `codex-spec archive --brainstorm <brainstorm-id>`，再执行 `codex-spec state set --brainstorm null`。
8. 建议在干净聊天上下文中开始 `$plan`。

## Brief 格式

```text
Status: draft | ready-for-plan | discarded
Goal:
Confirmed requirements:
Non-goals:
User decisions:
Open questions:
User preferences:
Constraints:
Candidate milestones:
Risks:
Recommended planning focus:
```

## 范围

- 维护 `.agentflow/brainstorm/<brainstorm-id>/` 和 `.agentflow/state.json.current_brainstorm`。
- roadmap、run、ADR、spec、test plan 和源码工作由后续 workflow skill 处理。

## 最终回复

返回 brief 路径、当前状态、未解决问题和建议的下一个 skill。
