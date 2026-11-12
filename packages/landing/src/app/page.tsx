import type { Metadata, NextPage } from 'next';
import type { FC } from 'react';
import CTA from '@/components/molecules/CTA';
import Features, { type Feature } from '@/components/molecules/Features';
import Hero from '@/components/molecules/Hero';
import SectionHead from '@/components/molecules/SectionHead';
import Terminal from '@/components/molecules/Terminal';
import { LuBrain, LuBot, LuGitBranch, LuTerminal, LuZap } from 'react-icons/lu';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const GITHUB = 'https://github.com/hieudoanm/chess';

const FEATURES: Feature[] = [
  {
    icon: LuTerminal,
    title: 'UCI compatible',
    body: 'Speaks the standard UCI protocol — plug it into any GUI or GUI-compatible tool. Supports position setup from FEN or move lists, depth and time controls, and ponder.',
  },
  {
    icon: LuGitBranch,
    title: 'Alpha-beta search',
    body: 'Negamax with alpha-beta pruning and a transposition table — iterative deepening over a fully legal move generator.',
  },
  {
    icon: LuBrain,
    title: 'NNUE evaluation',
    body: 'Neural network evaluation with an incrementally updated accumulator — refreshed only for the pieces that moved, not the whole board.',
  },
  {
    icon: LuBot,
    title: 'MCP server',
    body: 'Built-in Model Context Protocol server over stdio JSON-RPC — tools for new games, board state, legal moves, and best-move queries for AI agents.',
  },
  {
    icon: LuTerminal,
    title: 'Scriptable CLI',
    body: 'chess play for interactive games, chess moves and chess board for position inspection, chess bench for perft benchmarks, chess fen for FEN export.',
  },
  {
    icon: LuZap,
    title: 'Fast & lean',
    body: 'No runtime dependencies, no daemon, no account. A single static binary that searches millions of nodes per second.',
  },
];

const HERO_LINES = [
  '$ chess uci',
  'id name chess',
  'uciok',
  'position startpos moves e2e4 e7e5',
  'go depth 3',
  'bestmove g1f3',
];

const DEMO_TERMINALS: { caption: string; lines: string[]; wide?: boolean }[] = [
  {
    caption: 'UCI session',
    wide: true,
    lines: [
      '$ chess uci',
      'uci',
      'id name chess',
      'id author Kilo',
      'uciok',
      'position startpos moves e2e4 e7e5',
      'go depth 3',
      'bestmove g1f3',
    ],
  },
  {
    caption: 'Inspect the position',
    lines: [
      '$ chess board',
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      '$ chess moves | head -4',
      'b1c3',
      'b1a3',
      'g1h3',
      'g1f3',
    ],
  },
  {
    caption: 'Benchmark move generation',
    lines: [
      '$ chess bench',
      'depth 1: 20 nodes (1506.25 ns/node) OK (expected 20)',
      'depth 2: 400 nodes (200.52 ns/node) OK (expected 400)',
      'depth 3: 8902 nodes (129.37 ns/node) OK (expected 8902)',
      'depth 4: 197281 nodes (181.92 ns/node) OK (expected 197281)',
      'depth 5: 4865609 nodes (111.67 ns/node) OK (expected 4865609)',
      'total: 5072212 nodes in 0.58s = 8737744 nps',
    ],
  },
];

const STEPS = [
  {
    title: 'Generate',
    body: 'chess-core produces every pseudo-legal move — including castling, en passant, and promotions — then filters out any move that leaves its own king in check.',
    snippet: 'chess moves',
  },
  {
    title: 'Evaluate',
    body: "chess-core's NNUE network scores positions through an incrementally maintained accumulator — only changed feature weights are refreshed per move.",
    snippet: 'nnue_weights.bin',
  },
  {
    title: 'Search',
    body: 'chess-engine runs negamax with alpha-beta pruning and a transposition table, returning the best move over UCI or the interactive CLI.',
    snippet: 'chess uci → bestmove g1f3',
  },
];

const INSTALL_LINES = [
  '$ ./scripts/install.sh',
  'chess installed to ~/.local/bin/chess',
  '$ chess uci',
  'id name chess',
  'uciok',
  '$ chess bench',
  'total: 5072212 nodes in 0.58s = 8737744 nps',
];

const StepCard: FC<{ step: (typeof STEPS)[number]; index: number }> = ({
  step,
  index,
}) => (
  <article className="card border-base-300 bg-base-100 rounded-2xl border p-6">
    <span className="text-accent mb-2 block font-mono text-sm font-semibold">
      {String(index + 1).padStart(2, '0')}
    </span>
    <h3 className="text-base-content m-0 mb-2 text-lg font-bold">
      {step.title}
    </h3>
    <p className="text-base-content/60 text-sm">{step.body}</p>
    <code className="border-base-300 bg-base-200 text-base-content/60 mt-4 block overflow-x-auto rounded-lg border px-3 py-2 font-mono text-xs">
      {step.snippet}
    </code>
  </article>
);

const HomePage: NextPage = () => (
  <main>
    <Hero
      title="Checkmate, computed locally."
      description="chess is a UCI-compatible engine with negamax alpha-beta search, incremental NNUE evaluation, and a transposition table — plus an MCP server so AI assistants can play and analyze games. One Rust binary, no runtime dependencies."
      primary={{ label: 'Get started', href: '#install' }}
      secondary={{ label: 'See it in action', href: '#demo' }}
      stats={[
        { value: '~9M', label: 'nodes searched per second' },
        { value: 'UCI + MCP', label: 'GUI and agent interfaces' },
        { value: 'perft-tested', label: 'verified move generation' },
      ]}>
      <Terminal caption="UCI session" lines={HERO_LINES} />
    </Hero>

    <Features
      title="Features"
      description="A complete engine in a single binary — search, evaluation, and interfaces, all local and deterministic."
      features={FEATURES}
    />

    <section id="demo" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-5">
        <SectionHead
          title="See it in action"
          description="Drive the engine over UCI, inspect positions from the shell, or benchmark move generation with perft."
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {DEMO_TERMINALS.map((t) => (
            <Terminal
              key={t.caption}
              caption={t.caption}
              lines={t.lines}
              className={t.wide ? 'lg:col-span-2' : ''}
            />
          ))}
        </div>
      </div>
    </section>

    <section id="how-it-works" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-5">
        <SectionHead
          title="How it works"
          description="Generate, evaluate, search — a tight loop over a fully legal move generator, with NNUE doing the positional heavy lifting."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>

    <section id="install" className="bg-base-200 py-20">
      <div className="mx-auto w-full max-w-3xl px-5">
        <SectionHead
          title="Get started"
          description="Install a prebuilt binary or build from source with Cargo. Rust stable is the only requirement — no runtime dependencies."
        />
        <Terminal caption="Install" lines={INSTALL_LINES} />
        <p className="text-base-content/60 mt-6 text-center text-sm">
          Or build from your checkout:{' '}
          <code className="bg-base-300 rounded px-1.5 py-0.5 font-mono text-xs">
            ./scripts/install-local.sh
          </code>{' '}
          — see the{' '}
          <a
            href={`${GITHUB}/blob/master/README.md`}
            target="_blank"
            rel="noreferrer"
            className="text-primary font-semibold">
            README
          </a>{' '}
          for details.
        </p>
      </div>
    </section>

    <CTA
      title="Ready to checkmate?"
      description="One binary, one command — install chess and start analyzing."
      primary={{ label: 'View on GitHub', href: GITHUB, external: true }}
      secondary={{
        label: 'Read the README',
        href: `${GITHUB}#readme`,
        external: true,
      }}
    />
  </main>
);

export default HomePage;
