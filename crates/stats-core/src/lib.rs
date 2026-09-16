//! wasm boundary. Logic lives in the sibling modules.

pub mod histogram;
pub mod summary;

use wasm_bindgen::prelude::*;

/// Returns `[count, sum, mean, median, min, max, p25, p75, p90,
/// std_dev]`.
#[wasm_bindgen]
pub fn summarize(values: &[f64]) -> Vec<f64> {
    summary::summarize(values).to_array().to_vec()
}

/// Returns one count per edge; see [`histogram::histogram`].
#[wasm_bindgen]
pub fn histogram(values: &[f64], edges: &[f64]) -> Vec<u32> {
    histogram::histogram(values, edges)
}
