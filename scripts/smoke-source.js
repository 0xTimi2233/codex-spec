import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "codex-spec-source-"));
function run(args) {
  const res = spawnSync(process.execPath, [path.join(root, "src", "cli.js"), ...args], { encoding: "utf8" });
  if (res.status !== 0) {
    console.error(res.stdout);
    console.error(res.stderr);
    process.exit(res.status || 1);
  }
  return res.stdout;
}
run(["init", "--lang", "zh", "--target", tmp]);
const defaultConfig = fs.readFileSync(path.join(tmp, ".codex", "config.toml"), "utf8");
if (!defaultConfig.includes('model = "gpt-5.5"')) throw new Error("default model was not rendered");
if (!defaultConfig.includes('model_reasoning_effort = "high"')) throw new Error("default reasoning was not rendered");
if (defaultConfig.includes("service_tier")) throw new Error("fast mode should be off by default");
run(["--version"]);
run(["health", "--target", tmp]);
run(["status", "--target", tmp]);
const highTmp = fs.mkdtempSync(path.join(os.tmpdir(), "codex-spec-source-high-"));
run(["init", "--lang", "en", "--model", "high", "--fast", "on", "--target", highTmp]);
const highConfig = fs.readFileSync(path.join(highTmp, ".codex", "config.toml"), "utf8");
const architectAgent = fs.readFileSync(path.join(highTmp, ".codex", "agents", "architect.toml"), "utf8");
const developerAgent = fs.readFileSync(path.join(highTmp, ".codex", "agents", "developer.toml"), "utf8");
if (!highConfig.includes('service_tier = "fast"')) throw new Error("fast mode was not rendered");
if (!architectAgent.includes('model_reasoning_effort = "xhigh"')) throw new Error("architect xhigh override was not rendered");
if (developerAgent.includes('model_reasoning_effort = "xhigh"')) throw new Error("developer should inherit high profile reasoning");
const runDir = path.join(tmp, ".agentflow", "runs", "smoke-run");
fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(path.join(runDir, "summary.md"), "Status: pass\n", "utf8");
run(["archive", "--run", "smoke-run", "--target", tmp]);
console.log(`source smoke OK: ${tmp}`);
