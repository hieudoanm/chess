# UCI protocol

`chess uci` puts the engine in UCI mode: it reads commands from stdin and
writes responses to stdout, so GUIs and scripts can drive it like any other
UCI engine.

## Commands

| Command | Meaning |
| --- | --- |
| `uci` | Identify the engine |
| `isready` | Synchronisation ping |
| `ucinewgame` | Reset game state |
| `position startpos` | Set the starting position |
| `position fen <fen>` | Set a position from FEN |
| `position ... moves ...` | Append moves to the position |
| `go depth <N>` | Search to depth N |
| `stop` | Stop searching |
| `quit` | Exit |

## Example session

```text
$ chess uci
uci
id name chess
isready
readyok
position startpos
position startpos moves e2e4 e7e5
go depth 3
bestmove <move>
quit
```
