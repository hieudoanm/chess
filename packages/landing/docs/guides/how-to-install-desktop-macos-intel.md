# How to install the chess desktop app on macOS (Intel)

For Intel-based Macs. The desktop app is a native Tauri application —
**Tourney**, a local tool for creating and managing chess tournaments (Swiss,
round-robin, knockout).

## Option 1: disk image (.dmg)

1. Open the [downloads page](https://hieudoanm.github.io/chess/downloads/) and
   download **Desktop → macOS (Intel) → .dmg** —
   `desktop-chess-x86_64-apple-darwin.dmg`.
2. Open the `.dmg`, drag **Tourney** into **Applications**.
3. Launch it from Applications (or Spotlight).

## Option 2: zipped app (.app.zip)

1. Download `desktop-chess-x86_64-apple-darwin.app.zip` from the
   [latest release](https://github.com/hieudoanm/chess/releases/latest).
2. Unzip it and move **Tourney.app** into **Applications**.

## Gatekeeper

The app is unsigned, so the first launch may be blocked:

- Right-click **Tourney** → **Open** → **Open** in the dialog, or
- Run `xattr -dr com.apple.quarantine /Applications/Tourney.app` in Terminal.

## Notes

- Tournament data is stored locally in the app's IndexedDB — there is no account
  and nothing leaves your machine.
- To update, download the new `.dmg`/`.app.zip` and replace the app in
  Applications.
