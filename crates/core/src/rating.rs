#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Score {
    Win,
    Draw,
    Loss,
}

impl Score {
    pub fn value(self) -> f64 {
        match self {
            Score::Win => 1.0,
            Score::Draw => 0.5,
            Score::Loss => 0.0,
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        match s.to_ascii_lowercase().as_str() {
            "win" | "1" | "w" => Some(Score::Win),
            "draw" | "0.5" | "d" => Some(Score::Draw),
            "loss" | "0" | "l" => Some(Score::Loss),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TimeClass {
    Classical,
    Rapid,
    Blitz,
}

pub fn expected_score(rating: f64, opponent: f64) -> f64 {
    1.0 / (1.0 + 10f64.powf((opponent - rating) / 400.0))
}

pub fn draw_percent(diff: f64) -> f64 {
    let diff = diff.abs();
    if diff >= 500.0 {
        6.0
    } else if diff >= 400.0 {
        8.0
    } else if diff >= 300.0 {
        12.0
    } else if diff >= 200.0 {
        20.0
    } else if diff >= 100.0 {
        30.0
    } else {
        38.0
    }
}

pub fn win_probability(rating: f64, opponent: f64) -> f64 {
    let draws = draw_percent(rating - opponent) / 100.0;
    let wins = expected_score(rating, opponent) - draws / 2.0;
    wins.clamp(0.01, 0.99).round_to(2)
}

trait Round2 {
    fn round_to(self, digits: i32) -> f64;
}
impl Round2 for f64 {
    fn round_to(self, digits: i32) -> f64 {
        let m = 10f64.powi(digits);
        (self * m).round() / m
    }
}

pub fn k_factor_fide(rating: f64, games: u32, age: u32) -> f64 {
    if games < 30 || age < 18 {
        40.0
    } else if rating < 2400.0 {
        20.0
    } else {
        10.0
    }
}

pub fn k_factor_usfc(rating: f64, games: u32, age: u32) -> f64 {
    if age < 21 && rating < 2200.0 {
        50.0
    } else if rating < 2100.0 || games < 26 {
        32.0
    } else if rating < 2400.0 {
        24.0
    } else {
        16.0
    }
}

pub struct UsfcResult {
    pub rating_new: f64,
    pub rating_change: f64,
}

pub fn calculate_usfc(
    rating: f64,
    opponent: f64,
    score: Score,
    games: u32,
    age: u32,
) -> UsfcResult {
    let capped = if (opponent - rating).abs() > 400.0 {
        rating + (opponent - rating).signum() * 400.0
    } else {
        opponent
    };
    let expected = expected_score(rating, capped);
    let k = k_factor_usfc(rating, games, age);
    let change = (k * (score.value() - expected)).round();
    UsfcResult {
        rating_new: (rating + change).max(100.0),
        rating_change: change,
    }
}

pub fn dwz_index(rating: f64, age: u32) -> f64 {
    if age >= 21 || rating >= 1300.0 {
        0.0
    } else {
        ((1300.0 - rating) / 50.0).floor().min(5.0)
    }
}

pub struct DwzResult {
    pub rating_new: f64,
    pub rating_change: f64,
}

pub fn calculate_dwz(rating: f64, opponent: f64, score: Score, games: u32, age: u32) -> DwzResult {
    let e = expected_score(rating, opponent);
    let adjusted = e + dwz_index(rating, age) * (0.5 - e) / 8.0;
    let a = ((opponent - rating) / 10.0).clamp(-5.0, 5.0);
    let b = if age >= 60 {
        15.0
    } else if age < 21 {
        if games < 8 {
            5.0
        } else if games < 30 {
            10.0
        } else {
            15.0
        }
    } else {
        0.0
    };
    let k = 1300.0 / (a + b);
    let change = (k * (score.value() - adjusted)).round();
    DwzResult {
        rating_new: (rating + change).max(400.0),
        rating_change: change,
    }
}

#[derive(Debug, Clone)]
pub struct Glicko2Game {
    pub rating: f64,
    pub rd: f64,
    pub score: f64,
}

#[derive(Debug, Clone)]
pub struct Glicko2Rating {
    pub rating: f64,
    pub rd: f64,
    pub sigma: f64,
}

const GLICKO_SCALE: f64 = 173.7178;

fn glicko_g(phi: f64) -> f64 {
    1.0 / (1.0 + 3.0 * phi * phi / (std::f64::consts::PI * std::f64::consts::PI)).sqrt()
}

fn glicko_e(mu: f64, mu_opp: f64, phi_opp: f64) -> f64 {
    1.0 / (1.0 + (-glicko_g(phi_opp) * (mu - mu_opp)).exp())
}

fn glicko_volatility(phi: f64, sigma: f64, delta: f64, v: f64, tau: f64) -> f64 {
    let a = (sigma * sigma).ln();
    let phi2 = phi * phi;
    let delta2 = delta * delta;
    let f = |x: f64| -> f64 {
        let ex = x.exp();
        let lhs = ex * (delta2 - phi2 - v - ex) / (2.0 * (phi2 + v + ex).powi(2));
        lhs - (x - a) / (tau * tau)
    };
    let mut a_ = a;
    let b = if delta2 > phi2 + v {
        (delta2 - phi2 - v).ln()
    } else {
        let mut k = 1.0;
        while f(a_ - k * tau) < 0.0 {
            k += 1.0;
        }
        a_ - k * tau
    };
    let mut b_ = b;
    let mut f_a = f(a_);
    let mut f_b = f(b_);
    while (b_ - a_).abs() > 1e-6 {
        let c = a_ + (a_ - b_) * f_a / (f_b - f_a);
        let f_c = f(c);
        if f_c * f_b <= 0.0 {
            a_ = b_;
            f_a = f_b;
        } else {
            f_a /= 2.0;
        }
        b_ = c;
        f_b = f_c;
    }
    (a_ / 2.0).exp()
}

/// Glicko-2 rating update. `rating`/`rd` are the player's current values,
/// `sigma` is rating deviation volatility (default 0.06), `games` are the
/// games played since the last update, `tau` is the system constant (default 0.5).
pub fn glicko2(rating: f64, rd: f64, sigma: f64, games: &[Glicko2Game], tau: f64) -> Glicko2Rating {
    if games.is_empty() {
        return Glicko2Rating {
            rating,
            rd: GLICKO_SCALE * ((rd / GLICKO_SCALE).powi(2) + sigma * sigma).sqrt(),
            sigma,
        };
    }
    let mu = (rating - 1500.0) / GLICKO_SCALE;
    let phi = rd / GLICKO_SCALE;

    let gs: Vec<(f64, f64, f64)> = games
        .iter()
        .map(|g| {
            let g_phi = glicko_g(g.rd / GLICKO_SCALE);
            let e = glicko_e(mu, (g.rating - 1500.0) / GLICKO_SCALE, g.rd / GLICKO_SCALE);
            (g_phi, e, g.score)
        })
        .collect();

    let v = 1.0
        / gs.iter()
            .map(|(g, e, _)| g * g * e * (1.0 - e))
            .sum::<f64>();
    let delta = v * gs.iter().map(|(g, e, s)| g * (s - e)).sum::<f64>();

    let sigma_new = glicko_volatility(phi, sigma, delta, v, tau);
    let phi_star = (phi * phi + sigma_new * sigma_new).sqrt();
    let phi_new = 1.0 / (1.0 / (phi_star * phi_star) + 1.0 / v).sqrt();
    let mu_new = mu + phi_new * phi_new * gs.iter().map(|(g, e, s)| g * (s - e)).sum::<f64>();

    Glicko2Rating {
        rating: 1500.0 + GLICKO_SCALE * mu_new,
        rd: GLICKO_SCALE * phi_new,
        sigma: sigma_new,
    }
}

pub fn win_percent_from_centipawns(cp: f64) -> f64 {
    50.0 + 50.0 * (2.0 / (1.0 + (-0.00368208 * cp).exp()) - 1.0)
}

pub fn calculate_accuracy(win_percent_lost: f64) -> f64 {
    (103.1668 * (-0.04354 * win_percent_lost).exp() - 33.043)
        .clamp(0.0, 100.0)
        .round()
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MoveClass {
    Best,
    Good,
    Inaccuracy,
    Mistake,
    Blunder,
}

impl MoveClass {
    pub fn label(self) -> &'static str {
        match self {
            MoveClass::Best => "Best",
            MoveClass::Good => "Good",
            MoveClass::Inaccuracy => "Inaccuracy",
            MoveClass::Mistake => "Mistake",
            MoveClass::Blunder => "Blunder",
        }
    }
}

pub fn classify_move(win_percent_lost: f64) -> MoveClass {
    if win_percent_lost <= 2.0 {
        MoveClass::Best
    } else if win_percent_lost <= 5.0 {
        MoveClass::Good
    } else if win_percent_lost <= 10.0 {
        MoveClass::Inaccuracy
    } else if win_percent_lost <= 20.0 {
        MoveClass::Mistake
    } else {
        MoveClass::Blunder
    }
}

pub struct RatingGame {
    pub opponent: f64,
    pub score: Score,
}

/// Performance rating: average opponent rating + rating differential of score %.
pub fn calculate_performance(games: &[RatingGame]) -> f64 {
    if games.is_empty() {
        return 0.0;
    }
    let avg_opp = games.iter().map(|g| g.opponent).sum::<f64>() / games.len() as f64;
    let pct = games.iter().map(|g| g.score.value()).sum::<f64>() / games.len() as f64;
    let p = pct.clamp(0.0001, 0.9999);
    let diff = 400.0 * (p / (1.0 - p)).log10();
    (avg_opp + diff).round()
}

/// FIDE-style rating update with development coefficient.
pub fn calculate_rating(
    player: f64,
    opponent: f64,
    score: Score,
    less_than_30_games: bool,
    over_rating_2400: bool,
    over_age_18: bool,
    time_class: TimeClass,
) -> f64 {
    let k: f64 = match time_class {
        TimeClass::Rapid | TimeClass::Blitz => 20.0,
        _ => {
            if over_rating_2400 {
                10.0
            } else if less_than_30_games || (!over_age_18 && player < 2300.0) {
                40.0
            } else {
                20.0
            }
        }
    };
    let gap = opponent - player;
    let chance = 1.0 / (1.0 + 10f64.powf(gap / 400.0));
    player + (k * (score.value() - chance)).round()
}
