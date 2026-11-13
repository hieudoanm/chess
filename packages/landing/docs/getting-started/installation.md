# Installation

## One-command install

Downloads a prebuilt binary for your platform, or builds from source with
Cargo when no prebuilt artifact matches:

```bash
curl -fsSL https://raw.githubusercontent.com/hieudoanm/chess/master/scripts/install.sh | sh
```

The binary is installed to `~/.local/bin` by default; override with
`INSTALL_DIR`.

## From source

```bash
cargo build --release
```

The binary lands at `target/release/chess`.

## From a local checkout

```bash
./scripts/install-local.sh
```

## Requirements

- Rust stable toolchain (for source builds)
- Nothing else — the engine is a single static binary with no runtime dependencies.
