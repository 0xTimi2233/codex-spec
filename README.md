# codex-spec

`codex-spec` is a Node/Bun project that scaffolds a project-local Codex workflow. It creates Codex subagent configs, repo-scoped skills, hook configuration, ADR/spec/roadmap documents, and a small machine-readable workflow state.

The workflow is built around a main-thread orchestrator model:

- the main thread coordinates, gates, and integrates;
- subagents work with clean context and write role-owned run artifacts;
- long-lived knowledge lives under `agentflow/`;
- transient workflow state lives under `.agentflow/`;
- hooks call installed `dist/hooks/*.js` scripts by absolute path.

## Install for local development

```bash
bun run build
npm link
codex-spec --help
codex-spec --version
```

## Initialize a project

English is the default:

```bash
codex-spec init
```

Chinese templates:

```bash
codex-spec init --lang zh
```

Initialize another directory:

```bash
codex-spec init --lang zh --target /path/to/project
```

`--target` is optional. Without it, `codex-spec` uses the current working directory.

Generated project files:

```text
AGENTS.md
.codex/
.agents/
agentflow/
.agentflow/
```

## Build

This repository does not include `dist/`. Build it locally with Bun:

```bash
bun run build
```

The build creates:

```text
dist/cli.js
dist/hooks/user-prompt-submit.js
dist/hooks/pre-tool-use.js
dist/hooks/post-tool-use.js
dist/hooks/stop.js
```

## Commands

```bash
codex-spec help
codex-spec help init
codex-spec init --lang en|zh
codex-spec health
codex-spec status
codex-spec rebind-hooks
codex-spec state set --phase <phase> --run <run-id>
codex-spec state set --phase idle --run null --milestone null --blocked false
codex-spec backup --label <label>
```

`--run null` and `--milestone null` clear the current run or milestone pointer.

## Workflow phases

```text
idle -> planning -> ready-to-execute -> executing -> ready-to-review -> reviewing -> ready-to-finish -> finishing -> idle
```

`blocked` and `paused` are holding states until the main thread resolves the blocker or resumes.

## Artifact contract

Important run artifacts use fixed repo-relative paths:

```text
.agentflow/runs/<run-id>/task.md
.agentflow/runs/<run-id>/gate.md
.agentflow/runs/<run-id>/developer/implementation-report.md
.agentflow/runs/<run-id>/developer/changed-files.md
.agentflow/runs/<run-id>/reviewer/review-report.md
.agentflow/runs/<run-id>/tester/test-report.md
.agentflow/runs/<run-id>/summary.md
```

Long-lived documents:

```text
agentflow/vision.md
agentflow/roadmap.md
agentflow/adr/*.md
agentflow/spec/<domain>.md
agentflow/spec/test-plan/<domain>.md
```

## Publish

Update the package scope first:

```json
{
  "name": "@your-npm-name/codex-spec"
}
```

Then:

```bash
bun run build
npm pack --dry-run
npm publish --access public
```
