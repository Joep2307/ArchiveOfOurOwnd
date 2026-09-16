/**
 * Builds the extension into dist/chrome and dist/firefox.
 *
 *   pnpm build:ext            one build
 *   pnpm dev                  rebuild on every change
 */
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build, mergeConfig, type InlineConfig } from 'vite';
import { createManifest } from '../src/manifest/createManifest';
import type { BrowserTarget } from '../src/manifest/BrowserTarget';
import baseConfig from '../vite.config';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = resolve(ROOT, 'dist');
const TARGETS: BrowserTarget[] = ['chrome', 'firefox'];
const watch = process.argv.includes('--watch');

async function readVersion(): Promise<string> {
    const pkg = JSON.parse(
        await readFile(resolve(ROOT, 'package.json'), 'utf8'),
    ) as { version: string };
    return pkg.version;
}

async function writeTargets(version: string): Promise<void> {
    const source = resolve(DIST, 'chrome');
    for (const target of TARGETS) {
        const folder = resolve(DIST, target);
        if (target !== 'chrome') {
            await rm(folder, { recursive: true, force: true });
            await cp(source, folder, { recursive: true });
        }
        await writeFile(
            resolve(folder, 'manifest.json'),
            `${JSON.stringify(createManifest(target, version), null, 4)}\n`,
        );
    }
    console.log(`✓ dist/chrome and dist/firefox (v${version})`);
}

async function main(): Promise<void> {
    const version = await readVersion();
    await mkdir(DIST, { recursive: true });

    const config: InlineConfig = mergeConfig(baseConfig, {
        configFile: false,
        mode: watch ? 'development' : 'production',
        build: {
            outDir: resolve(DIST, 'chrome'),
            watch: watch ? {} : null,
            minify: !watch,
            rollupOptions: {
                input: {
                    dashboard: resolve(ROOT, 'src/exe/dashboard.html'),
                    background: resolve(ROOT, 'src/exe/background.ts'),
                },
                output: {
                    entryFileNames: '[name].js',
                    chunkFileNames: 'chunks/[name]-[hash].js',
                    assetFileNames: 'assets/[name]-[hash][extname]',
                },
            },
        },
        plugins: [
            {
                name: 'write-manifests',
                async closeBundle() {
                    await writeTargets(version);
                },
            },
        ],
    } satisfies InlineConfig);

    await build(config);
}

await main();
