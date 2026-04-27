# Spec 指南

Architect 负责维护 `codexspec/spec/` 下的稳定规格。

Spec 用于记录已经接受的设计、接口、数据契约和行为。`$design` 阶段 Architect 直接更新 dispatch 列出的 spec；`codexspec/runtime/runs/<run-id>/architect/` 只保存报告和证据。

建议章节：

| 字段 | 内容 |
|---|---|
| Owner | Architect |
| Scope | 包含的行为 |
| Non-goals | 不包含的行为 |
| Interfaces | 对外 API、文件、CLI、事件 |
| Data contracts | 输入、输出、schema、持久化 |
| Behavior | 必须满足的行为 |
| Error handling | 失败和异常行为 |
| Related ADRs | `codexspec/adr/*.md` |
| Test plan | `codexspec/spec/test-plan/*.md` |
