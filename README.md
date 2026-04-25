# codex-spec

[English](README.md) | [中文](README_ZH.md)

`codex-spec` is a project-local workflow scaffold for Codex. It gives Codex a small, file-based operating system for spec-driven work: a main thread coordinates the run, role-specific subagents receive narrow dispatch packets, reviewers guard the gates, and durable artifacts replace chat history as the source of truth.

## Install

```bash
npm install -g @0xtimi2233/codex-spec
codex-spec --version
```

Upgrade:

```bash
npm install -g @0xtimi2233/codex-spec@latest
```

Requirements:

- Node.js 20 or newer
- Codex installed and available in the project where you want to use the workflow

## Quick Start

Initialize English templates in the current directory:

```bash
codex-spec init
```

Check the scaffold:

```bash
codex-spec doctor
codex-spec status
```

Then start Codex in the project and drive the workflow with skills:

```text
$plan
$design
$doc-review
$execute
$code-review
$finish
```

For controlled end-to-end progress, use:

```text
$auto
```

## Detailed Guide

### What It Creates

```text
AGENTS.md
.codex/
.agents/
agentflow/
.agentflow/
```

Long-lived project knowledge lives in `agentflow/`: vision, roadmap, ADRs, specs, and test plans. Current work lives in `.agentflow/runs/<run-id>/`: task files, dispatch ledger, dispatch packets, role reports, review ledgers, fix requests, and summaries. Completed runs are copied to `.agentflow/archives/`.

### Roles

```text
PM
Architect
Tester
Doc Reviewer
Developer
Code Reviewer
Auditor
```

The main thread orchestrates and integrates. PM defines scope. Architect writes design/spec/ADR drafts. Tester writes test plans and coverage reviews, not implementation code. Doc Reviewer checks document consistency before execution. Developer implements code and tests from an approved gate. Code Reviewer checks implementation after execution. Auditor summarizes the run during `$finish`.

### Workflow

```text
$plan        define requirement, scope, milestone, and run task
$design      produce design/spec/ADR drafts and test plan
$doc-review  validate document consistency before implementation
$execute     implement code and tests from the approved gate
$code-review validate implementation against gate, spec, and test plan
$finish      summarize, sync long-lived docs, archive the run, clear state
```

`$auto` follows the same gates. When a rejection has a clear owner and fix scope, the main thread routes it to the responsible subagent. It stops only when safe routing is not possible or an external decision is required.

### Model Profiles

`init` can generate model and reasoning settings:

```bash
codex-spec init --model high --fast on
codex-spec init --model xhigh --fast off
```

| Profile | Generated behavior |
| --- | --- |
| `high` | Default high-end workflow. Uses `gpt-5.5` with `high` reasoning globally, and upgrades PM, Architect, Doc Reviewer, and Code Reviewer to `xhigh`. |
| `xhigh` | Maximum reasoning profile. Uses `gpt-5.5` with `xhigh` reasoning for the workflow. |

`--fast on` writes `service_tier = "fast"` into the generated Codex config. It can reduce latency but may consume fast quota more aggressively. `--fast off` omits the fast service tier.

### CLI Reference

```bash
codex-spec help
codex-spec init --lang en|zh --model high|xhigh --fast off|on
codex-spec doctor
codex-spec status
```

`--target` is optional for project commands. Without it, `codex-spec` uses the current working directory.

## Best Practices

- Keep each milestone small enough to design, implement, review, and finish cleanly.
- Start with `$plan`; let PM turn ambiguous requests into explicit scope and done criteria.
- Keep context in files, not chat memory. Subagents should read only dispatch-listed paths and their own role prompt.
- Treat `dispatch-ledger.md` as main-thread-only state: subagents return reports, and the main thread records dispatch status.
- Treat Doc Reviewer and Code Reviewer as separate gates: document correctness before execution, implementation correctness after execution.
- Use `$auto` for routine progress, but expect it to stop when the next safe decision is unclear.
- After `$finish`, commit the completed milestone with a short user-facing message such as `feat: add import workflow`, `fix: handle empty config`, or `docs: update setup guide`.
- Do not use archived runs as future context. Sync reusable knowledge into `agentflow/` during `$finish`.

## Development

```bash
bun run test
npm pack --dry-run
sh scripts/publish.sh patch
```

The build output is written to `dist/`, and the npm package includes `dist/`, `common/`, `README.md`, `README_ZH.md`, and `LICENSE`.
