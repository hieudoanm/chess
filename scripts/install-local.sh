#!/usr/bin/env bash
#
# install-local.sh — Build (if needed) and install chess from this checkout.
#
# Unlike install.sh (which downloads a prebuilt release), this script always
# installs artifacts produced by the local working tree, making it suitable
# for development and testing local changes.
#
# Usage:
#   ./scripts/install-local.sh [--cli|--firefox|--chrome] [DEST]
#   INSTALL_DIR=/usr/local/bin ./scripts/install-local.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BROWSER_DIR="$REPO_ROOT/packages/extensions/browser"

ts() { date '+%Y-%m-%dT%H:%M:%S%z'; }
log()   { printf '[%s] [INFO ] %s\n' "$(ts)" "$*"; }
warn()  { printf '[%s] [WARN ] %s\n' "$(ts)" "$*" >&2; }
error() { printf '[%s] [ERROR] %s\n' "$(ts)" "$*" >&2; }
die()   { error "$*"; exit 1; }

usage() {
  cat <<'EOF'
Usage: install-local.sh [--cli|--firefox|--chrome] [DEST]

  --cli        Build the chess CLI from source and install it (default)
  --firefox    Build the MV2 extension and install chess-unlocked-v2.xpi for Firefox
  --chrome     Build the MV3 extension and unpack chess-unlocked-v3.zip for Chrome/Edge

DEST is the install path for --cli, the download directory for --firefox, or
the extension directory for --chrome.
EOF
  exit "${1:-0}"
}

# --- Parse arguments -------------------------------------------------------
MODE=cli
DEST=""
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
for arg in "$@"; do
  case "$arg" in
    --cli)     MODE=cli ;;
    --firefox) MODE=firefox ;;
    --chrome)  MODE=chrome ;;
    -h|--help) usage 0 ;;
    --*)       die "Unknown flag: $arg" ;;
    *)         [ -z "$DEST" ] && DEST="$arg" || die "Unexpected argument: $arg" ;;
  esac
done

# --- Detect platform ---------------------------------------------------------
OS="$(uname -s)"
ARCH="$(uname -m)"
case "$ARCH" in
    x86_64 | amd64) ARCH="x86_64" ;;
    arm64 | aarch64) ARCH="aarch64" ;;
esac
OS_LOWER="$(echo "$OS" | tr '[:upper:]' '[:lower:]')"
echo "Detected platform: ${OS_LOWER}-${ARCH}, mode: ${MODE}"

case "$OS_LOWER" in
    darwin | linux) ;;
    *)
        echo "warning: untested platform '${OS}'; continuing anyway" >&2
        ;;
esac

# --- CLI ---------------------------------------------------------------------
install_cli() {
    local binary="$REPO_ROOT/target/release/chess"

    # --- Ensure a fresh release build exists ---------------------------------
    needs_build=0
    if [[ ! -x "$binary" ]]; then
        needs_build=1
        echo "No release build found at target/release/chess"
    elif [[ Cargo.toml -nt "$binary" || Cargo.lock -nt "$binary" ]] \
        || [[ -n "$(find crates -type f -name '*.rs' -newer "$binary" -print -quit 2>/dev/null)" ]]; then
        needs_build=1
        echo "Release build is stale (sources changed since last build)"
    fi

    if [[ "$needs_build" -eq 1 ]]; then
        command -v cargo >/dev/null 2>&1 || \
            die "cargo not found; install the Rust toolchain from https://rustup.rs"
        echo "Building release binary (this may take a while)..."
        (cd "$REPO_ROOT" && cargo build --release -p chess-cli)
    fi

    [[ -x "$binary" ]] || die "build finished but $binary is missing"

    # --- Install (always overwrite: force fresh install) ----------------------
    mkdir -p "$INSTALL_DIR"
    install -m 0755 "$binary" "$INSTALL_DIR/chess"
    echo "Installed chess to $INSTALL_DIR/chess"

    # A different `chess` earlier on PATH would shadow this install. Warn
    # instead of silently installing a binary the user cannot reach.
    if command -v chess >/dev/null 2>&1; then
        resolved="$(command -v chess)"
        if [[ "$resolved" != "$INSTALL_DIR/chess" ]]; then
            echo "warning: \`chess\` currently resolves to $resolved, not $INSTALL_DIR/chess" >&2
            echo "         reinstall with a directory earlier on PATH, e.g.:" >&2
            echo "           INSTALL_DIR=\$HOME/bin ./scripts/install-local.sh" >&2
        fi
    else
        case ":$PATH:" in
            *":$INSTALL_DIR:"*) ;;
            *)
                echo "warning: $INSTALL_DIR is not on PATH; add it or invoke $INSTALL_DIR/chess directly" >&2
                ;;
        esac
    fi

    "$INSTALL_DIR/chess" --help >/dev/null
}

# --- Browser extension --------------------------------------------------------
build_extension() {
    command -v pnpm >/dev/null 2>&1 || die "pnpm not found; install pnpm 12+"
    command -v make >/dev/null 2>&1 || die "make not found"
    log "Installing workspace dependencies (if needed)"
    (cd "$REPO_ROOT" && pnpm install --frozen-lockfile)
    log "Building extension package (vite + dist + artifacts)"
    (cd "$BROWSER_DIR" && make package)
    local xpi="$BROWSER_DIR/download/chess-unlocked-v2.xpi"
    local zip="$BROWSER_DIR/download/chess-unlocked-v3.zip"
    [[ -f "$xpi" ]] || die "Expected $xpi after make package"
    [[ -f "$zip" ]] || die "Expected $zip after make package"
}

install_firefox() {
    build_extension
    local dir="$DEST"
    [ -z "$dir" ] && dir="$HOME/Downloads"
    mkdir -p "$dir"
    cp "$BROWSER_DIR/download/chess-unlocked-v2.xpi" "$dir/chess-unlocked-v2.xpi"
    log "Installed $dir/chess-unlocked-v2.xpi"
    cat <<EOF

Next steps (Firefox):
  1. Open about:debugging#/runtime/this-firefox
  2. Click "Load Temporary Add-on…" and pick:
       $dir/chess-unlocked-v2.xpi
EOF
}

install_chrome() {
    build_extension
    local dir="$DEST"
    [ -z "$dir" ] && dir="$HOME/.local/share/chess/chrome-extension"
    mkdir -p "$dir"
    unzip -q -o "$BROWSER_DIR/download/chess-unlocked-v3.zip" -d "$dir"
    log "Unpacked extension to $dir"
    cat <<EOF

Next steps (Chrome/Edge):
  1. Open chrome://extensions (or edge://extensions)
  2. Enable "Developer mode"
  3. Click "Load unpacked" and pick:
       $dir
EOF
}

case "$MODE" in
    cli)     install_cli ;;
    firefox) install_firefox ;;
    chrome)  install_chrome ;;
esac
