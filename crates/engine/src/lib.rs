use chess_core::{
    apply_move, evaluate as material_eval, game_result, generate_captures, generate_moves, see_ge,
    undo_move, Color, GameResult, Move, PieceType, Position,
};
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Copy, Default)]
pub struct SearchLimits {
    pub max_depth: Option<u32>,
    pub movetime: Option<Duration>,
    pub nodes: Option<u64>,
}

const TT_SIZE: usize = 1 << 20;
const KILLER_MOVES: usize = 2;

#[derive(Debug, Clone, Copy, Default)]
enum TTFlag {
    #[default]
    Exact,
    Alpha,
    Beta,
}

#[derive(Debug, Clone, Copy, Default)]
struct TTEntry {
    hash: u64,
    depth: i16,
    score: i32,
    flag: TTFlag,
    best_move: Option<Move>,
}

struct TranspositionTable {
    table: Box<[TTEntry]>,
    hits: u64,
    probes: u64,
}

impl TranspositionTable {
    fn new() -> Self {
        TranspositionTable {
            table: vec![TTEntry::default(); TT_SIZE].into_boxed_slice(),
            hits: 0,
            probes: 0,
        }
    }

    fn clear(&mut self) {
        for entry in &mut self.table[..] {
            *entry = TTEntry::default();
        }
        self.hits = 0;
        self.probes = 0;
    }

    #[allow(clippy::too_many_arguments)]
    fn probe(
        &mut self,
        hash: u64,
        depth: i16,
        alpha: i32,
        beta: i32,
    ) -> Option<(i32, Option<Move>)> {
        self.probes += 1;
        let idx = (hash as usize) % TT_SIZE;
        let entry = &self.table[idx];
        if entry.hash != hash || entry.depth < depth {
            return None;
        }
        let result = match entry.flag {
            TTFlag::Exact => Some((entry.score, entry.best_move)),
            TTFlag::Alpha => {
                if entry.score <= alpha {
                    Some((entry.score, entry.best_move))
                } else {
                    None
                }
            }
            TTFlag::Beta => {
                if entry.score >= beta {
                    Some((entry.score, entry.best_move))
                } else {
                    None
                }
            }
        };
        if result.is_some() {
            self.hits += 1;
        }
        result
    }

    fn store(&mut self, hash: u64, depth: i16, score: i32, flag: TTFlag, best_move: Option<Move>) {
        let idx = (hash as usize) % TT_SIZE;
        let entry = &mut self.table[idx];
        if entry.depth < depth || entry.hash == 0 {
            entry.hash = hash;
            entry.depth = depth;
            entry.score = score;
            entry.flag = flag;
            entry.best_move = best_move;
        }
    }
}

struct KillerMoves {
    killers: [[Option<Move>; KILLER_MOVES]; 128],
}

impl KillerMoves {
    fn new() -> Self {
        KillerMoves {
            killers: [[None; KILLER_MOVES]; 128],
        }
    }

    fn add(&mut self, ply: usize, m: Move) {
        let ply = ply.min(127);
        if self.killers[ply][0] != Some(m) {
            self.killers[ply][1] = self.killers[ply][0];
            self.killers[ply][0] = Some(m);
        }
    }

    fn get(&self, ply: usize) -> [Option<Move>; KILLER_MOVES] {
        let ply = ply.min(127);
        self.killers[ply]
    }
}

// CaptureHistory[piece_type][to_square][captured_piece_type] for capture ordering
struct CaptureHistory {
    history: [[[i32; 6]; 64]; 6],
}

impl CaptureHistory {
    fn new() -> Self {
        CaptureHistory {
            history: [[[0; 6]; 64]; 6],
        }
    }

    fn bonus(&self, piece_type: PieceType, to: u8, captured: PieceType) -> i32 {
        self.history[piece_type as usize][to as usize][captured as usize]
    }

    fn add(&mut self, piece_type: PieceType, to: u8, captured: PieceType, depth: u32) {
        let entry = &mut self.history[piece_type as usize][to as usize][captured as usize];
        let bonus = (depth * depth) as i32;
        *entry = *entry + bonus - *entry * bonus.abs() / 1024;
    }
}

// ContinuationHistory[prev_move_index][piece_type][to_square] for quiet ordering
// 5 tables indexed by how many plies back the previous move was
struct ContinuationHistory {
    tables: Box<[[[[i32; 64]; 6]; 5]]>,
}

impl ContinuationHistory {
    fn new() -> Self {
        ContinuationHistory {
            tables: vec![[[[0i32; 64]; 6]; 5]; 4096].into_boxed_slice(),
        }
    }

    fn bonus(&self, prev_move_raw: u64, piece_type: PieceType, to: u8, idx: usize) -> i32 {
        let table_idx = (prev_move_raw % 4096) as usize;
        let idx = idx.min(4);
        self.tables[table_idx][idx][piece_type as usize][to as usize]
    }

    fn add(&mut self, prev_move_raw: u64, piece_type: PieceType, to: u8, idx: usize, depth: u32) {
        let table_idx = (prev_move_raw % 4096) as usize;
        let idx = idx.min(4);
        let entry = &mut self.tables[table_idx][idx][piece_type as usize][to as usize];
        let bonus = (depth * depth) as i32;
        *entry = *entry + bonus - *entry * bonus.abs() / 1024;
    }
}

struct HistoryTable {
    history: [[i32; 64]; 6],
}

impl HistoryTable {
    fn new() -> Self {
        HistoryTable {
            history: [[0; 64]; 6],
        }
    }

    fn bonus(&self, piece_type: PieceType, to: u8) -> i32 {
        self.history[piece_type as usize][to as usize]
    }

    fn add(&mut self, piece_type: PieceType, to: u8, depth: u32) {
        let entry = &mut self.history[piece_type as usize][to as usize];
        let bonus = (depth * depth) as i32;
        *entry = *entry + bonus - *entry * bonus.abs() / 1024;
    }
}

struct SearchCtx<'a> {
    tt: &'a mut TranspositionTable,
    killers: &'a mut KillerMoves,
    history: &'a mut HistoryTable,
    capture_history: &'a mut CaptureHistory,
    continuation_history: &'a mut ContinuationHistory,
    pv_table: &'a mut [[Option<Move>; 128]; 128],
    deadline: Option<Instant>,
    node_limit: u64,
    stopped: bool,
}

impl SearchCtx<'_> {
    fn check_stop(&mut self, nodes: u64) -> bool {
        if self.stopped {
            return true;
        }
        if self.deadline.map(|d| Instant::now() >= d).unwrap_or(false)
            || (self.node_limit > 0 && nodes >= self.node_limit)
        {
            self.stopped = true;
            return true;
        }
        false
    }
}

#[derive(Debug, Clone)]
pub struct SearchInfo {
    pub depth: u32,
    pub score: i32,
    pub nodes: u64,
    pub pv: Vec<Move>,
}

pub struct SearchResult {
    pub best_move: Option<Move>,
    pub score: i32,
    pub nodes: u64,
    pub tt_hits: u64,
    pub tt_probes: u64,
    pub infos: Vec<SearchInfo>,
}

pub struct SearchLine {
    pub mv: Move,
    pub score: i32,
    pub pv: Vec<Move>,
}

pub struct Engine {
    pub position: Position,
    tt: TranspositionTable,
    killers: KillerMoves,
    history: HistoryTable,
    capture_history: CaptureHistory,
    continuation_history: ContinuationHistory,
    pv_table: [[Option<Move>; 128]; 128],
}

impl Engine {
    pub fn new() -> Self {
        Engine {
            position: Position::standard(),
            tt: TranspositionTable::new(),
            killers: KillerMoves::new(),
            history: HistoryTable::new(),
            capture_history: CaptureHistory::new(),
            continuation_history: ContinuationHistory::new(),
            pv_table: [[None; 128]; 128],
        }
    }

    pub fn search(&mut self, depth: u32) -> SearchResult {
        self.search_limited(SearchLimits {
            max_depth: Some(depth),
            ..SearchLimits::default()
        })
    }

    pub fn search_limited(&mut self, limits: SearchLimits) -> SearchResult {
        self.tt.clear();
        self.killers = KillerMoves::new();
        self.history = HistoryTable::new();
        self.capture_history = CaptureHistory::new();
        self.continuation_history = ContinuationHistory::new();
        self.pv_table = [[None; 128]; 128];
        let mut nodes = 0;
        let mut best_move = None;
        let mut best_score = i32::MIN;

        let deadline = limits.movetime.map(|d| Instant::now() + d);
        let max_depth = limits.max_depth.unwrap_or(u32::MAX);
        let node_limit = limits.nodes.unwrap_or(0);

        let mut ctx = SearchCtx {
            tt: &mut self.tt,
            killers: &mut self.killers,
            history: &mut self.history,
            capture_history: &mut self.capture_history,
            continuation_history: &mut self.continuation_history,
            pv_table: &mut self.pv_table,
            deadline,
            node_limit,
            stopped: false,
        };

        let mut d = 1;
        let mut infos = Vec::new();
        while d <= max_depth {
            if ctx.check_stop(nodes) {
                break;
            }
            let mut pos_copy = self.position.clone();
            let (score, mv) = negamax_root(
                &mut pos_copy,
                d,
                i32::MIN + 1,
                i32::MAX,
                &mut nodes,
                &mut ctx,
            );
            if ctx.stopped && best_move.is_some() {
                break;
            }
            best_score = score;
            best_move = mv;
            let pv: Vec<Move> = ctx.pv_table[0].iter().take(127).map_while(|x| *x).collect();
            infos.push(SearchInfo {
                depth: d,
                score,
                nodes,
                pv,
            });
            d += 1;
        }

        SearchResult {
            best_move,
            score: best_score,
            nodes,
            tt_hits: self.tt.hits,
            tt_probes: self.tt.probes,
            infos,
        }
    }

    /// MultiPV search: scores every root move with a full window at the
    /// target depth and returns the top `n` lines (best first).
    /// Slower than `search_limited` — intended for analysis, not play.
    pub fn search_multi(&mut self, limits: SearchLimits, n: usize) -> Vec<SearchLine> {
        self.tt.clear();
        self.killers = KillerMoves::new();
        self.history = HistoryTable::new();
        self.capture_history = CaptureHistory::new();
        self.continuation_history = ContinuationHistory::new();
        self.pv_table = [[None; 128]; 128];

        let deadline = limits.movetime.map(|d| Instant::now() + d);
        let depth = limits.max_depth.unwrap_or(4);
        let node_limit = limits.nodes.unwrap_or(0);
        let mut nodes = 0u64;

        let mut pos_copy = self.position.clone();
        let mut ctx = SearchCtx {
            tt: &mut self.tt,
            killers: &mut self.killers,
            history: &mut self.history,
            capture_history: &mut self.capture_history,
            continuation_history: &mut self.continuation_history,
            pv_table: &mut self.pv_table,
            deadline,
            node_limit,
            stopped: false,
        };

        let root_moves = generate_moves(&pos_copy);
        let root_hash = pos_copy.zobrist_hash();
        let mut lines = Vec::new();

        for m in root_moves {
            if ctx.check_stop(nodes) {
                break;
            }
            let state = apply_move(&mut pos_copy, m);

            let mut repetition = vec![root_hash];
            let (child_score, _) = negamax(
                &mut pos_copy,
                depth.saturating_sub(1),
                i32::MIN + 1,
                i32::MAX,
                false,
                &mut nodes,
                &mut ctx,
                1,
                &mut repetition,
            );

            undo_move(&mut pos_copy, m, state);

            let mut pv: Vec<Move> = ctx.pv_table[1].iter().take(127).map_while(|x| *x).collect();
            pv.insert(0, m);
            lines.push(SearchLine {
                mv: m,
                score: if child_score == i32::MIN {
                    i32::MIN / 2
                } else {
                    -child_score
                },
                pv,
            });
        }

        lines.sort_by_key(|l| std::cmp::Reverse(l.score));
        lines.truncate(n.max(1));
        lines
    }

    pub fn apply(&mut self, m: Move) {
        apply_move(&mut self.position, m);
    }

    pub fn result(&self) -> GameResult {
        game_result(&self.position)
    }

    /// Static evaluation in centipawns, side-to-move perspective.
    pub fn static_eval(&self) -> i32 {
        static_eval(&self.position)
    }
}

fn negamax_root(
    position: &mut Position,
    depth: u32,
    mut alpha: i32,
    beta: i32,
    nodes: &mut u64,
    ctx: &mut SearchCtx,
) -> (i32, Option<Move>) {
    *nodes += 1;
    if ctx.check_stop(*nodes) {
        return (0, None);
    }

    let moves = generate_moves(position);
    if moves.is_empty() {
        if position.is_in_check(position.side_to_move) {
            return (-100000, None);
        }
        return (0, None);
    }

    let tt_hash = position.zobrist_hash();
    let tt_move = ctx
        .tt
        .probe(tt_hash, depth as i16, alpha, beta)
        .and_then(|(_, m)| m);

    let pv_move = ctx.pv_table[0][0];

    let ordered = order_moves(
        position,
        &moves,
        tt_move.or(pv_move),
        ctx.killers,
        ctx.history,
        ctx.capture_history,
        ctx.continuation_history,
        0,
        None,
    );

    let mut best_score = i32::MIN;
    let mut best_move = None;
    let mut repetition = vec![tt_hash];

    for m in ordered {
        if ctx.stopped {
            break;
        }

        let state = apply_move(position, m);

        let score = if depth >= 3 && !position.is_in_check(position.side_to_move) {
            let saved_side = position.side_to_move;
            position.side_to_move = position.side_to_move.opponent();
            let (null_score, _) = negamax(
                position,
                depth - 3,
                -beta,
                -beta + 1,
                false,
                nodes,
                ctx,
                1,
                &mut repetition,
            );
            position.side_to_move = saved_side;
            -null_score
        } else {
            i32::MIN
        };

        let score = if score >= beta {
            beta
        } else {
            let (child_score, _) = negamax(
                position,
                depth - 1,
                -beta,
                -alpha,
                false,
                nodes,
                ctx,
                1,
                &mut repetition,
            );
            -child_score
        };

        undo_move(position, m, state);

        if score > best_score {
            best_score = score;
            best_move = Some(m);
            ctx.pv_table[0][0] = Some(m);
            for i in 1..127 {
                if ctx.pv_table[1][i].is_some() {
                    ctx.pv_table[0][i + 1] = ctx.pv_table[1][i];
                } else {
                    break;
                }
            }
        }

        if score > alpha {
            alpha = score;
        }
        if alpha >= beta {
            break;
        }
    }

    let flag = if best_score <= alpha {
        TTFlag::Alpha
    } else if best_score >= beta {
        TTFlag::Beta
    } else {
        TTFlag::Exact
    };
    ctx.tt
        .store(tt_hash, depth as i16, best_score, flag, best_move);

    if best_score == i32::MIN {
        (0, best_move)
    } else {
        (best_score, best_move)
    }
}

#[allow(clippy::too_many_arguments)]
fn negamax(
    position: &mut Position,
    depth: u32,
    mut alpha: i32,
    beta: i32,
    _root: bool,
    nodes: &mut u64,
    ctx: &mut SearchCtx,
    ply: usize,
    repetition: &mut Vec<u64>,
) -> (i32, Option<Move>) {
    *nodes += 1;
    if ctx.check_stop(*nodes) {
        return (0, None);
    }

    if depth == 0 {
        return quiesce(position, alpha, beta, nodes, ctx, ply, repetition);
    }

    // Check extension: extend search when in check at low depth
    let depth = if position.is_in_check(position.side_to_move) && depth <= 2 {
        depth + 1
    } else {
        depth
    };

    let tt_hash = position.zobrist_hash();

    // Static evaluation for futility pruning
    let in_check = position.is_in_check(position.side_to_move);
    let static_eval = if !in_check {
        Some(static_eval(position))
    } else {
        None
    };

    // Futility pruning: at low depth, if we're already ahead enough, fail low
    if !in_check && depth <= 4 {
        if let Some(se) = static_eval {
            if se + depth as i32 * 100 <= alpha {
                return (alpha, None);
            }
        }
    }

    // Repetition detection: draw if position repeats 3 times
    let rep_count = repetition.iter().filter(|&&h| h == tt_hash).count();
    if rep_count >= 2 {
        return (0, None);
    }

    // TT probe
    if let Some((score, mv)) = ctx.tt.probe(tt_hash, depth as i16, alpha, beta) {
        return (score, mv);
    }

    let moves = generate_moves(position);
    if moves.is_empty() {
        if position.is_in_check(position.side_to_move) {
            return (-100000, None);
        }
        return (0, None);
    }

    let tt_move = ctx
        .tt
        .probe(tt_hash, depth as i16, alpha, beta)
        .and_then(|(_, m)| m);
    let pv_move = ctx.pv_table[ply][0];
    let ordered = order_moves(
        position,
        &moves,
        tt_move.or(pv_move),
        ctx.killers,
        ctx.history,
        ctx.capture_history,
        ctx.continuation_history,
        ply,
        None,
    );

    let mut best_score = i32::MIN;
    let mut best_move = None;
    let original_alpha = alpha;
    let mut first_move = true;
    repetition.push(tt_hash);

    for (idx, m) in ordered.iter().enumerate() {
        if ctx.stopped {
            break;
        }

        let state = apply_move(position, *m);

        // Late Move Reductions
        let reduced_depth =
            if idx >= 3 && depth >= 3 && !first_move && position.get_piece(m.to).is_none() {
                depth - 2
            } else {
                depth - 1
            };

        // Null move pruning
        let score = if depth >= 3 && !position.is_in_check(position.side_to_move) && !first_move {
            let saved_side = position.side_to_move;
            position.side_to_move = position.side_to_move.opponent();
            let (null_score, _) = negamax(
                position,
                depth - 3,
                -beta,
                -beta + 1,
                false,
                nodes,
                ctx,
                ply + 1,
                repetition,
            );
            position.side_to_move = saved_side;
            -null_score
        } else {
            i32::MIN
        };

        let score = if score >= beta {
            beta
        } else if first_move {
            let (child_score, _) = negamax(
                position,
                depth - 1,
                -beta,
                -alpha,
                false,
                nodes,
                ctx,
                ply + 1,
                repetition,
            );
            -child_score
        } else {
            let (child_score, _) = negamax(
                position,
                reduced_depth,
                -alpha - 1,
                -alpha,
                false,
                nodes,
                ctx,
                ply + 1,
                repetition,
            );
            let score = -child_score;
            if score > alpha && score < beta {
                let (child_score, _) = negamax(
                    position,
                    depth - 1,
                    -beta,
                    -alpha,
                    false,
                    nodes,
                    ctx,
                    ply + 1,
                    repetition,
                );
                -child_score
            } else {
                score
            }
        };

        undo_move(position, *m, state);

        if score > best_score {
            best_score = score;
            best_move = Some(*m);
            ctx.pv_table[ply][0] = Some(*m);
            for i in 1..127 {
                if ctx.pv_table[ply + 1][i].is_some() {
                    ctx.pv_table[ply][i + 1] = ctx.pv_table[ply + 1][i];
                } else {
                    break;
                }
            }
        }

        if score > alpha {
            alpha = score;
        }
        if alpha >= beta {
            if position.get_piece(m.to).is_none() {
                ctx.killers.add(ply, *m);
                if let Some(piece) = position.get_piece(m.from) {
                    ctx.history.add(piece.piece_type, m.to.index() as u8, depth);
                    // Continuation history: bonus based on previous ply's move
                    if ply > 0 {
                        // We need the previous move's raw value - stored in repetition
                        // Use the previous position's hash as a proxy for prev move
                        let prev_move_hash = repetition.last().copied().unwrap_or(0);
                        ctx.continuation_history.add(
                            prev_move_hash,
                            piece.piece_type,
                            m.to.index() as u8,
                            0,
                            depth,
                        );
                    }
                    // Capture history for captures
                    if let Some(captured) = position.get_piece(m.to) {
                        ctx.capture_history.add(
                            piece.piece_type,
                            m.to.index() as u8,
                            captured.piece_type,
                            depth,
                        );
                    }
                }
            }
            break;
        }
        first_move = false;
    }

    repetition.pop();

    let flag = if best_score <= original_alpha {
        TTFlag::Alpha
    } else if best_score >= beta {
        TTFlag::Beta
    } else {
        TTFlag::Exact
    };
    ctx.tt
        .store(tt_hash, depth as i16, best_score, flag, best_move);

    if best_score == i32::MIN {
        (0, best_move)
    } else {
        (best_score, best_move)
    }
}

#[allow(clippy::too_many_arguments)]
fn quiesce(
    position: &mut Position,
    mut alpha: i32,
    beta: i32,
    nodes: &mut u64,
    ctx: &mut SearchCtx,
    _ply: usize,
    repetition: &mut Vec<u64>,
) -> (i32, Option<Move>) {
    *nodes += 1;
    if ctx.check_stop(*nodes) {
        return (0, None);
    }

    let stand_pat = static_eval(position);
    if stand_pat >= beta {
        return (beta, None);
    }
    if alpha < stand_pat {
        alpha = stand_pat;
    }

    let in_check = position.is_in_check(position.side_to_move);
    let moves = if in_check {
        generate_moves(position)
    } else {
        generate_captures(position)
    };
    if moves.is_empty() {
        return (stand_pat, None);
    }

    // Futility pruning: skip quiet moves when we're already ahead enough
    if !in_check && stand_pat + 200 <= alpha {
        return (alpha, None);
    }

    let tt_move = ctx
        .tt
        .probe(position.zobrist_hash(), 0, alpha, beta)
        .and_then(|(_, m)| m);

    let ordered = order_moves(
        position,
        &moves,
        tt_move,
        ctx.killers,
        ctx.history,
        ctx.capture_history,
        ctx.continuation_history,
        0,
        None,
    );

    let mut best_score = stand_pat;
    let mut best_move = None;
    let mut move_count = 0;

    for m in ordered {
        move_count += 1;

        let capture = position.get_piece(m.to).is_some();

        // SEE pruning: skip captures that lose material
        if capture && !see_ge(position, m, -50) {
            continue;
        }

        // Futility move count pruning
        if !in_check && !capture && move_count > 2 {
            continue;
        }

        let state = apply_move(position, m);

        // Repetition detection
        let hash = position.zobrist_hash();
        let count = repetition.iter().filter(|&&h| h == hash).count();
        if count >= 2 {
            undo_move(position, m, state);

            continue;
        }

        repetition.push(hash);
        let (score, _) = quiesce(position, -beta, -alpha, nodes, ctx, 0, repetition);
        repetition.pop();

        undo_move(position, m, state);

        let score = -score;

        if score > best_score {
            best_score = score;
            best_move = Some(m);
        }

        if score > alpha {
            alpha = score;
        }
        if alpha >= beta {
            if capture {
                if let Some(piece) = position.get_piece(m.from) {
                    if let Some(captured) = position.get_piece(m.to) {
                        ctx.capture_history.add(
                            piece.piece_type,
                            m.to.index() as u8,
                            captured.piece_type,
                            0,
                        );
                    }
                }
            }
            break;
        }
    }

    (best_score, best_move)
}

#[allow(clippy::too_many_arguments)]
fn order_moves(
    position: &Position,
    moves: &[Move],
    tt_move: Option<Move>,
    killers: &KillerMoves,
    history: &HistoryTable,
    capture_history: &CaptureHistory,
    continuation_history: &ContinuationHistory,
    ply: usize,
    prev_move: Option<Move>,
) -> Vec<Move> {
    let killer_set = killers.get(ply);
    let prev_raw = prev_move.map_or(0, |m| {
        ((m.from.index() as u64) << 6) | (m.to.index() as u64)
    });
    let mut scored: Vec<(i32, Move)> = moves
        .iter()
        .map(|m| {
            let score = score_move(
                position,
                m,
                tt_move,
                &killer_set,
                history,
                capture_history,
                continuation_history,
                prev_raw,
                ply,
            );
            (score, *m)
        })
        .collect();
    scored.sort_by_key(|b| std::cmp::Reverse(b.0));
    scored.into_iter().map(|(_, m)| m).collect()
}

#[allow(clippy::too_many_arguments)]
fn score_move(
    position: &Position,
    m: &Move,
    tt_move: Option<Move>,
    killers: &[Option<Move>; KILLER_MOVES],
    history: &HistoryTable,
    capture_history: &CaptureHistory,
    continuation_history: &ContinuationHistory,
    prev_raw: u64,
    ply: usize,
) -> i32 {
    // TT/PV move scores highest
    if tt_move == Some(*m) {
        return 200000;
    }

    // Promotions
    if m.promotion.is_some() {
        return 150000;
    }

    // Captures: MVV-LVA + capture history
    if let Some(captured) = position.get_piece(m.to) {
        let attacker = position.get_piece(m.from).unwrap();
        let victim_val = piece_value(captured.piece_type);
        let attacker_val = piece_value(attacker.piece_type);
        let base = 10000 + victim_val * 10 - attacker_val;
        let hist_bonus =
            capture_history.bonus(attacker.piece_type, m.to.index() as u8, captured.piece_type);
        return base + hist_bonus;
    }

    // Killer moves
    for killer in killers.iter() {
        if *killer == Some(*m) {
            return 90000;
        }
    }

    // Quiet moves: history + continuation history + check bonus
    let mut score = 0;
    if let Some(piece) = position.get_piece(m.from) {
        score += history.bonus(piece.piece_type, m.to.index() as u8);
        // Continuation history from previous ply
        if ply > 0 {
            score += continuation_history.bonus(prev_raw, piece.piece_type, m.to.index() as u8, 0);
        }
        // Bonus for moves that give check
        if let Some(enemy_king) = position.king_square(position.side_to_move.opponent()) {
            if position.square_attacks(m.to, enemy_king) {
                score += 500;
            }
        }
    }
    score
}

/// Material/PST evaluation in centipawns, side-to-move perspective.
fn static_eval(position: &Position) -> i32 {
    let score = material_eval(position);
    if position.side_to_move == Color::Black {
        -score
    } else {
        score
    }
}

fn piece_value(pt: PieceType) -> i32 {
    match pt {
        PieceType::Pawn => 100,
        PieceType::Knight => 320,
        PieceType::Bishop => 330,
        PieceType::Rook => 500,
        PieceType::Queen => 900,
        PieceType::King => 1000,
    }
}

impl Default for Engine {
    fn default() -> Self {
        Engine::new()
    }
}
