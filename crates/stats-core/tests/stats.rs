use stats_core::histogram::histogram;
use stats_core::summary::{percentile, summarize};

#[test]
fn summary_of_empty_is_zero() {
    let s = summarize(&[]);
    assert_eq!(s.count, 0.0);
    assert_eq!(s.mean, 0.0);
}

#[test]
fn summary_of_values() {
    let s = summarize(&[4.0, 1.0, 3.0, 2.0, f64::NAN]);
    assert_eq!(s.count, 4.0);
    assert_eq!(s.sum, 10.0);
    assert_eq!(s.mean, 2.5);
    assert_eq!(s.median, 2.5);
    assert_eq!(s.min, 1.0);
    assert_eq!(s.max, 4.0);
    assert!((s.std_dev - 1.118_034).abs() < 1e-6);
}

#[test]
fn percentile_interpolates() {
    let sorted = [10.0, 20.0, 30.0, 40.0, 50.0];
    assert_eq!(percentile(&sorted, 0.25), 20.0);
    assert_eq!(percentile(&sorted, 0.9), 46.0);
}

#[test]
fn histogram_buckets() {
    let counts = histogram(
        &[-1.0, 0.0, 999.0, 1000.0, 5000.0, 1e6],
        &[0.0, 1000.0, 10000.0],
    );
    assert_eq!(counts, vec![2, 2, 1]);
}
