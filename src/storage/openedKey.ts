import { OPENED_KEY_PREFIX } from './constants';

export function openedKey(username: string): string {
    return `${OPENED_KEY_PREFIX}${username}`;
}
