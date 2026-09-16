import type { Facet, FacetField } from '@/stats';
import { formatDate } from '@/format';

const FIELD_LABELS: Record<FacetField, string> = {
    fandom: 'Fandom',
    author: 'Author',
    relationship: 'Ship',
    character: 'Character',
    freeform: 'Tag',
    warning: 'Warning',
    rating: 'Rating',
    category: 'Category',
    language: 'Language',
    series: 'Series',
    status: 'Status',
    wordBucket: 'Length',
    visitedYear: 'Visited in',
    visitedMonth: 'Visited in',
    updatedYear: 'Updated in',
};

/** `Fandom: Star Trek` style text for a filter chip. */
export function facetLabel(facet: Facet): string {
    const value =
        facet.field === 'visitedMonth'
            ? formatDate(`${facet.value}-01`).replace(/ \d+,/, '')
            : facet.value;
    return `${FIELD_LABELS[facet.field]}: ${value}`;
}
