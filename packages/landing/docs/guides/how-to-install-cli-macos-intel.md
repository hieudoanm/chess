# How to install the chess CLI on macOS (Intel)

For Intel-based Macs. The multi-crate Rust chess engine CLI

## Option 1: install script (recommended)

```sh
curl -fsSL https://github.com/hieudoanm/chess/master/scripts/install.sh | bash
```

The script detects `macos/x86_64` and downloads `cli-chess-x86_64-apple-darwin`
from the [latest release](https://github.com/hieudoanm/chess/releases/latest).
It installs to `~/.local/bin/chess` — override with `INSTALL_DIR=/path`.

## Option 2: manual download

1. Open the [downloads page](https://hieudoanm.github.io/chess/downloads/) and
   download **macOS (Intel)** under **CLI** — `cli-chess-x86_64-apple-darwin`.
2. Make it executable and move it onto your `PATH`:

```sh
chmod +x cli-chess-x86_64-apple-darwin
mv cli-chess-x86_64-apple-darwin ~/.local/bin/chess
```

3. Verify:

```sh
chess --version
```

## Troubleshooting

- `chess: command not found` — the install directory is not on your `PATH`. Add
  `export PATH="$HOME/.local/bin:$PATH"` to your shell profile.
- Gatekeeper warning — the binary is unsigned. Right-click → Open, or run
  `xattr -d com.apple.quarantine` on the installed binary.
