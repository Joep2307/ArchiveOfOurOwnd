//! Descriptive statistics over a slice of numbers.

/// Summary of a list of values. All fields are 0 for an empty list.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Summary {
    pub count: f64,
    pub sum: f64,
    pub mean: f64,
    pub median: f64,
    pub min: f64,
    pub max: f64,
    pub p25: f64,
    pub p75: f64,
    pub p90: f64,
    pub std_dev: f64,
}

impl Summary {
    /// Flat layout used across the wasm boundary.
    pub fn to_array(self) -> [f64; 10] {
        [
            self.count,
            self.sum,
            self.mean,
            self.median,
            self.min,
            self.max,
            self.p25,
            self.p75,
            self.p90,
            self.std_dev,
        ]
    }
}

/// Linear-interpolated percentile of an already sorted slice.
/// `q` is in 0..=1.
pub fn percentile(sorted: &[f64], q: f64) -> f64 {
    if sorted.is_empty() {
        return 0.0;
    }
    let q = q.clamp(0.0, 1.0);
    let pos = q * (sorted.len() - 1) as f64;
    let lower = pos.floor() as usize;
    let upper = pos.ceil() as usize;
    let weight = pos - lower as f64;
    sorted[lower] + (sorted[upper] - sorted[lower]) * weight
}

/// Computes the summary. Non-finite values are ignored.
pub fn summarize(values: &[f64]) -> Summary {
    let mut sorted: Vec<f64> =
        values.iter().copied().filter(|v| v.is_finite()).collect();
    if sorted.is_empty() {
        return Summary::default();
    }
    sorted.sort_by(|a, b| a.total_cmp(b));

    let count = sorted.len() as f64;
    let sum: f64 = sorted.iter().sum();
    let mean = sum / count;
    let variance =
        sorted.iter().map(|v| (v - mean).powi(2)).sum::<f64>() / count;

    Summary {
        count,
        sum,
        mean,
        median: percentile(&sorted, 0.5),
        min: sorted[0],
        max: sorted[sorted.len() - 1],
        p25: percentile(&sorted, 0.25),
        p75: percentile(&sorted, 0.75),
        p90: percentile(&sorted, 0.9),
        std_dev: variance.sqrt(),
    }
}
