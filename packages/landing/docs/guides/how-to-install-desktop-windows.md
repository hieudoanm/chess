# How to install the chess desktop app on Windows

For 64-bit Windows 10/11. The desktop app is a native Tauri application —
**Tourney**, a local tool for creating and managing chess tournaments (Swiss,
round-robin, knockout). Two installers are published per release.

## Option 1: MSI installer (recommended)

1. Download `desktop-chess-x86_64-pc-windows-msvc.msi` from the
   [downloads page](https://hieudoanm.github.io/chess/downloads/) or the
   [latest release](https://github.com/hieudoanm/chess/releases/latest).
2. Double-click the `.msi` and follow the wizard — it installs for the current
   user without admin rights.
3. Launch **Tourney** from the Start menu.

## Option 2: NSIS setup (.exe)

1. Download `desktop-chess-x86_64-pc-windows-msvc-setup.exe`.
2. Run it and follow the installer prompts.

## SmartScreen

The installer is unsigned, so Windows SmartScreen may warn **"Windows protected
your PC"**. Click **More info → Run anyway**.

## Notes

- Tournament data is stored locally in the app's IndexedDB — there is no account
  and nothing leaves your machine.
- To update, run the new installer over the existing installation.
