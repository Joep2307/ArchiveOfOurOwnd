import type { WorkFilter } from './WorkFilter';

export function emptyFilter(): WorkFilter {
    return { query: '', period: 'all', facets: [] };
}
