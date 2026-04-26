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
$brainstorm
$plan
$design
$execute
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

Long-lived project knowledge lives in `agentflow/`: vision, roadmap, ADRs, specs, and test plans. Brainstorm notes live in `.agentflow/brainstorm/brief.md` before they are promoted into planning. Current work lives in `.agentflow/runs/<run-id>/`: task files, dispatch ledger, dispatch packets, role reports, review ledgers, fix requests, and summaries. Completed runs are moved to immutable `.agentflow/archives/`.

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

The main thread orchestrates and integrates. PM defines scope and roadmap milestones. Architect writes design/spec/ADR drafts. Tester writes test plans and coverage reviews, not implementation code. Doc Reviewer checks document consistency before execution. Developer implements code and tests from an approved gate. Code Reviewer checks implementation after execution. Auditor summarizes the run during milestone finish.

### Workflow

```text
$brainstorm  explore requirements before formal planning
$plan        confirm requirements, update roadmap, prepare the next milestone run
$design      produce design/spec/ADR drafts, test plan, doc review, and approved gate
$execute     implement, code-review, verify, finish, archive, and commit the current milestone
$auto        run roadmap milestones serially through design and execute
```

Doc review, code review, verification, finish, archive, and milestone commit are internal stages. When a rejection has a clear owner and fix scope, the main thread routes it to the responsible subagent. `$auto` stops only when safe routing is not possible or an external decision is required.

### Model Profiles

`init` can generate model and reasoning settings:

```bash
codex-spec init --model high --fast on
codex-spec init --model xhigh --fast off
```

| Profile | Generated behavior |
| --- | --- |
| `high` | Default high-end workflow. The project-level main thread uses `gpt-5.5` + `xhigh`; every subagent has explicit model settings. PM, Architect, Doc Reviewer, and Code Reviewer use `xhigh`; Developer, Tester, and Auditor use `high`. |
| `xhigh` | Maximum reasoning profile. The project-level main thread and every subagent use `gpt-5.5` + `xhigh`. |

`--fast on` writes `service_tier = "fast"` into the generated Codex config. It can reduce latency but may consume fast quota more aggressively. `--fast off` omits the fast service tier.

`--lang zh` generates Simplified Chinese workflow prompts. Natural-language task files, dispatch text, reports, and long-lived docs should be written in Chinese.

### CLI Reference

```bash
codex-spec help
codex-spec init --lang en|zh --model high|xhigh --fast off|on
codex-spec doctor
codex-spec status
```

`--target` is optional for project commands. Without it, `codex-spec` uses the current working directory.
`init` preserves existing generated files by default and asks before overwriting them in interactive shells. Existing `agentflow/` and `.agentflow/` files are treated as project artifacts and are never overwritten.

`doctor` checks the installed scaffold files. Workflow progress is reported by `status` and the `$status` skill.

## Best Practices

- Keep each milestone small enough to design, implement, review, and finish cleanly.
- Use `$brainstorm` for early exploration. It writes a brief but does not create a run, update roadmap, or edit code.
- Start formal work with `$plan`; let PM turn confirmed requirements into explicit scope, roadmap milestones, and done criteria.
- If `$plan` finds an unfinished brainstorm brief, close or discard it first. After a brief becomes ready for planning, use a clean chat context when practical.
- Keep context in files, not chat memory. Subagents should read only dispatch-listed paths and their own role prompt.
- Keep prompt prefixes stable: put protocol and role context first, and keep per-task dispatch as the dynamic suffix.
- Subagents return short reports; the main thread uses those reports and dispatch status to route the next step.
- When PM needs a product decision, the main thread presents numbered options with impacts and a recommendation.
- Treat Doc Reviewer and Code Reviewer as separate gates: document correctness before execution, implementation correctness after execution.
- Use `$auto` for routine roadmap progress, but expect it to stop when the next safe decision is unclear.
- `$execute` commits the completed milestone with a short user-facing message such as `feat: add import workflow`, `fix: handle empty config`, or `docs: update setup guide`.
- Do not use archived runs as future context. Sync reusable knowledge into `agentflow/` during milestone finish.

Use the full workflow for multi-step changes, cross-file refactors, or work where review evidence matters. For small edits, exploratory prototypes, or projects without tests, use a shorter manual Codex flow outside an active run. During an active run, Developer and Code Reviewer use the approved run contract as the prompt-level implementation boundary.

## Development

```bash
bun run test
npm pack --dry-run
./publish.sh patch
```

The build output is written to `dist/`, and the npm package includes `dist/`, `common/`, `README.md`, `README_ZH.md`, and `LICENSE`.
