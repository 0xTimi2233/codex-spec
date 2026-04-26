import path from "node:path";

function tokenizeShell(command) {
  const tokens = [];
  let current = "";
  let quote = null;
  for (let i = 0; i < command.length; i += 1) {
    const char = command[i];
    const next = command[i + 1];
    if (quote) {
      if (char === quote) quote = null;
      else if (char === "\\" && quote === "\"" && next) {
        current += next;
        i += 1;
      } else {
        current += char;
      }
      continue;
    }
    if (char === "'" || char === "\"") {
      quote = char;
      continue;
    }
    if (char === "\\" && next) {
      current += next;
      i += 1;
      continue;
    }
    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }
    if (";&|()".includes(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      tokens.push(char);
      continue;
    }
    if (char === ">") {
      if (current) {
        tokens.push(current);
        current = "";
      }
      tokens.push(next === ">" ? ">>" : ">");
      if (next === ">") i += 1;
      continue;
    }
    current += char;
  }
  if (current) tokens.push(current);
  return tokens;
}

function isBoundaryToken(token) {
  return [";", "&", "|", "(", ")"].includes(token);
}

function isOption(token) {
  return token.startsWith("-") && token !== "-";
}

function collectCommandArgs(tokens, index) {
  const args = [];
  for (let i = index + 1; i < tokens.length && !isBoundaryToken(tokens[i]); i += 1) args.push(tokens[i]);
  return args;
}

function nonOptionArgs(args) {
  return args.filter((arg) => !isOption(arg));
}

function hasAnyFlag(args, flags) {
  return args.some((arg) => flags.some((flag) => arg === flag || arg.startsWith(`${flag}=`)));
}

function includeTargets(targets, paths) {
  if (paths.length) targets.push(...paths);
  return paths.length > 0;
}

export function analyzeShellWrite(command) {
  const tokens = tokenizeShell(command);
  const targets = [];
  let writes = false;
  let ambiguous = false;

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (/^\d?>{1,2}$/.test(token)) {
      writes = true;
      if (tokens[i + 1] && !isBoundaryToken(tokens[i + 1])) targets.push(tokens[i + 1]);
      else ambiguous = true;
    }
  }

  for (let i = 0; i < tokens.length; i += 1) {
    const commandName = path.basename(tokens[i]);
    const args = collectCommandArgs(tokens, i);
    if (!args.length && commandName !== "git") continue;

    if (["touch", "mkdir", "rm", "tee", "truncate"].includes(commandName)) {
      writes = true;
      if (!includeTargets(targets, nonOptionArgs(args))) ambiguous = true;
    } else if (commandName === "cp") {
      writes = true;
      const paths = nonOptionArgs(args);
      if (paths.length >= 2) targets.push(paths[paths.length - 1]);
      else ambiguous = true;
    } else if (commandName === "mv") {
      writes = true;
      const paths = nonOptionArgs(args);
      if (paths.length >= 2) targets.push(...paths);
      else ambiguous = true;
    } else if (commandName === "dd") {
      writes = true;
      const out = args.find((arg) => arg.startsWith("of="));
      if (out) targets.push(out.slice(3));
      else ambiguous = true;
    } else if (["sed", "perl"].includes(commandName) && args.some((arg) => /^-[A-Za-z]*i/.test(arg) || /^-[A-Za-z]*p[A-Za-z]*i/.test(arg))) {
      writes = true;
      ambiguous = true;
    } else if (["python", "python3"].includes(commandName) && hasAnyFlag(args, ["-c"])) {
      writes = true;
      ambiguous = true;
    } else if (commandName === "node" && hasAnyFlag(args, ["-e", "--eval"])) {
      writes = true;
      ambiguous = true;
    } else if (commandName === "git" && ["checkout", "reset", "clean", "restore"].includes(args[0])) {
      writes = true;
      ambiguous = true;
    }
  }

  return { writes, targets, ambiguous };
}
