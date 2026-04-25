# Spec 指南

Architect 负责维护 `agentflow/spec/` 下的稳定规格。

Spec 用于记录已经接受的设计、接口、数据契约和行为。草案保留在 `.agentflow/runs/<run-id>/architect/`，直到 `$finish` 阶段同步已接受内容。

建议章节：

| 章节 | 内容 |
|---|---|
| 负责人 | Architect |
| 范围 | 包含的行为 |
| 非目标 | 不包含的行为 |
| 接口 | 对外 API、文件、CLI、事件 |
| 数据契约 | 输入、输出、schema、持久化 |
| 行为 | 必须满足的行为 |
| 错误处理 | 失败和异常行为 |
| 相关 ADR | `agentflow/adr/*.md` |
| 测试计划 | `agentflow/spec/test-plan/*.md` |
