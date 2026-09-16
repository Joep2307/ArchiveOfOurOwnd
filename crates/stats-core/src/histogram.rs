//! Bucketing values into ranges.

/// Counts values into buckets defined by ascending lower `edges`.
///
/// Bucket `i` holds values `v` with `edges[i] <= v < edges[i + 1]`;
/// the last bucket is open-ended. Values below `edges[0]` and
/// non-finite values are dropped.
pub fn histogram(values: &[f64], edges: &[f64]) -> Vec<u32> {
    let mut counts = vec![0_u32; edges.len()];
    if edges.is_empty() {
        return counts;
    }
    for &value in values {
        if !value.is_finite() || value < edges[0] {
            continue;
        }
        // Index of the last edge that is <= value.
        let index = edges.partition_point(|&edge| edge <= value) - 1;
        counts[index] += 1;
    }
    counts
}
