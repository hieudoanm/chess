# How to install the Chess Unlocked browser extension (Chromium)

The **v3** build is Manifest V3 and works in Chrome, Edge, Brave, Arc and other
Chromium browsers — and in Firefox 109+.

Chess Unlocked adds Lichess.org alternatives to Chess.com's premium features
(puzzles, game review, opening explorer, insights) directly inside the Chess.com
interface.

## Option 1: install script (recommended)

```sh
curl -fsSL https://github.com/hieudoanm/chess/raw/master/scripts/install.sh | bash -s -- --chrome
```

The script downloads `extension-browser-chess-unlocked-v3.zip`, extracts it to
`~/.local/share/chess/chrome-extension`, and prints the load steps.

## Option 2: manual download

1. Open the [downloads page](https://hieudoanm.github.io/chess/downloads/) and
   download **Chrome** under **Browser Extension** — either:
   - `extension-browser-chess-unlocked-v3.crx` — packed extension, or
   - `extension-browser-chess-unlocked-v3.zip` — unpacked source.

## Loading the extension

### From the `.zip` (unpacked — recommended for development)

1. Unzip `extension-browser-chess-unlocked-v3.zip` to a permanent folder.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the unzipped folder.

### From the `.crx`

Drag `extension-browser-chess-unlocked-v3.crx` onto `chrome://extensions`.
Chromium may warn about unsigned extensions — choose **Keep** if prompted.

## Using it

Visit a supported Chess.com page (puzzles, puzzle rush/battle, opening explorer,
endgame practice, game review, stats) and look for the injected **Lichess …**
links next to the matching Chess.com features. Configure toggles, link behaviour
and PGN/FEN transfer in the extension's options page.

## Troubleshooting

- Extension missing after reload — unpacked extensions live where you extracted
  them; do not delete that folder.
- No Lichess links on a page — Chess.com changes its markup often; selectors
  live in `src/content/dom/selectors.ts` of the extension source and may need
  updating for the current Chess.com build.
