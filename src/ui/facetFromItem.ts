import type { Facet, FacetField } from '@/stats';
import type { ChartItem } from './charts';

/** Turns a chart item id (`field:value`) back into a facet. */
export function facetFromItem(item: ChartItem): Facet {
    const split = item.id.indexOf(':');
    return {
        field: item.id.slice(0, split) as FacetField,
        value: item.id.slice(split + 1),
    };
}
