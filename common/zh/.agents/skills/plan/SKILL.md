---
name: plan
description: 创建 run，收集角色输入，并产出通过 gate 的 approved plan。
---

# Skill: plan

## 先读

- `.codex/prompts/main-workflow.md`
- `.codex/prompts/file-protocol.md`
- `.codex/prompts/role-common.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

## 操作规程

1. 主线程创建 `.agentflow/runs/<run-id>/`。
2. 主线程写 `.agentflow/runs/<run-id>/task.md`，包含目标、范围、非目标、约束和完成条件。
3. 主线程执行 `codex-spec state set --phase planning --run <run-id>`。
4. 按需 spawn：PM 处理范围/roadmap；Architect 处理架构/spec/ADR；Tester 处理验证计划；Researcher 只处理外部事实。
5. 每个 agent 只写自己的 role-owned run 目录。
6. 主线程整合结果，写 `.agentflow/runs/<run-id>/gate.md`。
7. 如果可执行，设置 `ready-to-execute`；如果阻塞，写 `.agentflow/runs/<run-id>/summary.md` 并设置 `blocked`。

## 必须产出

- `.agentflow/runs/<run-id>/task.md`
- `.agentflow/runs/<run-id>/gate.md`
- 可选：`.agentflow/runs/<run-id>/<role>/` 下的角色报告

## Blocked 条件

- 缺少完成条件；
- 缺少必要用户决策；
- 架构边界不清楚；
- 无法安全制定测试计划。

## 最终回复

返回 run id、当前 phase、已创建文件，以及下一个命令 `$execute` 或 blocker。
