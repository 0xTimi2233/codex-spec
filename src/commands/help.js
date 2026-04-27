import { println } from "../lib/output.js";
const COMMANDS = {
  init: `codex-spec init [--lang en|zh] [--model high|xhigh] [--fast off|on] [--target <dir>] [--force]\n\nCreate project-local Codex workflow files. Default language is English. Default model profile is high and fast mode is off. Existing generated files are preserved by default; interactive runs ask before overwriting non-codexspec files. Existing codexspec/ files are never overwritten.`,
  doctor: `codex-spec doctor [--target <dir>]\n\nCheck required workflow scaffold files.`,
  profile: `codex-spec profile [--model high|xhigh] [--fast off|on] [--target <dir>]\n\nShow or update generated model and fast-mode settings.`
};

export function printHelp(command = null) {
  if (command && COMMANDS[command]) {
    println(COMMANDS[command]);
    return;
  }
  println(`codex-spec\n\nUsage:\n  codex-spec help [command]\n  codex-spec init [--lang en|zh] [--model high|xhigh] [--fast off|on] [--target <dir>] [--force]\n  codex-spec doctor [--target <dir>]\n  codex-spec profile [--model high|xhigh] [--fast off|on] [--target <dir>]\n  codex-spec --version\n\nCommands:\n  init      Create .codex, .agents, and codexspec.\n  doctor    Validate workflow scaffold files.\n  profile   Show or update generated model and fast-mode settings.\n  help      Show command help.\n`);
}
