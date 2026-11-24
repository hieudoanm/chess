# How to install the chess desktop app on Linux

For 64-bit Linux distributions. The desktop app is a native Tauri application —
**Tourney**, a local tool for creating and managing chess tournaments (Swiss,
round-robin, knockout). Three package formats are published per release.

## Option 1: .deb (Debian / Ubuntu)

```sh
sudo apt install ./desktop-chess-x86_64-unknown-linux-gnu.deb
```

Download the `.deb` from the
[downloads page](https://hieudoanm.github.io/chess/downloads/) or the
[latest release](https://github.com/hieudoanm/chess/releases/latest).

## Option 2: .rpm (Fedora / RHEL / openSUSE)

```sh
sudo rpm -i desktop-chess-x86_64-unknown-linux-gnu.rpm
# or
sudo dnf install ./desktop-chess-x86_64-unknown-linux-gnu.rpm
```

## Option 3: AppImage (any distro)

1. Download `desktop-chess-x86_64-unknown-linux-gnu.AppImage`.
2. Make it executable and run it:

```sh
chmod +x desktop-chess-x86_64-unknown-linux-gnu.AppImage
./desktop-chess-x86_64-unknown-linux-gnu.AppImage
```

No installation or root access is needed. Optionally move it somewhere stable
(e.g. `~/Applications/`) and create a `.desktop` entry to launch it from your
menu.

## Notes

- On Wayland sessions the app runs through XWayland; on older GTK/WebKit setups
  you may need `libwebkit2gtk-4.1` and `libgtk-3` installed.
- Tournament data is stored locally in the app's IndexedDB — there is no account
  and nothing leaves your machine.
