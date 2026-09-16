/**
 * Packs dist/chrome and dist/firefox into zip files for sharing or
 * uploading to the stores. Run `pnpm build` first.
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { zipSync, type Zippable } from 'fflate';

const DIST = resolve(import.meta.dirname, '..', 'dist');

async function collect(folder: string, into: Zippable, base: string) {
    for (const name of await readdir(folder)) {
        const path = resolve(folder, name);
        if ((await stat(path)).isDirectory()) {
            await collect(path, into, base);
        } else {
            const key = relative(base, path).split('\\').join('/');
            into[key] = new Uint8Array(await readFile(path));
        }
    }
}

for (const target of ['chrome', 'firefox']) {
    const folder = resolve(DIST, target);
    const files: Zippable = {};
    await collect(folder, files, folder);
    const out = resolve(DIST, `reading-stats-${target}.zip`);
    await writeFile(out, zipSync(files, { level: 9 }));
    console.log(`✓ ${relative(process.cwd(), out)}`);
}
