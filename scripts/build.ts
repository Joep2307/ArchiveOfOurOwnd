/**
 * Builds the extension into dist/chrome and dist/firefox.
 *
 *   pnpm build:ext            one build
 *   pnpm dev                  rebuild on every change
 */
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build, mergeConfig, type InlineConfig } from 'vite';
import { CONTENT_SCRIPT, CONTENT_STYLE } from '../src/manifest/constants';
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

const writeManifests = {
    name: 'write-manifests',
    async closeBundle() {
        await writeTargets(await readVersion());
    },
};

/** Dashboard page and background worker, as ES modules. */
function extensionConfig(): InlineConfig {
    return mergeConfig(baseConfig, {
        configFile: false,
        mode: watch ? 'development' : 'production',
        build: {
            outDir: resolve(DIST, 'chrome'),
            emptyOutDir: false,
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
        plugins: [writeManifests],
    } satisfies InlineConfig);
}

/**
 * The AO3 content script. Browsers load content scripts as classic
 * scripts, so it is one self-contained IIFE plus its stylesheet.
 */
function contentConfig(): InlineConfig {
    return mergeConfig(baseConfig, {
        configFile: false,
        mode: watch ? 'development' : 'production',
        publicDir: false,
        build: {
            outDir: resolve(DIST, 'chrome'),
            emptyOutDir: false,
            copyPublicDir: false,
            watch: watch ? {} : null,
            minify: !watch,
            lib: {
                entry: resolve(ROOT, 'src/exe/content.ts'),
                formats: ['iife'],
                name: 'readingStatsContent',
                fileName: () => CONTENT_SCRIPT,
                cssFileName: CONTENT_STYLE.replace(/\.css$/, ''),
            },
        },
        plugins: [writeManifests],
    } satisfies InlineConfig);
}

async function main(): Promise<void> {
    await rm(resolve(DIST, 'chrome'), { recursive: true, force: true });
    await mkdir(DIST, { recursive: true });
    await build(extensionConfig());
    await build(contentConfig());
}

await main();
