import { LIBRARY_KEY_PREFIX } from './constants';

export function libraryKey(username: string): string {
    return `${LIBRARY_KEY_PREFIX}${username}`;
}
