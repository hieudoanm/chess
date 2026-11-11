use anyhow::Result;
use chess_core::{perft, perft_divide, Position};
use std::time::Instant;

pub fn run(depth: u32, fen: Option<&str>, divide: bool) -> Result<()> {
    let pos = fen
        .and_then(Position::from_fen)
        .unwrap_or_else(Position::standard);
    let start = Instant::now();
    if divide {
        let mut rows = perft_divide(&pos, depth);
        rows.sort_by_key(|a| std::cmp::Reverse(a.1));
        let mut total = 0u64;
        for (mv, nodes) in &rows {
            println!("{}: {}", mv, nodes);
            total += nodes;
        }
        println!("\nTotal: {} nodes in {:?}", total, start.elapsed());
    } else {
        let nodes = perft(&pos, depth);
        println!(
            "perft({}) = {} nodes in {:?}",
            depth,
            nodes,
            start.elapsed()
        );
    }
    Ok(())
}
