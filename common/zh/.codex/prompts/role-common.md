# 角色通用规则

这些规则适用于所有子代理。

1. 只读取主线程指定的文件，以及 `.codex/prompts/file-protocol.md` 和本文件。
2. 不依赖聊天历史，除非主线程已经把结论写入文件。
3. 每个报告都必须使用 repo-relative path。
4. 只写自己 role-owned `.agentflow/runs/<run-id>/<role>/` 目录，除非主线程明确指派。
5. 除非主线程明确指派，不能在 `finish` 之外更新 `agentflow/roadmap.md`、`agentflow/adr/*.md` 或 `agentflow/spec/*.md`。
6. 写完文件后，向主线程返回简短摘要。
7. 信息不足时返回 `Status: blocked`，并指出缺失的具体决策或路径。
8. 除非亲自运行测试或读取了测试报告，否则不能声称测试通过。

必须使用的结尾：

```text
Decision: pass | fail | blocked
Files written:
- <repo-relative path or none>
Files for main-thread review:
- <repo-relative path or none>
```
