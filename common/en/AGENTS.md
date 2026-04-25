# AGENTS.md

This repository uses the project-local `codex-spec` workflow.

Main thread reads first:

- `.codex/prompts/main-thread.md`
- `.codex/prompts/file-protocol.md`
- `.codex/prompts/subagent-contract.md`
- `agentflow/vision.md`
- `agentflow/roadmap.md`
- `.agentflow/state.json`

Rules:

- The main thread handles orchestration, dispatch, integration, state advancement, and run archiving.
- Subagents must not read `.codex/prompts/main-thread.md`.
- Subagents read only `.codex/prompts/subagent-contract.md`, `.codex/prompts/file-protocol.md`, their own role prompt, and dispatch-listed inputs/project rules.
- Use repo-relative paths in all reports.
- Long-lived facts live in `agentflow/`; current run artifacts live in `.agentflow/runs/<run-id>/`.
- `.agentflow/archives/` is immutable history and is not a context source for later runs.
