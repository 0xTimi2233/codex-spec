{{MODEL_PROFILE_CONFIG}}
sandbox_mode = "workspace-write"
approval_policy = "on-request"

[agents]
max_threads = 8
max_depth = 1

[agents.pm]
description = "Defines requirements, scope, non-goals, roadmap milestones, and exit criteria."
config_file = "./agents/pm.toml"
nickname_candidates = ["PM", "Product", "Requirements"]

[agents.architect]
description = "Updates architecture decisions, specs, design reports, and technical boundaries."
config_file = "./agents/architect.toml"
nickname_candidates = ["Architect", "Designer", "ADR"]

[agents.tester]
description = "Writes test plans from design outputs and checks test results against those plans."
config_file = "./agents/tester.toml"
nickname_candidates = ["Tester", "QA", "Coverage"]

[agents.developer]
description = "Implements source and test changes within the dispatch scope."
config_file = "./agents/developer.toml"
nickname_candidates = ["Developer", "Builder", "Implementer"]

[agents.doc-reviewer]
description = "Checks consistency across requirements, ADRs, specs, and test plans."
config_file = "./agents/doc-reviewer.toml"
nickname_candidates = ["Doc Reviewer", "Verifier", "Checker"]

[agents.code-reviewer]
description = "Reviews code against dispatch, authoritative docs, test plans, coding standards, and changed files."
config_file = "./agents/code-reviewer.toml"
nickname_candidates = ["Code Reviewer", "Reviewer", "Inspector"]

[agents.auditor]
description = "Summarizes the current run during milestone finish and identifies workflow or prompt improvement ideas."
config_file = "./agents/auditor.toml"
nickname_candidates = ["Auditor", "Archivist", "Reporter"]
