import type { Library } from '@/model';

/** Loose shape check for data read from storage or a file. */
export function isLibrary(value: unknown): value is Library {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const candidate = value as Partial<Library>;
    return (
        candidate.version === 1 &&
        typeof candidate.username === 'string' &&
        Array.isArray(candidate.works)
    );
}
