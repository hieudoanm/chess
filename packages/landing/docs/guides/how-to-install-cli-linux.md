# How to install the chess CLI on Linux

For x86_64 Linux distributions. The multi-crate Rust chess engine CLI

## Option 1: install script (recommended)

```sh
curl -fsSL https://github.com/hieudoanm/chess/master/scripts/install.sh | bash
```

The script detects `linux/x86_64` and downloads
`cli-chess-x86_64-unknown-linux-gnu` from the
[latest release](https://github.com/hieudoanm/chess/releases/latest). It
installs to `~/.local/bin/chess` — override with `INSTALL_DIR=/path`.

## Option 2: manual download

1. Open the [downloads page](https://hieudoanm.github.io/chess/downloads/) and
   download **Linux** under **CLI** — `cli-chess-x86_64-unknown-linux-gnu`.
2. Make it executable and move it onto your `PATH`:

```sh
chmod +x cli-chess-x86_64-unknown-linux-gnu
mv cli-chess-x86_64-unknown-linux-gnu ~/.local/bin/chess
```

3. Verify:

```sh
chess --version
```

## Troubleshooting

- `chess: command not found` — ensure `~/.local/bin` is on your `PATH` (most
  distributions already include it).
- `No such file or directory` on a glibc system — the binary is built against
  glibc; on musl-based distros (Alpine) build from source instead.
