import type { Work } from '@/model';
import { AO3_ORIGIN } from '@/parse';

/** Link to the work on AO3, or `null` for deleted works. */
export function workUrl(work: Work): string | null {
    return work.id === null ? null : `${AO3_ORIGIN}/works/${work.id}`;
}
