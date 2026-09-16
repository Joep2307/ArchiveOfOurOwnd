import { LIBRARY_VERSION } from './constants';
import type { Library } from './Library';

export function createEmptyLibrary(username: string): Library {
    return {
        version: LIBRARY_VERSION,
        username,
        syncedAt: null,
        works: [],
    };
}
