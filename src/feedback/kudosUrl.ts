import { AO3_ORIGIN } from '@/parse';

/** One page of the users who left kudos on a work. */
export function kudosUrl(workId: number, page: number): string {
    return (
        `${AO3_ORIGIN}/works/${workId}/kudos` + `?page=${page}&view_adult=true`
    );
}
