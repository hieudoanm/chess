# Tourney

> A minimal Swiss-manager tournament organizer that runs everywhere — phone,
> tablet, laptop, and desktop. Create brackets, track standings, and manage
> matches from any screen.

![Android 14+](https://img.shields.io/badge/Android-14%2B-green)
![Linux](https://img.shields.io/badge/Linux-22.04%2B-blue)
![macOS](https://img.shields.io/badge/macOS-13%2B-lightgrey)
![Windows](https://img.shields.io/badge/Windows-10%2B-blue)

![tourney screenshot](https://raw.githubusercontent.com/hieudoanm/hieudoanm.github.io/refs/heads/master/packages/app/hybrid/shopping/store/public/screenshots/tourney/home.png)

---

## Latest release

- **Version:** `app-hybrid-sports-tourney-latest` — updates ship continuously.
- **What's new:** see the [roadmap](ROADMAP) and [CONTRIBUTING](CONTRIBUTING).

---

## Installation

Pick the file that matches your platform and install directly.

### Downloads

| No  | Platform | Distro | Architecture | Requirements | Download Link                              | Note             |
| --- | -------- | ------ | ------------ | ------------ | ------------------------------------------ | ---------------- |
| 1   | Android  |        | Universal    | 14.+         | [Download `.apk`][download-apk]            | Install directly |
| 2   | Android  |        | Universal    | 14.+         | [Download `.aab`][download-aab]¹           | For store upload |
| 3   | Linux    | Ubuntu | amd64        | 22.04.+      | [Download `.AppImage`][download-app-image] | Run — no install |
| 4   | Linux    | Fedora | amd64        | 40.+         | [Download `.rpm`][download-rpm]            |                  |
| 5   | Linux    | Debian | amd64        | 13.+         | [Download `.deb`][download-deb]            |                  |
| 6   | macOS    |        | aarch64      | 13.+         | [Download `.dmg`][download-dmg]²           | Apple Silicon    |
| 7   | Windows  |        | x64          | 10.+         | [Download `.msi`][download-msi]            |                  |
| 8   | Windows  |        | x64          | 10.+         | [Download `.exe`][download-exe]            | Portable         |

[download-apk]:
  https://github.com/hieudoanm/hieudoanm.github.io/releases/download/app-hybrid-sports-tourney-latest/tourney.apk
[download-aab]:
  https://github.com/hieudoanm/hieudoanm.github.io/releases/download/app-hybrid-sports-tourney-latest/tourney.aab
[download-app-image]:
  https://github.com/hieudoanm/hieudoanm.github.io/releases/download/app-hybrid-sports-tourney-latest/tourney.AppImage
[download-deb]:
  https://github.com/hieudoanm/hieudoanm.github.io/releases/download/app-hybrid-sports-tourney-latest/tourney.deb
[download-rpm]:
  https://github.com/hieudoanm/hieudoanm.github.io/releases/download/app-hybrid-sports-tourney-latest/tourney.rpm
[download-dmg]:
  https://github.com/hieudoanm/hieudoanm.github.io/releases/download/app-hybrid-sports-tourney-latest/tourney.dmg
[download-msi]:
  https://github.com/hieudoanm/hieudoanm.github.io/releases/download/app-hybrid-sports-tourney-latest/tourney.msi
[download-exe]:
  https://github.com/hieudoanm/hieudoanm.github.io/releases/download/app-hybrid-sports-tourney-latest/tourney.exe

¹ The `.aab` bundle is used when submitting to the Google Play Store; install
the `.apk` directly on devices instead. ² The `.dmg` is built for Apple Silicon
(M-series) Macs.

### Checksums

> 🛡️ **Verify your download.** Every asset is published with a SHA-256 digest so
> you can confirm the file you got is exactly the file we shipped. See
> [SHA256SUMS.txt][checksums].

[checksums]:
  https://github.com/hieudoanm/hieudoanm.github.io/releases/download/app-hybrid-sports-tourney-latest/SHA256SUMS.txt

### Build from Source

Prefer to build it yourself? Clone, install, and build in three steps:

```bash
git clone https://github.com/hieudoanm/hieudoanm.github.io.git
cd packages/app/hybrid/sports/tourney
pnpm install
pnpm tauri build
```

See [PACKAGING](PACKAGING) for per-platform build checklists and
[CONTRIBUTING](CONTRIBUTING) for setup and dev commands.

---

## About

A tournament organizer packed with every bracket format you can think of.

- **Swiss** — Swiss System pairing, round by round.
- **Elimination** — single or double elimination brackets.
- **Round-robin** — where every participant meets every other.

Running natively on every device you own.

---

## Features

### 🏗️ Foundation

- Project setup (Next.js, TypeScript, Tailwind, DaisyUI)
- IndexedDB data layer (tournaments, participants, matches)
- Dashboard page with tournament list
- Create tournament form (name, format, dates)
- Tournament detail page (overview tab)
- Basic navigation (bottom nav, breadcrumbs)
- Settings page with theme switcher
- Profile page (local stats, no auth)
- Version page

### 🏆 Formats

- Single Elimination bracket generation
- Double Elimination bracket generation
- Round Robin schedule generation
- Swiss System pairing algorithm
- Group Stage + Knockout flow
- Automatic group-to-knockout advancement (top 2 per group via standings)
- League standings calculation
- Format-specific tournament detail views
- Interactive bracket component
- Match detail page with score entry
- Bracket navigation (rounds, matches)
- Auto-advance winners
- Best-of-N matches (bo3/bo5) with set-by-set score entry
- Sets-based match scoring (2-0 / 2-1) and penalty-shootout decisions
- Walkover / forfeit handling (advance opponent, blank scores)
- Third-place play-off (single elimination, group-stage knockout)
- Points calculation per format
- Tiebreaker priority list configurable per tournament (points, wins, goal
  difference, head-to-head, points scored)

### 📅 Scheduling

- Match scheduling with calendar view
- Reschedule matches (drag-and-drop)
- Smart scheduling (minimize conflicts)

### 📊 Standings & Stats

- Standings table component
- Live standings updates
- Historical standings snapshots
- Participant stats (wins, losses, draws)
- Leaderboard across tournaments
- Predictive standings (simulate remaining matches)
- Tournament analytics (average match duration, upsets)

### 👥 Participants

- Participant registration flow (no account needed)
- Seeding system (manual, rating-based, random)
- Group assignment for Group Stage
- Team/player profiles
- Batch import participants (CSV)

### 📋 Templates & Sharing

- Tournament templates (save/load configurations)
- Tournament cloning
- Export tournaments to CSV (participants, matches, standings)
- Export tournaments to SQLite database
- Import from CSV (participants, matches)
- Full backup/restore (all data as JSON)
- Share tournament as portable file
- Bracket export (PNG, PDF)

### 🖥️ Platform

- Tauri desktop app
- PWA support (installable, offline-first)

---

## Next steps

- Want to contribute? Check the [CONTRIBUTING](CONTRIBUTING) guide.
- Curious what's coming? See the [roadmap](ROADMAP).

---

## License

See [LICENSE](LICENSE).

# Tourney — Packaging Checklist

Checklist for shipping Tourney to users: macOS notarization, Windows
code-signing, Android/iOS store builds, and the Tauri updater pipeline.

App: `tourney` (bundle identifier `io.github.hieudoanm.tourney`, version 0.0.1).

## Common

- [ ] Bump `version` in `src-tauri/tauri.conf.json` and `package.json` in sync
- [ ] Run `pnpm tauri build` (desktop) and `pnpm tauri android build` /
      `pnpm tauri ios build` (mobile) and confirm artifacts appear under
      `src-tauri/target/`
- [ ] Smoke-test the exported web build (`out/`) and the native apps
- [ ] Regenerate `docs/ROADMAP.md` release notes for the tag

## Auto-update (desktop)

> Auto-update is **not yet configured** for this app. The Tauri updater plugin
> is not registered and `plugins.updater` is absent from
> `src-tauri/tauri.conf.json`. Follow the checklist below.

- [ ] Add `tauri-plugin-updater` (Rust) + `@tauri-apps/plugin-updater` (JS) and
      register the plugin in `src-tauri/src/lib.rs`
- [ ] Generate a signing key pair:
      `pnpm tauri signer generate --ci -p <password> -w <path>`
- [ ] Set `plugins.updater.pubkey` and `plugins.updater.endpoints` in
      `src-tauri/tauri.conf.json`
- [ ] Endpoint to publish to:
      `https://github.com/hieudoanm/hieudoanm.github.io/releases/download/app-hybrid-tourney-latest/latest.json`
- [ ] Set `bundle.createUpdaterArtifacts: true` so `.sig` + updater bundles are
      produced by `tauri build`
- [ ] Publish the updater JSON + artifacts to the configured endpoint
- [ ] Add `updater:default` (and `dialog:default`) to
      `src-tauri/capabilities/default.json` for the JS API
- [ ] CI provides the private key via environment variables:
  - `TAURI_SIGNING_PRIVATE_KEY` or `TAURI_SIGNING_PRIVATE_KEY_PATH`
  - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
  - Keep the private key out of the repo (dev-machine path only)

## macOS

- [ ] Developer ID Application certificate installed in the signing keychain
- [ ] Notarization configured:
  - `APPLE_ID`, `APPLE_PASSWORD`/`APPLE_APP_SPECIFIC_PASSWORD`, and
    `APPLE_TEAM_ID` set for `tauri-apple-signing` / CI
- [ ] `bundle.macOS.dmg` settings produce a DMG that mounts and copies to
      Applications
- [ ] Verify Gatekeeper: `spctl --assess --type execute` on the `.app` passes
      after notarization
- [ ] Confirm updater signatures verify against `plugins.updater.pubkey` once
      the updater is configured

## Windows

- [ ] Code-signing certificate (e.g. EV cert) installed and password available
- [ ] `tauri.conf.json` `bundle.windows.certificateThumbprint` / signing tools
      configured (or `tauri-action` `signingCertificate`/`certificatePassword`)
- [ ] Installer (MSI/NSIS) runs without SmartScreen warning on a clean VM
- [ ] Updater NSIS `installMode: passive` installs on quit without a UAC prompt
      churn

## Android

- [ ] Upload keystore generated and stored in CI secrets (never in repo)
- [ ] `tauri.conf.json` `bundle.android` keystore configured via env vars:
      `TAURI_ANDROID_KEYSTORE_PATH`, `TAURI_ANDROID_KEYSTORE_PASSWORD`,
      `TAURI_ANDROID_KEY_ALIAS`, `TAURI_ANDROID_KEY_PASSWORD`
- [ ] `pnpm tauri android build --target apk --target aab` produces a signed
      APK + AAB for Play Store
- [ ] Play Store listing assets (icons, screenshots, privacy policy) prepared
- [ ] Content URI handling verified: file import via camera/gallery works

## iOS

- [ ] Apple Developer account + App Store Connect app record created
- [ ] Signing team + provisioning profile set for the `tourney` Xcode project
      under `src-tauri/gen/apple/`
- [ ] `pnpm tauri ios build` produces an archive; upload via Xcode/Transporter
- [ ] Review App Privacy questionnaire entries (no analytics SDKs)
