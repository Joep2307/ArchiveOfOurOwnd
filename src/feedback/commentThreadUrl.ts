import { AO3_ORIGIN } from '@/parse';

/** A single comment thread, for replies AO3 cuts off in the list. */
export function commentThreadUrl(commentId: number): string {
    return `${AO3_ORIGIN}/comments/${commentId}?view_adult=true`;
}
