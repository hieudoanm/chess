# How to install the Chess Unlocked browser extension (Firefox / Gecko)

The **v2** build is Manifest V2 for Firefox (and legacy Chrome). Firefox ≥109
can also use the v3 build — see the
[Chromium page](./how-to-install-extension-chromium.md).

Chess Unlocked adds Lichess.org alternatives to Chess.com's premium features
(puzzles, game review, opening explorer, insights) directly inside the Chess.com
interface.

## Option 1: install script (recommended)

```sh
curl -fsSL https://github.com/hieudoanm/chess/raw/master/scripts/install.sh | bash -s -- --firefox
```

The script downloads `extension-browser-chess-unlocked-v2.xpi` into the current
directory (or the `DEST` argument) and prints the load steps.

## Option 2: manual download

1. Open the [downloads page](https://hieudoanm.github.io/chess/downloads/) and
   download **Firefox** under **Browser Extension** — either:
   - `extension-browser-chess-unlocked-v2.xpi` — ready-to-load package, or
   - `extension-browser-chess-unlocked-v2.zip` — unpacked source.

## Loading the extension

### From the `.xpi`

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and pick the `.xpi`.

Temporary add-ons are removed when Firefox restarts. For a permanent install,
the `.xpi` must be **signed** — self-hosted unsigned extensions are not accepted
by release Firefox.

### From the `.zip` (development)

Unzip `extension-browser-chess-unlocked-v2.zip`, then in `about:debugging`
choose **Load Temporary Add-on…** and pick the `manifest.json` inside the folder
— or load it temporarily from `about:debugging` each session.

## Using it

Visit a supported Chess.com page (puzzles, puzzle rush/battle, opening explorer,
endgame practice, game review, stats) and look for the injected **Lichess …**
links next to the matching Chess.com features. Configure toggles, link behaviour
and PGN/FEN transfer in the extension's options page.

## Troubleshooting

- Add-on disappears after restart — expected for unsigned temporary add-ons;
  re-load it from `about:debugging`.
- No Lichess links on a page — Chess.com changes its markup often; selectors
  live in `src/content/dom/selectors.ts` of the extension source and may need
  updating for the current Chess.com build.
