#!/usr/bin/env bash
# The skill is authored in Rubiic's own codebase and served at a stable URL.
# This copy exists so the plugin can ship it; it must never drift from what
# rubiic.com serves. `--write` refreshes the copy instead of failing.
set -euo pipefail
url="https://rubiic.com/skills/rubiic/SKILL.md"
here="$(cd "$(dirname "$0")/.." && pwd)"
live="$(mktemp)"
trap 'rm -f "$live"' EXIT
curl -fsSL "$url" -o "$live"
if [[ "${1:-}" == "--write" ]]; then
  cp "$live" "$here/skills/rubiic/SKILL.md"
  echo "Updated skills/rubiic/SKILL.md from $url"
elif ! diff -u "$here/skills/rubiic/SKILL.md" "$live"; then
  echo "skills/rubiic/SKILL.md differs from $url. Run scripts/check-skill.sh --write." >&2
  exit 1
else
  echo "skills/rubiic/SKILL.md matches $url"
fi
