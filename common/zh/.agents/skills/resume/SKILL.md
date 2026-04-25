---
name: resume
description: 从 handoff 和 state 恢复 workflow。
---

# Skill: resume

读取 `.agentflow/handoff.md` 和 `.agentflow/state.json`。如果必需产物缺失，先运行 `$doctor`；否则根据 phase 建议下一个 skill。

只从持久化文件恢复。终端退出后，不假设之前的子代理进程仍然可连接；根据当前 run state 继续调度剩余工作。
