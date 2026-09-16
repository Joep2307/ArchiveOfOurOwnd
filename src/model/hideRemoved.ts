import type { Library } from './Library';

/** The library without the works the reader removed. */
export function hideRemoved(library: Library): Library {
    const removed = new Set(library.removed ?? []);
    if (removed.size === 0) {
        return library;
    }
    return {
        ...library,
        works: library.works.filter((work) => !removed.has(work.key)),
    };
}
