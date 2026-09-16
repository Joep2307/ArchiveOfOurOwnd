import type { Work } from '@/model';
import { facetValues } from './facetValues';
import { matchesPeriod } from './matchesPeriod';
import { searchText } from './searchText';
import type { WorkFilter } from './WorkFilter';

/** Works matching every part of the filter. */
export function filterWorks(
    works: readonly Work[],
    filter: WorkFilter,
    today: Date,
): Work[] {
    const terms = filter.query
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);
    return works.filter((work) => {
        if (!matchesPeriod(work, filter.period, today)) {
            return false;
        }
        for (const facet of filter.facets) {
            if (!facetValues(work, facet.field).includes(facet.value)) {
                return false;
            }
        }
        if (terms.length > 0) {
            const text = searchText(work);
            return terms.every((term) => text.includes(term));
        }
        return true;
    });
}
