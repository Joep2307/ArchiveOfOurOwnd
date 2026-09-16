import type { FacetField } from './FacetField';

/** One active filter: works whose `field` includes `value`. */
export type Facet = {
    field: FacetField;
    value: string;
};
