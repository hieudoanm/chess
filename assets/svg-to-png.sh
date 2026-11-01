#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SVG_DIR="$ROOT/assets/svg"
PNG_DIR="$ROOT/assets/png"

command -v rsvg-convert >/dev/null 2>&1 || {
  echo "rsvg-convert is required but not installed" >&2
  exit 1
}

mkdir -p "$PNG_DIR"

find "$SVG_DIR" -type f -name '*.svg' | while IFS= read -r svg; do
  if [ ! -s "$svg" ]; then
    echo "skip (empty): $svg" >&2
    continue
  fi
  rel="${svg#$SVG_DIR/}"
  rel="${rel%.svg}"
  png="$PNG_DIR/$rel.png"
  mkdir -p "$(dirname "$png")"
  if rsvg-convert -w 512 -h 512 -o "$png" "$svg"; then
    echo "converted $svg -> $png"
  else
    echo "failed: $svg" >&2
  fi
done
