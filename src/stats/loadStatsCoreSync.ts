import {
    histogram,
    initSync,
    summarize,
} from '@/wasm/stats-core/stats_core.js';
import { createStatsCore } from './createStatsCore';
import type { StatsCore } from './StatsCore';

/** Loads the wasm module from bytes (tests, Node). */
export function loadStatsCoreSync(bytes: BufferSource): StatsCore {
    initSync({ module: bytes });
    return createStatsCore({ histogram, summarize });
}
