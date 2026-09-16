import type { FacetField } from './FacetField';

/** One row of a count list or bar chart. */
export type CountEntry = {
    /** Facet value this row filters on. */
    value: string;
    /** Text shown for the row. */
    label: string;
    field: FacetField;
    works: number;
    words: number;
    visits: number;
};
