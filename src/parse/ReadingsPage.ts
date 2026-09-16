import type { Work } from '@/model';

/** Everything read from one page of `/users/<name>/readings`. */
export type ReadingsPage = {
    username: string | null;
    /** `false` when AO3 showed a login form instead. */
    loggedIn: boolean;
    lastPage: number;
    works: Work[];
};
