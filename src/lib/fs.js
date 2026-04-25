import fs from "node:fs";
import path from "node:path";

export function exists(p) {
  return fs.existsSync(p);
}

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

export function readText(p) {
  return fs.readFileSync(p, "utf8");
}

export function writeText(p, content, { force = false } = {}) {
  ensureDir(path.dirname(p));
  if (!force && exists(p)) return false;
  fs.writeFileSync(p, content, "utf8");
  return true;
}

export function readJson(p, fallback = null) {
  if (!exists(p)) return fallback;
  return JSON.parse(readText(p));
}

export function writeJson(p, value, { force = true } = {}) {
  return writeText(p, `${JSON.stringify(value, null, 2)}\n`, { force });
}

export function copyDir(src, dst, { force = false, transform = null, skip = null, copied = [] } = {}) {
  ensureDir(dst);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (skip?.(srcPath, dstPath, entry)) continue;
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath, { force, transform, skip, copied });
      continue;
    }
    let content = fs.readFileSync(srcPath, "utf8");
    if (transform) content = transform(content, srcPath, dstPath);
    const wrote = writeText(dstPath, content, { force });
    if (wrote) copied.push(dstPath);
  }
  return copied;
}

export function listMissing(root, rels) {
  return rels.filter((rel) => !exists(path.join(root, rel)));
}
