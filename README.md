# codex-spec

`codex-spec` scaffolds a project-local Codex subagent workflow.

It creates:

```text
AGENTS.md
.codex/
.agents/
agentflow/
.agentflow/
```

The workflow uses file artifacts instead of chat history as the source of truth. The main thread orchestrates and integrates; subagents receive narrow dispatch packets and write role-owned run artifacts.

## Install for Local Development

```bash
bun run build
npm link
codex-spec --help
codex-spec --version
```

## Initialize a Project

English templates:

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

## Workflow

```text
$plan
$design
$doc-review
$execute
$code-review
$finish
```

Automation and support skills:

```text
$auto
$status
$health
$pause
$resume
```

Main thread responsibilities:

- create run directories and dispatch packets;
- choose the role for each task;
- read concise reports and review ledgers;
- write fix requests when a gate fails;
- update `.agentflow/state.json`;
- archive completed runs.

Subagent responsibilities:

- read only dispatch-listed inputs, shared protocol files, project rules, and their own role prompt;
- write only dispatch-allowed output paths;
- avoid chat history as a source of truth;
- report decisions with repo-relative paths.

## Roles

```text
PM
Architect
Tester
Doc Reviewer
Developer
Code Reviewer
Auditor
```

Tester writes test plans and coverage reviews, not code. Doc Reviewer checks document consistency before implementation. Code Reviewer checks implementation after execution. Auditor runs during `$finish` to summarize the run and report workflow or prompt improvement notes; Auditor is not a quality gate.

## Important Paths

Long-lived files:

```text
agentflow/vision.md
agentflow/roadmap.md
agentflow/adr/*.md
agentflow/spec/*.md
agentflow/spec/test-plan/*.md
```

Current run files:

```text
.agentflow/runs/<run-id>/task.md
.agentflow/runs/<run-id>/gate.md
.agentflow/runs/<run-id>/dispatch/
.agentflow/runs/<run-id>/pm/
.agentflow/runs/<run-id>/architect/
.agentflow/runs/<run-id>/tester/
.agentflow/runs/<run-id>/doc-reviewer/
.agentflow/runs/<run-id>/developer/
.agentflow/runs/<run-id>/code-reviewer/
.agentflow/runs/<run-id>/auditor/
.agentflow/runs/<run-id>/fix-requests/
.agentflow/runs/<run-id>/fix-responses/
```

Archive files:

```text
.agentflow/backups/
.agentflow/archives/<run-id>/
```

Archives are immutable history and are not a context source for later runs. Reusable facts must be synced into `agentflow/` or written into the current run.

## CLI Commands

```bash
codex-spec help
codex-spec init --lang en|zh
codex-spec health
codex-spec status
codex-spec rebind-hooks
codex-spec state set --phase <phase> --run <run-id>
codex-spec state set --phase idle --run null --milestone null --blocked false
codex-spec backup --label <label>
codex-spec archive --run <run-id>
```

`--run null` and `--milestone null` clear the current run or milestone pointer.

## Build

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

## Publish

Update the package scope first:

```json
{
  "name": "@your-npm-name/codex-spec"
}
```

Then:

```bash
bun run test
npm pack --dry-run
npm publish --access public
```
