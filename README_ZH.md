# codex-spec

[English](README.md) | [中文](README_ZH.md)

`codex-spec` 是一个面向 Codex 的项目本地工作流脚手架。它为 Codex 提供一套轻量的、基于文件的 spec-driven 工作方式：主线程负责编排，角色子代理接收窄范围 dispatch，reviewer 负责 gate，长期文档和 run 产物替代聊天历史成为事实来源。

## 安装

```bash
npm install -g @0xtimi2233/codex-spec
codex-spec --version
```

升级：

```bash
npm install -g @0xtimi2233/codex-spec@latest
```

要求：

- Node.js 20 或更高版本
- 项目中已安装并可使用 Codex

## 快速开始

在当前目录初始化中文模板：

```bash
codex-spec init --lang zh
```

检查脚手架：

```bash
codex-spec doctor
codex-spec status
```

然后在项目中启动 Codex，并使用技能推进流程：

```text
$plan
$design
$doc-review
$execute
$code-review
$finish
```

需要受控自动推进时，使用：

```text
$auto
```

## 详细介绍

### 生成内容

```text
AGENTS.md
.codex/
.agents/
agentflow/
.agentflow/
```

长期项目知识保存在 `agentflow/`：vision、roadmap、ADR、spec 和测试计划。当前工作保存在 `.agentflow/runs/<run-id>/`：任务文件、调度 ledger、dispatch、角色报告、review ledger、修复请求和总结。完成的 run 会归档到 `.agentflow/archives/`。

### 角色

```text
PM
Architect
Tester
Doc Reviewer
Developer
Code Reviewer
Auditor
```

主线程只负责编排和整合。PM 定义范围。Architect 编写设计、spec 和 ADR 草案。Tester 编写测试计划和覆盖审查，不写实现代码。Doc Reviewer 在实现前审查文档一致性。Developer 根据通过 gate 的方案实现代码和测试。Code Reviewer 在实现后审查代码。Auditor 在 `$finish` 阶段总结当前 run。

### 工作流

```text
$plan        定义需求、范围、milestone 和 run task
$design      产出设计、spec、ADR 草案和测试计划
$doc-review  实现前审查文档一致性
$execute     根据通过 gate 的方案实现代码和测试
$code-review 根据 gate、spec 和测试计划审查实现
$finish      总结、同步长期文档、归档 run、清理状态
```

`$auto` 使用同样的 gate。遇到打回时，如果责任角色和修复范围明确，主线程会把问题路由给对应子代理；只有无法安全判断下一步或需要外部决策时才停止。

### 模型档位

`init` 可以生成模型和推理强度配置：

```bash
codex-spec init --model high --fast on
codex-spec init --model xhigh --fast off
```

| 档位 | 生成行为 |
| --- | --- |
| `high` | 默认高端工作流。全局使用 `gpt-5.5` + `high`，并将 PM、Architect、Doc Reviewer、Code Reviewer 提升到 `xhigh`。 |
| `xhigh` | 最大推理档。工作流使用 `gpt-5.5` + `xhigh`。 |

`--fast on` 会在生成的 Codex 配置中写入 `service_tier = "fast"`。它可以降低延迟，但会更快消耗 fast 额度。`--fast off` 不写入 fast service tier。

### CLI 命令

```bash
codex-spec help
codex-spec init --lang en|zh --model high|xhigh --fast off|on
codex-spec doctor
codex-spec status
```

项目命令都可以使用可选的 `--target`。不传时，`codex-spec` 使用当前目录。

## 最佳实践

- 每个 milestone 保持足够小，确保可以完整完成设计、实现、审查和 finish。
- 从 `$plan` 开始，让 PM 把模糊需求整理成清晰范围和完成标准。
- 把上下文放在文件里，不依赖聊天记忆。子代理只读取 dispatch 指定路径和自己的角色 prompt。
- 子代理返回简短报告；主线程根据报告和调度状态安排下一步。
- 区分 Doc Reviewer 和 Code Reviewer：先验证文档正确性，再验证实现正确性。
- 常规推进可以使用 `$auto`，但当下一步无法安全判断时应停止。
- `$finish` 后提交完成的 milestone，提交信息使用简洁的用户可见描述，例如 `feat: add import workflow`、`fix: handle empty config`、`docs: update setup guide`。
- 归档 run 是历史记录，不作为后续上下文来源。可复用信息应在 `$finish` 阶段同步到 `agentflow/`。

## 开发

```bash
bun run test
npm pack --dry-run
sh scripts/publish.sh patch
```

构建产物会写入 `dist/`，npm 包包含 `dist/`、`common/`、`README.md`、`README_ZH.md` 和 `LICENSE`。
