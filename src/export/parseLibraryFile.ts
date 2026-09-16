import type { Library } from '@/model';
import { isLibrary } from '@/storage';

/** Reads an exported JSON file; throws a readable error. */
export function parseLibraryFile(text: string): Library {
    let data: unknown;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error('That file is not valid JSON.');
    }
    if (!isLibrary(data)) {
        throw new Error('That file is not an export from this extension.');
    }
    return data;
}
