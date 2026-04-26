import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "codex-spec-dist-"));
function run(args) {
  const res = spawnSync(process.execPath, [path.join(root, "dist", "cli.js"), ...args], { encoding: "utf8" });
  if (res.status !== 0) {
    console.error(res.stdout);
    console.error(res.stderr);
    process.exit(res.status || 1);
  }
  return res.stdout;
}
function runFail(args) {
  const res = spawnSync(process.execPath, [path.join(root, "dist", "cli.js"), ...args], { encoding: "utf8" });
  if (res.status === 0) throw new Error(`Expected command to fail: ${args.join(" ")}`);
  return `${res.stdout}${res.stderr}`;
}
run(["init", "--lang", "en", "--model", "xhigh", "--fast", "off", "--target", tmp]);
const config = fs.readFileSync(path.join(tmp, ".codex", "config.toml"), "utf8");
const developerAgent = fs.readFileSync(path.join(tmp, ".codex", "agents", "developer.toml"), "utf8");
if (!config.includes('model = "gpt-5.5"')) throw new Error("model was not rendered");
if (!config.includes('model_reasoning_effort = "xhigh"')) throw new Error("xhigh profile was not rendered");
if (config.includes("service_tier")) throw new Error("fast mode off should not render service_tier");
if (!developerAgent.includes('model = "gpt-5.5"')) throw new Error("developer model should be explicit");
if (!developerAgent.includes('model_reasoning_effort = "xhigh"')) throw new Error("xhigh profile should render xhigh agent reasoning");
run(["--version"]);
run(["doctor", "--target", tmp]);
run(["status", "--target", tmp]);
const runDir = path.join(tmp, ".agentflow", "runs", "smoke-run");
fs.mkdirSync(runDir, { recursive: true });
fs.writeFileSync(path.join(runDir, "summary.md"), "Status: pass\n", "utf8");
if (!runFail(["archive", "--run", "../bad", "--target", tmp]).includes("Invalid run id")) throw new Error("archive should reject unsafe run ids");
run(["archive", "--run", "smoke-run", "--target", tmp]);
if (fs.existsSync(runDir)) throw new Error("archive should move run out of runs/");
if (!fs.existsSync(path.join(tmp, ".agentflow", "archives", "smoke-run"))) throw new Error("archive directory was not created");
console.log(`dist smoke OK: ${tmp}`);
