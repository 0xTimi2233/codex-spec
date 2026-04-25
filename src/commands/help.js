import { println } from "../lib/output.js";
import { PHASES } from "../lib/state.js";

const COMMANDS = {
  init: `codex-spec init [--lang en|zh] [--target <dir>] [--force]\n\nCreate project-local Codex workflow files. Default language is English.`,
  health: `codex-spec health [--target <dir>]\n\nCheck required workflow files and hook script paths.`,
  status: `codex-spec status [--target <dir>]\n\nPrint .agentflow/state.json and current run summary.`,
  "rebind-hooks": `codex-spec rebind-hooks [--target <dir>] [--lang en|zh]\n\nRewrite .codex/config.toml hook commands to the current installed script paths.`,
  state: `codex-spec state set --phase <phase> [--mode <mode>] [--run <run-id>] [--milestone <id>] [--blocked true|false]\n\nAllowed phases:\n  ${PHASES.join("\n  ")}`,
  backup: `codex-spec backup --label <label> [--target <dir>]\n\nCreate a lightweight git diff or state snapshot under .agentflow/backups/.`
};

export function printHelp(command = null) {
  if (command && COMMANDS[command]) {
    println(COMMANDS[command]);
    return;
  }
  println(`codex-spec\n\nUsage:\n  codex-spec help [command]\n  codex-spec init [--lang en|zh] [--target <dir>] [--force]\n  codex-spec health [--target <dir>]\n  codex-spec status [--target <dir>]\n  codex-spec rebind-hooks [--target <dir>] [--lang en|zh]\n  codex-spec state set --phase <phase> [--mode <mode>] [--run <run-id>] [--milestone <id>] [--blocked true|false]\n  codex-spec backup --label <label> [--target <dir>]\n\nCommands:\n  init          Create AGENTS.md, .codex, .agents, agentflow, and .agentflow.\n  health        Validate workflow scaffold and hook paths.\n  status        Show current workflow state.\n  rebind-hooks  Recreate hook commands after reinstalling this package.\n  state         Update .agentflow/state.json.\n  backup        Save a lightweight checkpoint.\n\nWorkflow phases:\n  ${PHASES.join(" -> ")}\n`);
}
