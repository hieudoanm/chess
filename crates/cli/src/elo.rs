use anyhow::Result;
use chess_core::{
    calculate_dwz, calculate_performance, calculate_rating, calculate_usfc, draw_percent,
    expected_score, glicko2, win_probability, DwzResult, Glicko2Game, RatingGame, Score, TimeClass,
    UsfcResult,
};

#[allow(clippy::too_many_arguments)]
pub fn run(
    player: f64,
    opponent: f64,
    score: Score,
    games: u32,
    age: u32,
    time_class: TimeClass,
    rd: Option<f64>,
    sigma: f64,
    tau: f64,
) -> Result<()> {
    let exp = expected_score(player, opponent);
    let wp = win_probability(player, opponent);
    let draws = draw_percent(player - opponent);

    println!(
        "Player {:.0} vs Opponent {:.0} -> {:?}",
        player, opponent, score
    );
    println!(
        "Expected score: {:.3}  Win probability: {:.1}%  Draw rate: {:.0}%",
        exp, wp, draws
    );

    let new_fide = calculate_rating(
        player,
        opponent,
        score,
        games < 30,
        player >= 2400.0,
        age >= 18,
        time_class,
    );
    println!(
        "FIDE-style new rating: {:.0} ({:+.0})",
        new_fide,
        new_fide - player
    );

    let UsfcResult {
        rating_new: uscf_new,
        rating_change: uscf_change,
    } = calculate_usfc(player, opponent, score, games, age);
    println!("USCF new rating: {:.0} ({:+.0})", uscf_new, uscf_change);

    let DwzResult {
        rating_new: dwz_new,
        rating_change: dwz_change,
    } = calculate_dwz(player, opponent, score, games, age);
    println!("DWZ new rating: {:.0} ({:+.0})", dwz_new, dwz_change);

    if let Some(rd) = rd {
        let g = glicko2(
            player,
            rd,
            sigma,
            &[Glicko2Game {
                rating: opponent,
                rd: 350.0,
                score: score.value(),
            }],
            tau,
        );
        println!(
            "Glicko-2: rating {:.1} rd {:.1} sigma {:.4}",
            g.rating, g.rd, g.sigma
        );
    }
    Ok(())
}

pub fn performance(games: &[RatingGame]) -> Result<()> {
    let pr = calculate_performance(games);
    println!("Performance rating: {:.0}", pr);
    Ok(())
}
