import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

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
await buildOne("src/internal.js", "dist");

const cli = path.join(dist, "cli.js");
let cliText = fs.readFileSync(cli, "utf8");
cliText = cliText.replace(/^#!.*\n/, "");
fs.writeFileSync(cli, `#!/usr/bin/env node\n${cliText}`, "utf8");
fs.chmodSync(cli, 0o755);
const internal = path.join(dist, "internal.js");
let internalText = fs.readFileSync(internal, "utf8");
internalText = internalText.replace(/^#!.*\n/, "");
fs.writeFileSync(internal, `#!/usr/bin/env node\n${internalText}`, "utf8");
fs.chmodSync(internal, 0o755);
console.log("Built dist/ with Bun.");
