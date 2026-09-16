import { createDemoLibrary } from '@/demo';
import { csvCell } from './csvCell';
import { parseLibraryFile } from './parseLibraryFile';
import { worksToCsv } from './worksToCsv';

describe('export', () => {
    it('escapes CSV cells', () => {
        expect(csvCell('plain')).toBe('plain');
        expect(csvCell('a, "b"')).toBe('"a, ""b"""');
    });

    it('writes one row per work', () => {
        const library = createDemoLibrary(20);
        const lines = worksToCsv(library.works).trim().split('\r\n');
        expect(lines).toHaveLength(21);
        expect(lines[0]).toMatch(/^id,type,title/);
    });

    it('round-trips JSON and rejects junk', () => {
        const library = createDemoLibrary(5);
        expect(parseLibraryFile(JSON.stringify(library))).toEqual(library);
        expect(() => parseLibraryFile('{')).toThrow(/valid JSON/);
        expect(() => parseLibraryFile('{"a":1}')).toThrow(/export/);
    });
});
