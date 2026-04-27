#!/usr/bin/env node
import { parseArgs } from "./lib/args.js";
import { findPackageRoot, resolveTarget } from "./lib/paths.js";
import { statusCommand } from "./commands/status.js";
import { stateCommand } from "./commands/state.js";
import { archiveCommand } from "./commands/archive.js";
import { exitWith } from "./lib/output.js";

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || null;
const packageRoot = findPackageRoot(import.meta.url);
const context = { packageRoot, target: resolveTarget(args) };

if (command === "status") {
  statusCommand(args, context);
} else if (command === "state") {
  stateCommand(args, context);
} else if (command === "archive") {
  archiveCommand(args, context);
} else {
  exitWith("Usage: codex-spec-internal status|state|archive [options]");
}
