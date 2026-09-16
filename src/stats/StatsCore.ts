import type { NumberSummary } from './NumberSummary';

/** The number-crunching functions implemented in Rust. */
export type StatsCore = {
    summarize(values: readonly number[]): NumberSummary;
    /** One count per edge; the last bucket is open-ended. */
    histogram(values: readonly number[], edges: readonly number[]): number[];
};
