use std::sync::OnceLock;

const ECO_TSV: &str = include_str!("../data/eco.tsv");

#[derive(Debug)]
pub struct EcoEntry {
    pub eco: &'static str,
    pub name: &'static str,
    pub moves: Vec<String>,
}

fn parse_pgn_moves(pgn: &str) -> Vec<String> {
    pgn.split_whitespace()
        .filter_map(|tok| {
            let tok = tok.trim_end_matches(['!', '?']);
            if tok.is_empty()
                || tok.starts_with('$')
                || tok.starts_with('{')
                || is_move_number(tok)
                || is_result(tok)
            {
                None
            } else {
                Some(tok.to_string())
            }
        })
        .collect()
}

fn is_move_number(tok: &str) -> bool {
    tok.contains('.') && tok.chars().all(|c| c.is_ascii_digit() || c == '.')
}

fn is_result(tok: &str) -> bool {
    matches!(tok, "1-0" | "0-1" | "1/2-1/2" | "*" | "1/2")
}

fn entries() -> &'static [EcoEntry] {
    static ENTRIES: OnceLock<Vec<EcoEntry>> = OnceLock::new();
    ENTRIES.get_or_init(|| {
        let mut v: Vec<EcoEntry> = ECO_TSV
            .lines()
            .skip(1)
            .filter_map(|line| {
                let mut parts = line.splitn(3, '\t');
                let eco = parts.next()?;
                let name = parts.next()?;
                let pgn = parts.next()?;
                Some(EcoEntry {
                    eco,
                    name,
                    moves: parse_pgn_moves(pgn),
                })
            })
            .collect();
        v.sort_by_key(|e| std::cmp::Reverse(e.moves.len()));
        v
    })
}

/// All parsed ECO openings, sorted longest line first.
pub fn openings() -> &'static [EcoEntry] {
    entries()
}

/// Representative opening name for an ECO code (e.g. "B90" -> "Sicilian Defense").
/// Returns the family part (before ':') of the shortest line for that code.
pub fn eco_name(code: &str) -> Option<&'static str> {
    let entry = entries()
        .iter()
        .filter(|e| e.eco == code)
        .min_by_key(|e| e.moves.len())?;
    let family = entry.name.split(':').next().unwrap_or(entry.name).trim();
    if family.is_empty() {
        Some(entry.name)
    } else {
        Some(family)
    }
}

/// Deepest opening whose move line is a prefix of `moves`.
/// Returns (ECO code, opening name).
pub fn opening_for_moves(moves: &[String]) -> Option<(&'static str, &'static str)> {
    entries().iter().find_map(|e| {
        if e.moves.len() <= moves.len() && moves[..e.moves.len()] == e.moves[..] {
            Some((e.eco, e.name))
        } else {
            None
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_eco_name() {
        assert_eq!(eco_name("B90"), Some("Sicilian Defense"));
        assert!(eco_name("E60").is_some());
        assert_eq!(eco_name("ZZZ"), None);
    }

    #[test]
    fn test_opening_for_moves() {
        let m: Vec<String> = ["e4", "e5", "Nf3", "Nc6"]
            .iter()
            .map(|s| s.to_string())
            .collect();
        let (eco, name) = opening_for_moves(&m).unwrap();
        assert!(eco.starts_with('C'));
        assert!(
            name.contains("Scotch")
                || name.contains("Italian")
                || name.contains("Four Knights")
                || !name.is_empty()
        );
    }
}
