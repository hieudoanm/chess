use anyhow::Result;
use chess_core::Color;
mod nnue;
use nnue::{
    backward_f32, collect_examples, evaluate_f32, tanh_output, F32WeightGrads, F32Weights,
};
use std::path::Path;

const LEARNING_RATE: f32 = 0.02;
const BATCH_SIZE: usize = 256;
const EPOCHS: usize = 100;
const SCALE_TANH: f32 = 1707.0;
const WEIGHTS_PATH: &str = "nnue_weights.bin";

fn train(examples: &[nnue::TrainingExample], weights: &mut F32Weights) -> f32 {
    let n = examples.len();
    if n == 0 {
        return 0.0;
    }

    let mut total_loss = 0.0;

    for epoch in 0..EPOCHS {
        let mut grads = F32WeightGrads::new();
        let mut batch_count = 0;
        let mut epoch_loss = 0.0;

        for (i, ex) in examples.iter().enumerate() {
            let cache_w = evaluate_f32(&ex.acc_white, weights);
            let cache_b = evaluate_f32(&ex.acc_black, weights);

            let raw = if ex.side_to_move == Color::White {
                cache_w.output - cache_b.output
            } else {
                cache_b.output - cache_w.output
            };

            let pred = tanh_output(raw, SCALE_TANH);
            let target = if ex.target > 0.75 {
                1.0f32
            } else if ex.target < 0.25 {
                -1.0f32
            } else {
                0.0f32
            };

            let loss = (pred - target).powi(2);
            epoch_loss += loss;

            let d_out = 2.0 * (pred - target) * (1.0 - pred * pred) / SCALE_TANH;

            if ex.side_to_move == Color::White {
                let g_w = backward_f32(&cache_w, weights, d_out);
                let g_b = backward_f32(&cache_b, weights, -d_out);
                grads.accumulate(&g_w);
                grads.accumulate(&g_b);
            } else {
                let g_b = backward_f32(&cache_b, weights, d_out);
                let g_w = backward_f32(&cache_w, weights, -d_out);
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

        let i8_weights = weights.to_i8();
        i8_weights.save(Path::new(WEIGHTS_PATH)).unwrap();
        println!("  Checkpoint saved to {}", WEIGHTS_PATH);
    }

    total_loss
}

fn main() -> Result<()> {
    let pgn_dir = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "../crates/games/pgn".to_string());

    let max_games: Option<usize> = std::env::args()
        .nth(2)
        .and_then(|s| s.parse().ok());

    let pgn_path = Path::new(&pgn_dir);
    if !pgn_path.exists() {
        anyhow::bail!("PGN directory does not exist: {:?}", pgn_path);
    }

    let mut weights = if Path::new(WEIGHTS_PATH).exists() {
        println!("Loading existing weights from {}", WEIGHTS_PATH);
        let i8_weights = nnue::Weights::load(Path::new(WEIGHTS_PATH))?;
        F32Weights::from_i8(&i8_weights)
    } else {
        println!("Initializing new weights");
        let i8_weights = nnue::Weights::new();
        F32Weights::from_i8(&i8_weights)
    };

    println!("Collecting training examples from {:?}...", pgn_path);
    let examples = collect_examples(pgn_path, max_games)?;
    println!("Collected {} examples", examples.len());

    if examples.is_empty() {
        anyhow::bail!("No training examples collected");
    }

    println!("Training for {} epochs...", EPOCHS);
    let loss = train(&examples, &mut weights);
    println!("Final loss: {:.4}", loss);

    let i8_weights = weights.to_i8();
    i8_weights.save(Path::new(WEIGHTS_PATH))?;
    println!("Final weights saved to {}", WEIGHTS_PATH);

    Ok(())
}
