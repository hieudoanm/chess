#!/usr/bin/env bash
# Sync canonical branding SVGs into packages/landing/public/.
#
#   assets/branding/svg/logo.svg -> public/logo.svg
#   assets/branding/svg/og.svg   -> public/og.png (1200x630)
#   public/logo.svg              -> public/favicon.ico (16/32/48/256)
#
# Requires rsvg-convert (librsvg); ImageMagick (magick) for favicon.ico.
# No-op when the repo has no packages/landing/public directory.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANDING_SVG="$REPO_ROOT/assets/branding/svg"
PUBLIC_DIR="$REPO_ROOT/packages/landing/public"

if [ ! -d "$PUBLIC_DIR" ]; then
  echo "no packages/landing/public — nothing to sync"
  exit 0
fi

command -v rsvg-convert >/dev/null 2>&1 || {
  echo "rsvg-convert is required but not installed" >&2
  echo "  macOS:  brew install librsvg" >&2
  exit 1
}

mkdir -p "$PUBLIC_DIR"

if [ -f "$BRANDING_SVG/logo.svg" ]; then
  cp "$BRANDING_SVG/logo.svg" "$PUBLIC_DIR/logo.svg"
  echo "copied $BRANDING_SVG/logo.svg -> $PUBLIC_DIR/logo.svg"
fi

if [ -f "$BRANDING_SVG/og.svg" ]; then
  rsvg-convert -w 1200 -h 630 -o "$PUBLIC_DIR/og.png" "$BRANDING_SVG/og.svg"
  echo "rendered $BRANDING_SVG/og.svg -> $PUBLIC_DIR/og.png"
fi

if command -v magick >/dev/null 2>&1 && [ -f "$PUBLIC_DIR/logo.svg" ]; then
  magick -background none "$PUBLIC_DIR/logo.svg" \
    \( -clone 0 -resize 16x16 \) \
    \( -clone 0 -resize 32x32 \) \
    \( -clone 0 -resize 48x48 \) \
    \( -clone 0 -resize 256x256 \) \
    -delete 0 "$PUBLIC_DIR/favicon.ico"
  echo "rendered $PUBLIC_DIR/favicon.ico (16/32/48/256)"
elif [ -f "$PUBLIC_DIR/logo.svg" ]; then
  echo "note: 'magick' not found — favicon.ico left unchanged" >&2
fi
