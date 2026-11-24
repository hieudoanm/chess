#!/usr/bin/env bash
set -euo pipefail

BASE_URL="https://github.com/hieudoanm/chess/releases/download/latest"

ts() { date '+%Y-%m-%dT%H:%M:%S%z'; }

log()   { printf '[%s] [INFO ] %s\n' "$(ts)" "$*"; }
warn()  { printf '[%s] [WARN ] %s\n' "$(ts)" "$*" >&2; }
error() { printf '[%s] [ERROR] %s\n' "$(ts)" "$*" >&2; }
die()   { error "$*"; exit 1; }

usage() {
  cat <<'EOF'
Usage: install.sh [--cli|--firefox|--chrome|--desktop] [DEST]

  --cli        Install the chess CLI binary (default)
  --firefox    Download the MV2 extension (extension-browser-chess-unlocked-v2.xpi) for Firefox
  --chrome     Download and unpack the MV3 extension (extension-browser-chess-unlocked-v3.zip) for Chrome/Edge
  --desktop    Download the Chess desktop app installer for this platform

DEST is the install path for --cli, the download directory for --firefox and
--desktop, or the extension directory for --chrome.
EOF
  exit "${1:-0}"
}

# --- Parse arguments -------------------------------------------------------
MODE=cli
DEST=""
for arg in "$@"; do
  case "$arg" in
    --cli)     MODE=cli ;;
    --firefox) MODE=firefox ;;
    --chrome)  MODE=chrome ;;
    --desktop) MODE=desktop ;;
    -h|--help) usage 0 ;;
    --*)       die "Unknown flag: $arg" ;;
    *)         [ -z "$DEST" ] && DEST="$arg" || die "Unexpected argument: $arg" ;;
  esac
done

# --- Detect the OS ---------------------------------------------------------
case "$(uname -s)" in
  Linux*)   OS=linux ;;
  Darwin*)  OS=macos ;;
  MINGW*|MSYS*|CYGWIN*) OS=windows ;;
  *)        die "Unsupported OS: $(uname -s)" ;;
esac
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64 | amd64) ARCH="x86_64" ;;
  arm64 | aarch64) ARCH="aarch64" ;;
esac
log "Detected OS: $OS ($ARCH), mode: $MODE"

download() { # url dest
  log "Downloading $1"
  curl -fsSL --retry 3 --retry-delay 2 "$1" -o "$2"
  log "Downloaded $(wc -c < "$2" | tr -d ' ') bytes"
}

# --- CLI binary ------------------------------------------------------------
install_cli() {
  local asset
  case "$OS/$ARCH" in
    macos/arm64)   asset=cli-chess-aarch64-apple-darwin ;;
    macos/x86_64)  asset=cli-chess-x86_64-apple-darwin ;;
    macos/*)       die "No macOS/$ARCH release asset; build from source with scripts/install-local.sh" ;;
    linux/x86_64)  asset=cli-chess-x86_64-unknown-linux-gnu ;;
    linux/*)       die "No linux/$ARCH release asset; build from source with scripts/install-local.sh" ;;
    windows/*)     asset=cli-chess-x86_64-pc-windows-msvc.exe ;;
    *)             die "Unsupported platform: $OS/$ARCH" ;;
  esac
  local url="$BASE_URL/$asset"

  # Pick a writable install destination.
  local dest="$DEST"
  if [ -z "$dest" ]; then
    dest="$(command -v chess 2>/dev/null || true)"
    if [ -n "$dest" ]; then
      log "Found existing install at $dest; will overwrite"
    elif [ "$OS" = "macos" ] && [ -d "/opt/homebrew/bin" ] && [ -w "/opt/homebrew/bin" ]; then
      dest="/opt/homebrew/bin/chess"
    elif [ "$OS" = "macos" ] && [ -d "/usr/local/bin" ] && [ -w "/usr/local/bin" ]; then
      dest="/usr/local/bin/chess"
    elif [ -d "$HOME/.local/bin" ]; then
      mkdir -p "$HOME/.local/bin"
      dest="$HOME/.local/bin/chess"
    elif [ "$OS" = "windows" ]; then
      dest="$HOME/bin/chess.exe"
      mkdir -p "$HOME/bin"
    else
      die "Could not find a writable install directory; pass one explicitly."
    fi
  fi

  local dest_dir
  dest_dir="$(dirname "$dest")"
  mkdir -p "$dest_dir"
  [ -w "$dest_dir" ] || die "$dest_dir is not writable"

  local tmp
  tmp="$(mktemp)"
  trap 'rm -f "$tmp"' EXIT
  download "$url" "$tmp"

  log "Installing to $dest"
  mv "$tmp" "$dest"
  chmod +x "$dest" 2>/dev/null || true
  log "Installed chess to $dest"

  if command -v "$dest" >/dev/null 2>&1; then
    log "Verifying install: $dest --version"
    "$dest" --version || true
  else
    log "Note: $dest is not on PATH yet. Add $dest_dir to your shell's PATH."
  fi
}

# --- Firefox (MV2 .xpi) ----------------------------------------------------
install_firefox() {
  local dir="$DEST"
  [ -z "$dir" ] && dir="$HOME/Downloads"
  mkdir -p "$dir"
  download "$BASE_URL/extension-browser-chess-unlocked-v2.xpi" \
    "$dir/extension-browser-chess-unlocked-v2.xpi"
  cat <<EOF

Next steps (Firefox):
  1. Open about:debugging#/runtime/this-firefox
  2. Click "Load Temporary Add-on…" and pick:
       $dir/extension-browser-chess-unlocked-v2.xpi
  For a permanent install, the .xpi must be signed — self-hosted unsigned
  extensions are not accepted by release Firefox.
EOF
}

# --- Chrome/Edge (MV3 .zip, unpacked) --------------------------------------
install_chrome() {
  local dir="$DEST"
  [ -z "$dir" ] && dir="$HOME/.local/share/chess/chrome-extension"
  mkdir -p "$dir"
  local tmp
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  download "$BASE_URL/extension-browser-chess-unlocked-v3.zip" \
    "$tmp/extension-browser-chess-unlocked-v3.zip"
  unzip -q -o "$tmp/extension-browser-chess-unlocked-v3.zip" -d "$dir"
  log "Unpacked extension to $dir"
  cat <<EOF

Next steps (Chrome/Edge):
  1. Open chrome://extensions (or edge://extensions)
  2. Enable "Developer mode"
  3. Click "Load unpacked" and pick:
       $dir
EOF
}

# --- Desktop app -----------------------------------------------------------
install_desktop() {
  local asset
  case "$OS/$ARCH" in
    macos/arm64)   asset=desktop-chess-aarch64-apple-darwin.dmg ;;
    macos/x86_64)  asset=desktop-chess-x86_64-apple-darwin.dmg ;;
    macos/*)       die "No macOS/$ARCH desktop asset" ;;
    linux/x86_64)  asset=desktop-chess-x86_64-unknown-linux-gnu.AppImage ;;
    linux/*)       die "No linux/$ARCH desktop asset" ;;
    windows/*)     asset=desktop-chess-x86_64-pc-windows-msvc-setup.exe ;;
    *)             die "Unsupported platform: $OS/$ARCH" ;;
  esac

  local dir="$DEST"
  [ -z "$dir" ] && dir="$HOME/Downloads"
  mkdir -p "$dir"
  download "$BASE_URL/$asset" "$dir/$asset"
  cat <<EOF

Downloaded $dir/$asset

Next steps: open the installer and follow the prompts. Guides:
  https://hieudoanm.github.io/chess/docs/guides/how-to-install-desktop-macos-silicon/
  https://hieudoanm.github.io/chess/docs/guides/how-to-install-desktop-linux/
  https://hieudoanm.github.io/chess/docs/guides/how-to-install-desktop-windows/
EOF
}

case "$MODE" in
  cli)     install_cli ;;
  firefox) install_firefox ;;
  chrome)  install_chrome ;;
  desktop) install_desktop ;;
esac
