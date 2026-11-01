.PHONY: all build test run clean fmt clippy check release play board moves bench train-nnue

CARGO := cargo

all: build

build:
	$(CARGO) build

release:
	$(CARGO) build --release

test:
	$(CARGO) test

check:
	$(CARGO) check

fmt:
	$(CARGO) fmt

clippy:
	$(CARGO) clippy --all-targets -- -D warnings

clean:
	$(CARGO) clean

run:
	$(CARGO) run -p chess-cli

board:
	$(CARGO) run -p chess-cli -- board

moves:
	$(CARGO) run -p chess-cli -- moves

play:
	$(CARGO) run -p chess-cli -- play --depth 3

play-deep:
	$(CARGO) run -p chess-cli -- play --depth 5

uci:
	$(CARGO) run -p chess-cli -- uci

mcp:
	$(CARGO) run -p chess-cli -- mcp

bench:
	$(CARGO) run -p chess-cli -- bench

train-nnue:
	$(CARGO) run -p nnue-train -- crates/games/pgn

ci: fmt clippy test build
