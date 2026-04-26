---
name: brainstorm
description: 在 plan 前探索需求，并写出供 PM 规划使用的简短 brief。
---

# Skill: brainstorm

## 先读

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.agentflow/state.json`
- 用户提供的输入文件

## 操作

1. 选择或复用 brainstorm id。
2. 讨论 goal、scope、non-goals、constraints、risks、用户偏好和候选 milestones。
3. 只读取用户提供的文件。需要更多上下文时，请用户给出具体路径或决策。
4. 写 `.agentflow/brainstorm/<brainstorm-id>/brief.md`。
5. 用户确认可进入 planning 前，保持 `Status: draft`。
6. 用户确认后，将 brief 更新为 `Status: ready-for-plan`，并建议在干净聊天上下文中开始 `$plan`。

## Brief 格式

```text
Status: draft | ready-for-plan | discarded
Goal:
Confirmed requirements:
Non-goals:
Open questions:
User preferences:
Constraints:
Candidate milestones:
Risks:
Recommended next step:
```

## 不执行

- 不创建 run。
- 不更新 workflow state。
- 不写 roadmap、ADR、spec、test plan 或源码。
- 不调度 PM。

## 最终回复

返回 brief 路径、当前状态、未解决问题和建议的下一个 skill。
