import path from "node:path";
import { copyDir } from "./fs.js";
import { renderAgentModelConfig, renderRootModelConfig } from "./model-profile.js";
import { commandForNodeScript, hookPaths, tomlString } from "./paths.js";

export function templateRoot(packageRoot, lang) {
  return path.join(packageRoot, "common", lang);
}

export function renderConfigToml(template, packageRoot, { modelProfile = "middle", fastMode = "off" } = {}) {
  const hooks = hookPaths(packageRoot);
  const replacements = {
    "{{MODEL_PROFILE_CONFIG}}": renderRootModelConfig(modelProfile, fastMode),
    "{{HOOK_USER_PROMPT_SUBMIT}}": tomlString(commandForNodeScript(hooks.userPromptSubmit)),
    "{{HOOK_PRE_TOOL_USE}}": tomlString(commandForNodeScript(hooks.preToolUse)),
    "{{HOOK_POST_TOOL_USE}}": tomlString(commandForNodeScript(hooks.postToolUse)),
    "{{HOOK_STOP}}": tomlString(commandForNodeScript(hooks.stop))
  };
  let out = template;
  for (const [key, value] of Object.entries(replacements)) out = out.split(key).join(value);
  return out;
}

export function renderAgentToml(template, role, { modelProfile = "middle" } = {}) {
  const modelConfig = renderAgentModelConfig(role, modelProfile);
  if (!modelConfig) return template;
  return template.replace(/(description = ".*"\n)/, `$1${modelConfig}`);
}

export function copyTemplate({ packageRoot, targetRoot, lang, force, modelProfile = "middle", fastMode = "off" }) {
  const src = templateRoot(packageRoot, lang);
  return copyDir(src, targetRoot, {
    force,
    transform: (content, srcPath) => {
      if (srcPath.endsWith(".codex/config.toml.tpl")) {
        return renderConfigToml(content, packageRoot, { modelProfile, fastMode });
      }
      if (srcPath.includes(`${path.sep}.codex${path.sep}agents${path.sep}`) && srcPath.endsWith(".toml")) {
        return renderAgentToml(content, path.basename(srcPath, ".toml"), { modelProfile });
      }
      return content;
    },
    skip: (_srcPath, dstPath) => dstPath.endsWith(".codex/config.toml.tpl")
  });
}
