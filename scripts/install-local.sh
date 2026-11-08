#!/usr/bin/env bash
#
# install-local.sh — Build (if needed) and install chess from this checkout.
#
# Unlike install.sh (which downloads a prebuilt release), this script always
# installs the binary produced by the local working tree, making it suitable
# for development and testing local changes.
#
# Usage:
#   ./scripts/install-local.sh
#   INSTALL_DIR=/usr/local/bin ./scripts/install-local.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

BINARY="$REPO_ROOT/target/release/chess"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"

# --- Detect platform ---------------------------------------------------------
OS="$(uname -s)"
ARCH="$(uname -m)"
case "$ARCH" in
    x86_64 | amd64) ARCH="x86_64" ;;
    arm64 | aarch64) ARCH="aarch64" ;;
esac
OS_LOWER="$(echo "$OS" | tr '[:upper:]' '[:lower:]')"
echo "Detected platform: ${OS_LOWER}-${ARCH}"

case "$OS_LOWER" in
    darwin | linux) ;;
    *)
        echo "warning: untested platform '${OS}'; continuing anyway" >&2
        ;;
esac

# --- Ensure a fresh release build exists -------------------------------------
needs_build=0
if [[ ! -x "$BINARY" ]]; then
    needs_build=1
    echo "No release build found at target/release/chess"
elif [[ Cargo.toml -nt "$BINARY" || Cargo.lock -nt "$BINARY" ]] \
    || [[ -n "$(find crates -type f -name '*.rs' -newer "$BINARY" -print -quit 2>/dev/null)" ]]; then
    needs_build=1
    echo "Release build is stale (sources changed since last build)"
fi

if [[ "$needs_build" -eq 1 ]]; then
    if ! command -v cargo >/dev/null 2>&1; then
        echo "error: cargo not found; install the Rust toolchain from https://rustup.rs" >&2
        exit 1
    fi
    echo "Building release binary (this may take a while)..."
    cargo build --release -p chess-cli
fi

if [[ ! -x "$BINARY" ]]; then
    echo "error: build finished but $BINARY is missing" >&2
    exit 1
fi

# --- Install (always overwrite: force fresh install) --------------------------
mkdir -p "$INSTALL_DIR"
install -m 0755 "$BINARY" "$INSTALL_DIR/chess"
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
