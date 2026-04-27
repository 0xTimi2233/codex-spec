# Spec Guide

Architect owns stable specs under `agentflow/spec/`.

Use specs for accepted design, interfaces, data contracts, and behavior. During `$spec:design`, Architect updates dispatch-listed specs directly; `agentflow/runtime/runs/<run-id>/architect/` stores reports and evidence only.

Suggested sections:

| Section | Content |
|---|---|
| Owner | Architect |
| Scope | Included behavior |
| Non-goals | Excluded behavior |
| Interfaces | Public APIs, files, CLI, events |
| Data contracts | Inputs, outputs, schema, persistence |
| Behavior | Required behavior |
| Error handling | Failure behavior |
| Related ADRs | `agentflow/adr/*.md` |
| Test plan | `agentflow/spec/test-plan/*.md` |
