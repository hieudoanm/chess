#!/usr/bin/env bash
# Convert every SVG under assets/**/svg/ to a sibling PNG under assets/**/png/.
# Output keeps each SVG's intrinsic size and aspect ratio.
#
# Usage: assets/svg-to-png.sh

set -euo pipefail

ASSETS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JOBS="${JOBS:-4}"

command -v rsvg-convert >/dev/null 2>&1 || {
  echo "rsvg-convert is required but not installed" >&2
  echo "  macOS:  brew install librsvg" >&2
  echo "  Debian: sudo apt-get install librsvg2-bin" >&2
  echo "  Arch:   sudo pacman -S librsvg" >&2
  exit 1
}

pids=()
count=0
while IFS= read -r -d '' svg; do
  (
    png="$(dirname "$svg" | sed 's|/svg$|/png|')/$(basename "${svg%.svg}").png"

    if [ ! -s "$svg" ]; then
      echo "skip (empty): $svg" >&2
      exit 0
    fi

    mkdir -p "$(dirname "$png")"
    if rsvg-convert -o "$png" "$svg"; then
      echo "converted $svg -> $png"
    else
      echo "failed: $svg" >&2
      exit 1
    fi
  ) &
  pids+=("$!")
  count=$((count + 1))
  if [ "${#pids[@]}" -ge "$JOBS" ]; then
    wait "${pids[0]}" || true
    pids=("${pids[@]:1}")
  fi
done < <(find "$ASSETS_DIR" -type f -path '*/svg/*.svg' -print0)

status=0
for pid in "${pids[@]}"; do
  wait "$pid" || status=1
done

if [ "$count" -eq 0 ]; then
  echo "no svg files found under $ASSETS_DIR/*/svg" >&2
fi

exit "$status"
