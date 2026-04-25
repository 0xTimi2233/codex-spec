export function println(message = "") {
  process.stdout.write(`${message}\n`);
}

export function warn(message) {
  process.stderr.write(`${message}\n`);
}

export function exitWith(message, code = 1) {
  warn(message);
  process.exitCode = code;
}
