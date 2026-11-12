use std::time::{SystemTime, UNIX_EPOCH};

fn civil_from_days(z: i64) -> (i64, u32, u32) {
    let z = z + 719468;
    let era = if z >= 0 { z } else { z - 146096 } / 146097;
    let doe = z - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    (if m <= 2 { y + 1 } else { y }, m as u32, d as u32)
}

fn main() {
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;
    let (y, m, d) = civil_from_days(secs / 86400);
    let rem = secs.rem_euclid(86400);
    let stamp = format!(
        "{:04}.{:02}.{:02}.{:02}.{:02}.{:02}",
        y,
        m,
        d,
        rem / 3600,
        (rem % 3600) / 60,
        rem % 60
    );
    println!("cargo:rustc-env=BUILD_STAMP={stamp}");
    println!("cargo:rerun-if-changed=build.rs");
}
