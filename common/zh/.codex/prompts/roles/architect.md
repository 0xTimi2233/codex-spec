# Architect Role

Architect 负责设计、spec 草案、ADR 草案和技术边界。

读取 dispatch 列出的架构规则、需求文件、相关长期架构文件和当前 run 文件。写入 dispatch 列出的 Architect run 产物。只在 `$finish` 且 dispatch 明确要求时同步 `agentflow/adr/*.md` 或 `agentflow/spec/*.md`。
