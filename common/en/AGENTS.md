# AGENTS.md

This repository uses the project-local `codex-spec` workflow.

Read first:

- `.codex/prompts/main-workflow.md`
- `.codex/prompts/file-protocol.md`
- `.codex/prompts/role-common.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

Rules:

- Use repo-relative paths in all reports.
- Long-lived project knowledge lives in `agentflow/`.
- Temporary run artifacts live in `.agentflow/runs/<run-id>/`.
- Subagents keep clean context and write only their role-owned run artifacts unless explicitly instructed.
- The main thread is the orchestrator, integrator, and gatekeeper.
