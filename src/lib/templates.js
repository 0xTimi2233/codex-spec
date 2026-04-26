import path from "node:path";
import fs from "node:fs";
import { copyDir } from "./fs.js";
import { renderAgentModelConfig, renderRootModelConfig } from "./model-profile.js";

export function templateRoot(packageRoot, lang) {
  return path.join(packageRoot, "common", lang);
}

export function renderConfigToml(template, _packageRoot, { modelProfile = "high", fastMode = "off" } = {}) {
  const replacements = {
    "{{MODEL_PROFILE_CONFIG}}": renderRootModelConfig(modelProfile, fastMode)
  };
  let out = template;
  for (const [key, value] of Object.entries(replacements)) out = out.split(key).join(value);
  return out;
}

export function renderAgentToml(template, role, { modelProfile = "high", fastMode = "off" } = {}) {
  const modelConfig = renderAgentModelConfig(role, modelProfile, fastMode);
  if (!modelConfig) return template;
  return template.replace(/(description = ".*"\n)/, `$1${modelConfig}`);
}

export function listTemplateOutputs(packageRoot, lang) {
  const src = templateRoot(packageRoot, lang);
  const outputs = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const srcPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(srcPath);
        continue;
      }
      const rel = path.relative(src, srcPath).replaceAll(path.sep, "/");
      if (rel === ".codex/config.toml.tpl") {
        outputs.push(".codex/config.toml");
        continue;
      }
      outputs.push(rel);
    }
  }
  walk(src);
  return outputs;
}

export function copyTemplate({ packageRoot, targetRoot, lang, force, modelProfile = "high", fastMode = "off", preserveExisting = null }) {
  const src = templateRoot(packageRoot, lang);
  return copyDir(src, targetRoot, {
    force,
    transform: (content, srcPath) => {
      if (srcPath.endsWith(".codex/config.toml.tpl")) {
        return renderConfigToml(content, packageRoot, { modelProfile, fastMode });
      }
      if (srcPath.includes(`${path.sep}.codex${path.sep}agents${path.sep}`) && srcPath.endsWith(".toml")) {
        return renderAgentToml(content, path.basename(srcPath, ".toml"), { modelProfile, fastMode });
      }
      return content;
    },
    skip: (_srcPath, dstPath, entry) => {
      if (dstPath.endsWith(".codex/config.toml.tpl")) return true;
      return entry.isFile() && preserveExisting?.(dstPath);
    }
  });
}
