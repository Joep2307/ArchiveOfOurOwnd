/**
 * `work`: a normal, visible work.
 * `deleted`: the work was deleted; only the visit date is known.
 * `mystery`: hidden in an unrevealed collection.
 */
export type WorkKind = 'work' | 'deleted' | 'mystery';
