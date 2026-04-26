#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd "$SCRIPT_DIR/.." && pwd)
cd "$REPO_ROOT"

BUMP="${1:-patch}"
REGISTRY="https://registry.npmjs.org/"

case "$BUMP" in
  patch|minor|major|prepatch|preminor|premajor|prerelease|[0-9]*.[0-9]*.[0-9]*)
    ;;
  *)
    echo "Usage: ./publish.sh [patch|minor|major|x.y.z]" >&2
    exit 1
    ;;
esac

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required." >&2
  exit 1
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "bun is required." >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree must be clean before publishing." >&2
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree has untracked files. Commit or remove them before publishing." >&2
  exit 1
fi

npm whoami --registry "$REGISTRY" >/dev/null
bun run test
npm pack --dry-run --registry "$REGISTRY"
npm version "$BUMP" -m "chore: release %s"
npm publish --access public --registry "$REGISTRY"
