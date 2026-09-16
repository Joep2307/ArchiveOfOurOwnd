import type { Work } from '@/model';
import type { FacetField } from './FacetField';
import { wordBucketOf } from './wordBucketOf';

/** The values a work has for a facet (may be several or none). */
export function facetValues(work: Work, field: FacetField): string[] {
    if (work.kind !== 'work') {
        switch (field) {
            case 'visitedYear':
                return work.lastVisited ? [work.lastVisited.slice(0, 4)] : [];
            case 'visitedMonth':
                return work.lastVisited ? [work.lastVisited.slice(0, 7)] : [];
            default:
                return [];
        }
    }
    switch (field) {
        case 'fandom':
            return work.fandoms;
        case 'author':
            return work.anonymous
                ? ['Anonymous']
                : work.authors.map((author) => author.user);
        case 'relationship':
            return work.relationships;
        case 'character':
            return work.characters;
        case 'freeform':
            return work.freeforms;
        case 'warning':
            return work.warnings;
        case 'rating':
            return [work.rating];
        case 'category':
            return work.categories.length > 0
                ? work.categories
                : ['No category'];
        case 'language':
            return work.language ? [work.language] : [];
        case 'series':
            return work.series.map((series) => series.title);
        case 'status':
            return [work.complete ? 'Complete' : 'In progress'];
        case 'wordBucket':
            return [wordBucketOf(work.words)];
        case 'visitedYear':
            return work.lastVisited ? [work.lastVisited.slice(0, 4)] : [];
        case 'visitedMonth':
            return work.lastVisited ? [work.lastVisited.slice(0, 7)] : [];
        case 'updatedYear':
            return work.updated ? [work.updated.slice(0, 4)] : [];
    }
}
