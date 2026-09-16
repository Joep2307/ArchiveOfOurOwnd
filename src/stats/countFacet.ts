import type { Work } from '@/model';
import type { CountEntry } from './CountEntry';
import type { FacetField } from './FacetField';
import { facetValues } from './facetValues';

export type CountOptions = {
    /** Fixed order of values; others are appended by count. */
    order?: readonly string[];
    /** Keep values in `order` even when their count is 0. */
    keepEmpty?: boolean;
    label?: (value: string) => string;
};

/**
 * Counts works per value of a facet, sorted by works (then words),
 * unless `order` is given.
 */
export function countFacet(
    works: readonly Work[],
    field: FacetField,
    options: CountOptions = {},
): CountEntry[] {
    const { order, keepEmpty = false, label = (v): string => v } = options;
    const rows = new Map<string, CountEntry>();
    const row = (value: string): CountEntry => {
        let entry = rows.get(value);
        if (!entry) {
            entry = {
                value,
                label: label(value),
                field,
                works: 0,
                words: 0,
                visits: 0,
            };
            rows.set(value, entry);
        }
        return entry;
    };

    if (order && keepEmpty) {
        order.forEach((value) => row(value));
    }
    for (const work of works) {
        for (const value of new Set(facetValues(work, field))) {
            const entry = row(value);
            entry.works += 1;
            entry.words += work.words;
            entry.visits += work.visits;
        }
    }

    const byCount = (a: CountEntry, b: CountEntry): number =>
        b.works - a.works ||
        b.words - a.words ||
        a.label.localeCompare(b.label);
    const all = [...rows.values()];
    if (!order) {
        return all.sort(byCount);
    }
    const ordered = order
        .map((value) => rows.get(value))
        .filter((entry): entry is CountEntry => entry !== undefined);
    const rest = all
        .filter((entry) => !order.includes(entry.value))
        .sort(byCount);
    return [...ordered, ...rest];
}
