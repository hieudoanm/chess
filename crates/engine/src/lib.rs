use chess_core::{
    apply_move, evaluate, game_result, generate_moves, GameResult, Move, PieceType, Position,
};

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
        self.history[piece_type as usize][to as usize] += (depth * depth) as i32;
    }
}

struct SearchCtx<'a> {
    tt: &'a mut TranspositionTable,
    killers: &'a mut KillerMoves,
    history: &'a mut HistoryTable,
}

pub struct SearchResult {
    pub best_move: Option<Move>,
    pub score: i32,
    pub nodes: u64,
    pub tt_hits: u64,
    pub tt_probes: u64,
}

pub struct Engine {
    pub position: Position,
    tt: TranspositionTable,
    killers: KillerMoves,
    history: HistoryTable,
}

impl Engine {
    pub fn new() -> Self {
        Engine {
            position: Position::standard(),
            tt: TranspositionTable::new(),
            killers: KillerMoves::new(),
            history: HistoryTable::new(),
        }
    }

    pub fn search(&mut self, depth: u32) -> SearchResult {
        self.tt.clear();
        self.killers = KillerMoves::new();
        self.history = HistoryTable::new();
        let mut nodes = 0;
        let mut best_move = None;
        let mut best_score = i32::MIN;

        for d in 1..=depth {
            let mut ctx = SearchCtx {
                tt: &mut self.tt,
                killers: &mut self.killers,
                history: &mut self.history,
            };
            let (score, mv) = negamax_root(
                &self.position,
                d,
                i32::MIN + 1,
                i32::MAX,
                &mut nodes,
                &mut ctx,
            );
            best_score = score;
            best_move = mv;
        }

        SearchResult {
            best_move,
            score: best_score,
            nodes,
            tt_hits: self.tt.hits,
            tt_probes: self.tt.probes,
        }
    }

    pub fn apply(&mut self, m: Move) {
        apply_move(&mut self.position, m);
    }

    pub fn result(&self) -> GameResult {
        game_result(&self.position)
    }
}

fn negamax_root(
    position: &Position,
    depth: u32,
    mut alpha: i32,
    beta: i32,
    nodes: &mut u64,
    ctx: &mut SearchCtx,
) -> (i32, Option<Move>) {
    *nodes += 1;

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

    let ordered = order_moves(position, &moves, tt_move, ctx.killers, ctx.history, 0);

    let mut best_score = i32::MIN;
    let mut best_move = None;

    for m in ordered {
        let mut new_pos = position.clone();
        apply_move(&mut new_pos, m);

        let score = if depth >= 3 && !position.is_in_check(position.side_to_move) {
            let mut null_pos = position.clone();
            null_pos.side_to_move = null_pos.side_to_move.opponent();
            let (null_score, _) =
                negamax(&null_pos, depth - 3, -beta, -beta + 1, false, nodes, ctx, 1);
            -null_score
        } else {
            i32::MIN
        };

        let score = if score >= beta {
            beta
        } else {
            let (child_score, _) =
                negamax(&new_pos, depth - 1, -beta, -alpha, false, nodes, ctx, 1);
            -child_score
        };

        if score > best_score {
            best_score = score;
            best_move = Some(m);
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

    (best_score, best_move)
}

#[allow(clippy::too_many_arguments)]
fn negamax(
    position: &Position,
    depth: u32,
    mut alpha: i32,
    beta: i32,
    _root: bool,
    nodes: &mut u64,
    ctx: &mut SearchCtx,
    ply: usize,
) -> (i32, Option<Move>) {
    *nodes += 1;

    if depth == 0 {
        return (evaluate(position), None);
    }

    let tt_hash = position.zobrist_hash();

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

    let tt_move = None;
    let ordered = order_moves(position, &moves, tt_move, ctx.killers, ctx.history, ply);

    let mut best_score = i32::MIN;
    let mut best_move = None;
    let original_alpha = alpha;

    for m in ordered {
        let mut new_pos = position.clone();
        apply_move(&mut new_pos, m);

        let score = if depth >= 3 && !position.is_in_check(position.side_to_move) {
            let mut null_pos = position.clone();
            null_pos.side_to_move = null_pos.side_to_move.opponent();
            let (null_score, _) = negamax(
                &null_pos,
                depth - 3,
                -beta,
                -beta + 1,
                false,
                nodes,
                ctx,
                ply + 1,
            );
            -null_score
        } else {
            i32::MIN
        };

        let score = if score >= beta {
            beta
        } else {
            let (child_score, _) = negamax(
                &new_pos,
                depth - 1,
                -beta,
                -alpha,
                false,
                nodes,
                ctx,
                ply + 1,
            );
            -child_score
        };

        if score > best_score {
            best_score = score;
            best_move = Some(m);
        }

        if score > alpha {
            alpha = score;
        }
        if alpha >= beta {
            // Store killer for quiet moves
            if position.get_piece(m.to).is_none() {
                ctx.killers.add(ply, m);
                if let Some(piece) = position.get_piece(m.from) {
                    ctx.history.add(piece.piece_type, m.to.index() as u8, depth);
                }
            }
            break;
        }
    }

    let flag = if best_score <= original_alpha {
        TTFlag::Alpha
    } else if best_score >= beta {
        TTFlag::Beta
    } else {
        TTFlag::Exact
    };
    ctx.tt
        .store(tt_hash, depth as i16, best_score, flag, best_move);

    (best_score, best_move)
}

fn order_moves(
    position: &Position,
    moves: &[Move],
    tt_move: Option<Move>,
    killers: &KillerMoves,
    history: &HistoryTable,
    ply: usize,
) -> Vec<Move> {
    let killer_set = killers.get(ply);
    let mut scored: Vec<(i32, Move)> = moves
        .iter()
        .map(|m| {
            let score = score_move(position, m, tt_move, &killer_set, history);
            (score, *m)
        })
        .collect();
    scored.sort_by_key(|b| std::cmp::Reverse(b.0));
    scored.into_iter().map(|(_, m)| m).collect()
}

fn score_move(
    position: &Position,
    m: &Move,
    tt_move: Option<Move>,
    killers: &[Option<Move>; KILLER_MOVES],
    history: &HistoryTable,
) -> i32 {
    // TT move scores highest
    if tt_move == Some(*m) {
        return 200000;
    }

    // Promotions
    if m.promotion.is_some() {
        return 150000;
    }

    // Captures: MVV-LVA
    if let Some(captured) = position.get_piece(m.to) {
        let attacker = position.get_piece(m.from).unwrap();
        let victim_val = piece_value(captured.piece_type);
        let attacker_val = piece_value(attacker.piece_type);
        return 10000 + victim_val * 10 - attacker_val;
    }

    // Killer moves
    for killer in killers.iter() {
        if *killer == Some(*m) {
            return 90000;
        }
    }

    // Quiet moves: history bonus
    if let Some(piece) = position.get_piece(m.from) {
        history.bonus(piece.piece_type, m.to.index() as u8)
    } else {
        0
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
