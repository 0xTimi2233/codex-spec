import fs from "node:fs";
import path from "node:path";
import { exists, readText, writeText } from "../lib/fs.js";
import { normalizeFastMode, normalizeModelProfile, renderAgentModelConfig, renderRootModelConfig } from "../lib/model-profile.js";
import { exitWith, println } from "../lib/output.js";

const AGENT_ROLES = new Set(["pm", "architect", "tester", "developer", "doc-reviewer", "code-reviewer", "auditor"]);
const REVIEW_ROLES = new Set(["pm", "architect", "doc-reviewer", "code-reviewer"]);
const MODEL_BLOCK_PATTERN = /model = "[^"]+"\nmodel_reasoning_effort = "[^"]+"\n(?:service_tier = "[^"]+"\n)?/;

function hasArg(args, name) {
  return Object.prototype.hasOwnProperty.call(args, name);
}

function agentDir(root) {
  return path.join(root, ".codex", "agents");
}

function configPath(root) {
  return path.join(root, ".codex", "config.toml");
}

function listAgentPaths(root) {
  const dir = agentDir(root);
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".toml"))
    .sort()
    .map((name) => path.join(dir, name));
}

function roleFromPath(agentPath) {
  return path.basename(agentPath, ".toml");
}

function readFastMode(content) {
  return /service_tier = "fast"/.test(content) ? "on" : "off";
}

function readReasoning(content) {
  return content.match(/model_reasoning_effort = "([^"]+)"/)?.[1] || null;
}

function expectedHighReasoning(role) {
  return REVIEW_ROLES.has(role) ? "xhigh" : "high";
}

function inferModelProfile(paths) {
  if (paths.length === 0) return null;
  const entries = paths
    .map((agentPath) => [roleFromPath(agentPath), readReasoning(readText(agentPath))])
    .filter(([role]) => AGENT_ROLES.has(role));
  if (entries.length === 0) return null;
  if (entries.some(([, reasoning]) => !reasoning)) return null;
  if (entries.every(([, reasoning]) => reasoning === "xhigh")) return "xhigh";
  if (entries.every(([role, reasoning]) => reasoning === expectedHighReasoning(role))) return "high";
  return null;
}

function upsertModelBlock(content, block, { afterDescription = false } = {}) {
  const replacement = `${block.trimEnd()}\n`;
  if (MODEL_BLOCK_PATTERN.test(content)) return content.replace(MODEL_BLOCK_PATTERN, replacement);
  if (afterDescription && /description = ".*"\n/.test(content)) {
    return content.replace(/(description = ".*"\n)/, `$1${replacement}`);
  }
  return `${replacement}\n${content.replace(/^\n+/, "")}`;
}

function requireInstalled(root) {
  if (!exists(configPath(root)) || !exists(agentDir(root))) {
    exitWith("codex-spec profile requires an initialized workflow. Run: codex-spec init");
    return false;
  }
  return true;
}

export function profileCommand(args, context) {
  const root = context.target;
  if (!requireInstalled(root)) return;

  const agents = listAgentPaths(root);
  const currentConfig = readText(configPath(root));
  const currentProfile = inferModelProfile(agents);
  const currentFastMode = readFastMode(currentConfig);
  const hasModel = hasArg(args, "model");
  const hasFast = hasArg(args, "fast");

  if (!hasModel && !hasFast) {
    println(`Model profile: ${currentProfile || "unknown"}`);
    println(`Fast mode: ${currentFastMode}`);
    println(`Agents: ${agents.length}`);
    return;
  }

  const modelProfile = hasModel ? normalizeModelProfile(args.model) : currentProfile;
  if (!modelProfile) {
    exitWith("Current model profile could not be inferred. Pass --model high or --model xhigh.");
    return;
  }
  const fastMode = hasFast ? normalizeFastMode(args.fast) : currentFastMode;

  writeText(configPath(root), `${upsertModelBlock(currentConfig, renderRootModelConfig(modelProfile, fastMode)).trimEnd()}\n`, { force: true });
  for (const agentPath of agents) {
    const role = roleFromPath(agentPath);
    const next = upsertModelBlock(readText(agentPath), renderAgentModelConfig(role, modelProfile, fastMode), { afterDescription: true });
    writeText(agentPath, `${next.trimEnd()}\n`, { force: true });
  }

  println(`Model profile: ${modelProfile}`);
  println(`Fast mode: ${fastMode}`);
  println(`Updated agents: ${agents.length}`);
}
