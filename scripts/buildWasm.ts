import { execFileSync } from 'node:child_process';

/** Compiles `crates/stats-core` into `src/wasm/stats-core`. */
execFileSync(
    'wasm-pack',
    [
        'build',
        'crates/stats-core',
        '--target',
        'web',
        '--release',
        '--no-pack',
        '--out-dir',
        '../../src/wasm/stats-core',
    ],
    { stdio: 'inherit' },
);
