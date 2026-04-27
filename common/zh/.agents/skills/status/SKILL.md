---
name: status
description: 查看当前 workflow state、planning session、run 和下一步建议。
---

# Skill: status

## 上下文输入

当这些路径不在当前上下文中，或文件内容可能已变化时读取：

- `.codex/prompts/main-thread.md`

## 操作

执行内部命令 `codex-spec-internal status` 获取 raw state，再按需检查相关 ledger 或 summary。

返回 phase、planning track、planning session、run id、blocked flag、未结束调度和建议的下一个 skill。
