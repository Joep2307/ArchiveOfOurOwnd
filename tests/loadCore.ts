import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { StatsCore } from '@/stats';
import { loadStatsCoreSync } from '@/stats';

/** The real wasm stats core, loaded from disk for tests. */
export function loadCore(): StatsCore {
    const bytes = readFileSync(
        resolve(process.cwd(), 'src/wasm/stats-core/stats_core_bg.wasm'),
    );
    return loadStatsCoreSync(bytes);
}
