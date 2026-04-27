# 测试计划指南

Tester 负责维护 `codexspec/spec/test-plan/` 下的稳定测试计划。

测试计划把已接受的 design/spec 行为映射到验证步骤、fixture、验收矩阵和通过/失败标准。Tester 写测试计划和覆盖审查，不写代码。

建议章节：

| 字段 | 内容 |
|---|---|
| Owner | Tester |
| Related spec | `codexspec/spec/*.md` |
| Acceptance matrix | 需求到验证项的映射 |
| Automated checks | 命令和预期结果 |
| Manual checks | 需要时的手工验证 |
| Fixtures | 所需数据或环境准备 |
| Regression scope | 需要保护的既有行为 |
