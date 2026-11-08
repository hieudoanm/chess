#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SVG_DIR="$ROOT/assets/svg"
PNG_DIR="$ROOT/assets/png"
MAX_DIM=512

command -v rsvg-convert >/dev/null 2>&1 || {
  echo "rsvg-convert is required but not installed" >&2
  exit 1
}

svg_dim() {
  local svg="$1" attr="$2" tag
  tag="$(grep -o '<svg[^>]*>' "$svg" | head -1)"
  printf '%s' "$tag" | sed -n "s/.*${attr}=\"\\([0-9.]*\\)[^\"]*\".*/\\1/p"
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

  w="$(svg_dim "$svg" width)"
  h="$(svg_dim "$svg" height)"
  if [ -z "$w" ] || [ -z "$h" ]; then
    vb="$(grep -o '<svg[^>]*>' "$svg" | head -1 | sed -n 's/.*viewBox="[^"]* [^"]* \([0-9.]*\) \([0-9.]*\)".*/\1 \2/p')"
    w="${vb%% *}"
    h="${vb##* }"
  fi
  if [ -z "$w" ] || [ -z "$h" ]; then
    echo "skip (no dimensions): $svg" >&2
    continue
  fi

  dims="$(awk -v w="$w" -v h="$h" -v m="$MAX_DIM" '
    BEGIN {
      if (w >= h) { nw = m; nh = int(m * h / w + 0.5) }
      else        { nh = m; nw = int(m * w / h + 0.5) }
      if (nw < 1) nw = 1
      if (nh < 1) nh = 1
      print nw, nh
    }')"
  nw="${dims%% *}"
  nh="${dims##* }"

  if rsvg-convert -w "$nw" -h "$nh" -o "$png" "$svg"; then
    echo "converted $svg -> $png (${nw}x${nh})"
  else
    echo "failed: $svg" >&2
  fi
done
