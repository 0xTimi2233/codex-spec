{{MODEL_PROFILE_CONFIG}}
sandbox_mode = "workspace-write"
approval_policy = "on-request"

[agents]
max_threads = 8
max_depth = 1

[agents.pm]
description = "定义需求、范围、非目标、roadmap milestone 和退出条件。"
config_file = ".codex/agents/pm.toml"
nickname_candidates = ["PM", "Product", "Requirements"]

[agents.architect]
description = "更新架构决策、spec、设计报告和技术边界。"
config_file = ".codex/agents/architect.toml"
nickname_candidates = ["Architect", "Designer", "ADR"]

[agents.tester]
description = "根据设计写测试计划，并检查测试结果是否覆盖测试计划。"
config_file = ".codex/agents/tester.toml"
nickname_candidates = ["Tester", "QA", "Coverage"]

[agents.developer]
description = "按 dispatch 列出的 authoritative docs 和文件范围实现代码和测试代码。"
config_file = ".codex/agents/developer.toml"
nickname_candidates = ["Developer", "Builder", "Implementer"]

[agents.doc-reviewer]
description = "审查需求、ADR、spec 和 test plans 的一致性。"
config_file = ".codex/agents/doc-reviewer.toml"
nickname_candidates = ["Doc Reviewer", "Verifier", "Checker"]

[agents.code-reviewer]
description = "审查代码是否符合 dispatch、authoritative docs、test plans、代码规范和 changed-files。"
config_file = ".codex/agents/code-reviewer.toml"
nickname_candidates = ["Code Reviewer", "Reviewer", "Inspector"]

[agents.auditor]
description = "在 milestone finish 阶段总结当前 run、检查归档材料完整性、提出流程或 prompt 改进建议。"
config_file = ".codex/agents/auditor.toml"
nickname_candidates = ["Auditor", "Archivist", "Reporter"]
