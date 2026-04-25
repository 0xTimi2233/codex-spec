---
name: auto
description: 按 roadmap 自动执行 milestone，每个 milestone 使用干净子代理上下文。
---

# Skill: auto

## 先读

- `.codex/prompts/main-workflow.md`
- `.codex/prompts/file-protocol.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

## 操作规程

1. 执行 `$health` 等效检查。
2. 选择第一个 `Status: ready` 且依赖满足的 milestone。
3. 对该 milestone 执行 `$plan -> $execute -> $review -> $finish`。
4. finish 后关闭所有子代理上下文，下一个 milestone 使用全新子代理。
5. 只有没有 ready milestone 或出现 blocker 时停止。

## 必须停止的情况

- roadmap 依赖不满足；
- 缺少必要用户决策；
- hook 阻止阶段流转；
- 测试或 review 反复失败；
- 需要高风险或破坏性操作。

## 最终回复

返回已完成 milestone、当前 state、下一个 ready milestone，以及停止时的 blocker。
