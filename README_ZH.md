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
$spec:brainstorm
$spec:plan
$spec:design
$spec:execute
```

需要受控自动推进时，使用：

```text
$spec:auto
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

长期项目知识保存在 `agentflow/`：vision、roadmap、ADR、spec 和测试计划。Brainstorm session 保存在 `.agentflow/brainstorm/<brainstorm-id>/`：问题轮次追加到 `rounds/`，session 结束时合并到 `brief.md`。完成的 brainstorm 归档到 `.agentflow/archives/brainstorm/<brainstorm-id>/`。PM planning 使用主线程指定的 `brief.md`。当前工作保存在 `.agentflow/runs/<run-id>/`：任务文件、调度 ledger、dispatch、角色报告、review ledger、修复请求和总结。完成的 run 会移动归档到不可变的 `.agentflow/archives/`。

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

主线程只负责编排和整合。PM 定义范围和 roadmap milestone。Architect 编写设计、spec 和 ADR 草案。Tester 编写测试计划和覆盖审查，不写实现代码。Doc Reviewer 在实现前审查文档一致性。Developer 根据通过 gate 的方案实现代码和测试。Code Reviewer 在实现后审查代码。Auditor 在 milestone finish 阶段总结当前 run。

### 工作流

```text
$spec:brainstorm  在正式 planning 前探索需求
$spec:plan        确认需求、更新 roadmap、准备下一 milestone run
$spec:design      产出设计、spec、ADR 草案、测试计划、doc review 和 approved gate
$spec:execute     实现、code review、验证、finish、归档并提交当前 milestone
$spec:auto        按 roadmap 串行执行 milestone
```

doc review、code review、verification、finish、archive 和 milestone commit 是内部阶段。遇到打回时，如果责任角色和修复范围明确，主线程会把问题路由给对应子代理；`$spec:auto` 只有无法安全判断下一步或需要外部决策时才停止。

### 模型档位

`init` 可以生成模型和推理强度配置：

```bash
codex-spec init --model high --fast on
codex-spec init --model xhigh --fast off
```

| 档位 | 生成行为 |
| --- | --- |
| `high` | 默认高端工作流。项目级主线程使用 `gpt-5.5` + `xhigh`；每个子代理都显式写入模型配置。PM、Architect、Doc Reviewer、Code Reviewer 使用 `xhigh`，Developer、Tester、Auditor 使用 `high`。 |
| `xhigh` | 最大推理档。项目级主线程和所有子代理都使用 `gpt-5.5` + `xhigh`。 |

`--fast on` 会在生成的项目级和子代理 Codex 配置中写入 `service_tier = "fast"`。它可以降低延迟，但会更快消耗 fast 额度。`--fast off` 不写入 fast service tier。

初始化后可以用 `profile` 查看或修改当前模型档位：

```bash
codex-spec profile
codex-spec profile --model xhigh
codex-spec profile --fast on
```

`--lang zh` 会生成简体中文工作流 prompt。task、dispatch、报告和长期文档的自然语言正文使用中文。

### CLI 命令

```bash
codex-spec help
codex-spec init --lang en|zh --model high|xhigh --fast off|on
codex-spec profile --model high|xhigh --fast off|on
codex-spec doctor
codex-spec status
```

项目命令都可以使用可选的 `--target`。不传时，`codex-spec` 使用当前目录。
`init` 默认保留已有生成文件，并会在交互式终端中询问是否覆盖。已有 `agentflow/` 和 `.agentflow/` 文件视为项目产物，永不覆盖。

`doctor` 只检查脚手架安装文件。工作流进度由 `status` 和 `$spec:status` skill 报告。

## 最佳实践

- 每个 milestone 保持足够小，确保可以完整完成设计、实现、审查和 finish。
- 使用 `$spec:brainstorm` 做早期探索。它追加问题轮次，结束时归档，并将 `brief.md` 作为 planning 输入。
- 正式工作从 `$spec:plan` 开始，让 PM 把已确认需求整理成范围、roadmap milestone 和完成标准。
- `$spec:plan` 发现未结束 brainstorm brief 时，先结束或废弃。brief 进入 planning 前，建议在可行时使用干净聊天上下文。
- 把上下文放在文件里，不依赖聊天记忆。子代理只读取 dispatch 指定路径和自己的角色 prompt。
- 保持 prompt 前缀稳定：协议和角色上下文放前面，单次任务 dispatch 作为动态后缀。
- 子代理返回简短报告；主线程根据报告和调度状态安排下一步。
- PM 需要产品决策时，主线程给出带影响和推荐项的编号选项。
- 区分 Doc Reviewer 和 Code Reviewer：先验证文档正确性，再验证实现正确性。
- 常规 roadmap 推进可以使用 `$spec:auto`，但当下一步无法安全判断时应停止。
- `$spec:execute` 提交完成的 milestone，提交信息使用简洁的用户可见描述，例如 `feat: add import workflow`、`fix: handle empty config`、`docs: update setup guide`。
- 归档 run 是历史记录，不作为后续上下文来源。可复用信息应在 milestone finish 阶段同步到 `agentflow/`。

完整流程适合多步骤改动、跨文件重构或需要审查证据的工作。小改动、探索性原型或缺少测试基础的项目，可以在没有 active run 时使用较短的手动 Codex 流程。存在 active run 时，Developer 和 Code Reviewer 将已通过的 run contract 作为 prompt 层面的实现边界。

## 开发

```bash
bun run test
npm pack --dry-run
./publish.sh patch
```

构建产物会写入 `dist/`，npm 包包含 `dist/`、`common/`、`README.md`、`README_ZH.md` 和 `LICENSE`。
