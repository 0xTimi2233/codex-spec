import fs from "node:fs";
import path from "node:path";

const APPROVED = "approved";

function normalizeRel(value) {
  return String(value || "").replaceAll("\\", "/").replace(/^\.\/+/, "").replace(/^\/+/, "");
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function globToRegExp(pattern) {
  const normalized = normalizeRel(pattern);
  if (!normalized || normalized === "-") return null;
  let out = "^";
  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i];
    const next = normalized[i + 1];
    if (char === "*" && next === "*") {
      out += ".*";
      i += 1;
    } else if (char === "*") {
      out += "[^/]*";
    } else {
      out += escapeRegExp(char);
    }
  }
  out += normalized.endsWith("/") ? ".*$" : "$";
  return new RegExp(out);
}

function parseScalar(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed === "-") return [];
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return [trimmed.replace(/^["']|["']$/g, "")];
}

export function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return {};
  const end = text.indexOf("\n---", 4);
  if (end === -1) return {};
  const lines = text.slice(4, end).split(/\r?\n/);
  const data = {};
  let currentKey = null;
  for (const line of lines) {
    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = parseScalar(data[currentKey]);
      data[currentKey].push(listMatch[1].trim().replace(/^["']|["']$/g, ""));
      continue;
    }
    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) {
      currentKey = null;
      continue;
    }
    currentKey = keyMatch[1];
    const value = keyMatch[2] || "";
    data[currentKey] = value ? parseScalar(value) : [];
  }
  return data;
}

export function readGate(gatePath) {
  if (!fs.existsSync(gatePath)) {
    return { ok: false, reason: "gate file is missing", gate: null };
  }
  const gate = parseFrontmatter(fs.readFileSync(gatePath, "utf8"));
  const status = String(gate.status?.[0] || "").toLowerCase();
  if (status !== APPROVED) {
    return { ok: false, reason: "gate status is not approved", gate };
  }
  const allowedPaths = [
    ...(gate.allowed_paths || []),
    ...(gate.allowed_source_paths || []),
    ...(gate.allowed_test_paths || [])
  ].map(normalizeRel);
  if (!allowedPaths.length) {
    return { ok: false, reason: "gate has no allowed source/test paths", gate };
  }
  return { ok: true, reason: null, gate: { ...gate, allowedPaths } };
}

export function isPathAllowedByGate(root, gate, candidatePath) {
  if (!gate?.allowedPaths?.length || !candidatePath) return false;
  const rel = path.isAbsolute(candidatePath)
    ? normalizeRel(path.relative(root, candidatePath))
    : normalizeRel(candidatePath);
  return gate.allowedPaths.some((pattern) => {
    const normalized = normalizeRel(pattern);
    if (!normalized) return false;
    if (normalized.endsWith("/") && rel.startsWith(normalized)) return true;
    const regex = globToRegExp(normalized);
    return regex ? regex.test(rel) : false;
  });
}

