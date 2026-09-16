import type { NumberSummary } from './NumberSummary';
import type { StatsCore } from './StatsCore';

export type StatsCoreBindings = {
    summarize(values: Float64Array): Float64Array;
    histogram(values: Float64Array, edges: Float64Array): Uint32Array;
};

/** Wraps the generated wasm bindings in typed functions. */
export function createStatsCore(bindings: StatsCoreBindings): StatsCore {
    return {
        summarize(values): NumberSummary {
            const out = bindings.summarize(Float64Array.from(values));
            const at = (index: number): number => out[index] ?? 0;
            return {
                count: at(0),
                sum: at(1),
                mean: at(2),
                median: at(3),
                min: at(4),
                max: at(5),
                p25: at(6),
                p75: at(7),
                p90: at(8),
                stdDev: at(9),
            };
        },
        histogram(values, edges): number[] {
            return Array.from(
                bindings.histogram(
                    Float64Array.from(values),
                    Float64Array.from(edges),
                ),
            );
        },
    };
}
