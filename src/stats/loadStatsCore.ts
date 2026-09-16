import init, { histogram, summarize } from '@/wasm/stats-core/stats_core.js';
import { createStatsCore } from './createStatsCore';
import type { StatsCore } from './StatsCore';

let loading: Promise<StatsCore> | null = null;

/** Loads the wasm module once and returns the stats functions. */
export function loadStatsCore(): Promise<StatsCore> {
    loading ??= init().then(() => createStatsCore({ histogram, summarize }));
    return loading;
}
