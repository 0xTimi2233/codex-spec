---
name: spec:execute
description: 基于已审查的权威文档完成当前 milestone 的实现、审查、验证、归档和提交。
---

# Skill: spec:execute

## 上下文输入

当这些路径不在当前上下文中，或文件内容可能已变化时读取：

- `.codex/prompts/main-thread.md`
- `.codex/prompts/glossary.md`
- `.codex/prompts/file-index.md`
- `codexspec/runtime/state.json`
- `codexspec/runtime/runs/<run-id>/dispatch-ledger.md`
- `codexspec/runtime/runs/<run-id>/doc-reviewer/review-report.md`

## 操作

1. 确认当前 run 为 `ready-to-execute`，且最新 Doc Reviewer 报告为 `Status: pass`。
2. 执行 `codex-spec-internal state set --phase executing --run <run-id>`。
3. 写 `codexspec/runtime/runs/<run-id>/dispatch/developer-001.md`，列出 authoritative `codexspec/` 文档路径、允许写入的源码/测试范围、required tests 和 Developer 输出路径。
4. 从 Architect、Tester 和 Doc Reviewer 报告复制 Developer dispatch scope。不要通过理解 ADR 或 spec 内容自行推导 scope。追加 Developer 调度行，调度 Developer，写入 runtime agent id，并在收到 Developer 回复后更新该行。
5. Developer 写 implementation report、changed files、test result。
6. 执行 `codex-spec-internal state set --phase code-reviewing --run <run-id>`。
7. 调度 Code Reviewer，输入包括 Developer dispatch、authoritative `codexspec/` 文档路径、Developer 产物、相关源码/测试路径、代码规范和 review ledger。
8. 当测试结果需要对照 test plan 做覆盖审查时，调度 Tester。
9. review 失败时，写 `codexspec/runtime/runs/<run-id>/fix-requests/code-fix-<n>.md`，并路由给 Developer、Architect、Tester 或 PM。
10. review 通过时，执行 `codex-spec-internal state set --phase ready-to-finish --run <run-id> --blocked false`。
11. 将验收证据写入 `codexspec/runtime/runs/<run-id>/verification.md`。
12. 执行 `codex-spec-internal state set --phase finishing --run <run-id>`。
13. 调度 Auditor 总结当前 run。
14. 确认需要的长期文档变更已在 `$spec:plan` 或 `$spec:design` 完成。finish 阶段不新增 ADR、spec 或 test-plan 变更。
15. 判断当前 milestone 是否有需要提交的用户可见代码、测试或长期文档变更。
16. 写 `codexspec/runtime/runs/<run-id>/summary.md`，包含结果、证据、归档计划，以及 commit 或 no-op 计划。
17. 关闭 `dispatch-ledger.md` 中仍打开的 runtime agent id，在 ledger 记录最终状态，并确认没有 `queued`、`running` 或 `blocked` 行。
18. 执行 `codex-spec-internal archive --run <run-id>`。
19. 用简洁的用户可见 commit message 提交完成的 milestone 变更。若没有值得提交的 diff，不创建空提交；`summary.md` 中已经记录的 no-op 计划即为记录。
20. commit 或 no-op 成功后，执行 `codex-spec-internal state set --phase idle --run null --milestone null --blocked false`。

## 必须产出

- `codexspec/runtime/runs/<run-id>/developer/implementation-report.md`
- `codexspec/runtime/runs/<run-id>/developer/changed-files.md`
- `codexspec/runtime/runs/<run-id>/developer/test-result.md`
- `codexspec/runtime/runs/<run-id>/code-reviewer/review-report.md`
- `codexspec/runtime/runs/<run-id>/code-reviewer/review-ledger.md`
- `codexspec/runtime/runs/<run-id>/verification.md`
- `codexspec/runtime/runs/<run-id>/auditor/audit-report.md`
- `codexspec/runtime/runs/<run-id>/summary.md`
- 更新后的 `codexspec/runtime/runs/<run-id>/dispatch-ledger.md`
- `codexspec/runtime/archives/runs/<run-id>/`
- milestone git commit，或 summary 中的 no-op 记录

## 下一步

返回 milestone 结果、归档路径、提交状态、建议的下一 milestone 动作，或 blocker。
