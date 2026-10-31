use anyhow::Result;
use chess_core::Color;
mod nnue;
use nnue::{
    backward, collect_examples, evaluate, output_score, Weights, WeightGrads,
};
use std::path::Path;

const LEARNING_RATE: f32 = 0.01;
const BATCH_SIZE: usize = 256;
const EPOCHS: usize = 5;
const WEIGHTS_PATH: &str = "nnue_weights.bin";

fn mse_loss(target: f32, output: i32) -> f32 {
    let pred = output as f32 / 600.0;
    (pred - target).powi(2)
}

fn d_mse_loss(target: f32, output: i32) -> f32 {
    let pred = output as f32 / 600.0;
    2.0 * (pred - target) / 600.0
}

fn train(examples: &[nnue::TrainingExample], weights: &mut Weights) -> f32 {
    let n = examples.len();
    if n == 0 {
        return 0.0;
    }

    let mut total_loss = 0.0;

    for epoch in 0..EPOCHS {
        let mut grads = WeightGrads::new();
        let mut batch_count = 0;
        let mut epoch_loss = 0.0;

        for (i, ex) in examples.iter().enumerate() {
            let cache_w = evaluate(&ex.acc_white, weights);
            let cache_b = evaluate(&ex.acc_black, weights);

            let output = if ex.side_to_move == Color::White {
                output_score(&cache_w) - output_score(&cache_b)
            } else {
                output_score(&cache_b) - output_score(&cache_w)
            };

            let loss = mse_loss(ex.target, output);
            epoch_loss += loss;

            let d_out = d_mse_loss(ex.target, output);

            if ex.side_to_move == Color::White {
                let g_w = backward(&cache_w, weights, d_out);
                let g_b = backward(&cache_b, weights, -d_out);
                grads.accumulate(&g_w);
                grads.accumulate(&g_b);
            } else {
                let g_b = backward(&cache_b, weights, d_out);
                let g_w = backward(&cache_w, weights, -d_out);
                grads.accumulate(&g_b);
                grads.accumulate(&g_w);
            }

            batch_count += 1;

            if batch_count >= BATCH_SIZE || i == n - 1 {
                grads.apply(weights, LEARNING_RATE);
                grads.clear();
                batch_count = 0;
            }
        }

        epoch_loss /= n as f32;
        println!(
            "Epoch {}: loss={:.4} ({} examples)",
            epoch, epoch_loss, n
        );
        total_loss = epoch_loss;

        weights.save(Path::new(WEIGHTS_PATH)).unwrap();
        println!("  Checkpoint saved to {}", WEIGHTS_PATH);
    }

    total_loss
}

fn main() -> Result<()> {
    let pgn_dir = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "../crates/games/pgn".to_string());

    let pgn_path = Path::new(&pgn_dir);
    if !pgn_path.exists() {
        anyhow::bail!("PGN directory does not exist: {:?}", pgn_path);
    }

    let mut weights = if Path::new(WEIGHTS_PATH).exists() {
        println!("Loading existing weights from {}", WEIGHTS_PATH);
        Weights::load(Path::new(WEIGHTS_PATH))?
    } else {
        println!("Initializing new weights");
        Weights::new()
    };

    println!("Collecting training examples from {:?}...", pgn_path);
    let examples = collect_examples(pgn_path, None)?;
    println!("Collected {} examples", examples.len());

    if examples.is_empty() {
        anyhow::bail!("No training examples collected");
    }

    println!("Training for {} epochs...", EPOCHS);
    let loss = train(&examples, &mut weights);
    println!("Final loss: {:.4}", loss);

    weights.save(Path::new(WEIGHTS_PATH))?;
    println!("Final weights saved to {}", WEIGHTS_PATH);

    Ok(())
}
