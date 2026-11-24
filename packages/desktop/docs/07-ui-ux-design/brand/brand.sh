#!/usr/bin/env bash
#
# Rasterise the SML brand SVGs to PNG.
#
# Reads every *.svg in svg/ and writes the matching *.png in images/.
# The SVG files are the source of truth; never edit the PNGs by hand.
#
# Usage:
#   ./docs/07-ui-ux-design/brand/brand.sh [width]
#
# Arguments:
#   width   Output width in pixels (default: 1024). Height scales to keep
#           the aspect ratio.
#
# Examples:
#   ./brand.sh          # render every mark at 1024px wide
#   ./brand.sh 512      # render every mark at 512px wide

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
svg_dir="${script_dir}/svg"
png_dir="${script_dir}/images"
width="${1:-1024}"

if ! [[ "${width}" =~ ^[0-9]+$ ]] || [ "${width}" -le 0 ]; then
  echo "error: width must be a positive integer (got '${width}')" >&2
  exit 1
fi

if command -v rsvg-convert >/dev/null 2>&1; then
  rasterise() { rsvg-convert --width "${width}" --output "$2" "$3"; }
elif command -v inkscape >/dev/null 2>&1; then
  rasterise() {
    inkscape "$3" --export-type=png --export-width="${width}" --export-filename="$2" >/dev/null 2>&1
  }
elif command -v cairosvg >/dev/null 2>&1; then
  rasterise() { cairosvg "$3" --output-width "${width}" --output "$2"; }
elif command -v magick >/dev/null 2>&1; then
  rasterise() { magick -background none -density 384 "$3" -resize "${width}x" "$2"; }
else
  echo "error: no SVG rasteriser found (need rsvg-convert, inkscape, cairosvg, or magick)" >&2
  exit 1
fi

mkdir -p "${png_dir}"

shopt -s nullglob
svgs=("${svg_dir}"/*.svg)

if [ ${#svgs[@]} -eq 0 ]; then
  echo "error: no SVG files found in ${svg_dir}" >&2
  exit 1
fi

for svg in "${svgs[@]}"; do
  name="$(basename "${svg}" .svg)"
  out="${png_dir}/${name}.png"
  rasterise "${width}" "${out}" "${svg}"
  echo "rendered ${out#${script_dir}/}"
done

echo "done: ${#svgs[@]} file(s) at ${width}px wide in ${png_dir#${script_dir}/}/"
