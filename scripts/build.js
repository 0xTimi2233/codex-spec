import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "hooks"), { recursive: true });

async function buildOne(entry, outdir) {
  const result = await Bun.build({
    entrypoints: [path.join(root, entry)],
    outdir: path.join(root, outdir),
    target: "node",
    format: "esm",
    minify: false,
    sourcemap: "external"
  });
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    process.exit(1);
  }
}

await buildOne("src/cli.js", "dist");
for (const file of ["user-prompt-submit", "pre-tool-use", "post-tool-use", "stop"]) {
  await buildOne(`src/hooks/${file}.js`, "dist/hooks");
}

const cli = path.join(dist, "cli.js");
let cliText = fs.readFileSync(cli, "utf8");
cliText = cliText.replace(/^#!.*\n/, "");
fs.writeFileSync(cli, `#!/usr/bin/env node\n${cliText}`, "utf8");
fs.chmodSync(cli, 0o755);
console.log("Built dist/ with Bun.");
