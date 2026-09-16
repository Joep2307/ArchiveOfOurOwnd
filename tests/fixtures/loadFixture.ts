import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Reads a file from `tests/fixtures` as text. */
export function loadFixture(name: string): string {
    return readFileSync(
        resolve(process.cwd(), 'tests', 'fixtures', name),
        'utf8',
    );
}
