import type { Facet } from './Facet';
import type { Period } from './Period';

export type WorkFilter = {
    /** Free text matched against title, authors, fandoms and tags. */
    query: string;
    period: Period;
    facets: Facet[];
};
