import { AO3_ORIGIN } from '@/parse';

export function readingsUrl(username: string, page: number): string {
    const user = encodeURIComponent(username);
    return `${AO3_ORIGIN}/users/${user}/readings?page=${page}`;
}
