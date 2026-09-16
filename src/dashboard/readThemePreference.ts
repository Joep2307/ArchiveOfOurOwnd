import type { DashboardState } from '@/app';
import { THEME_STORAGE_KEY } from './constants';

/** Theme remembered in this browser; `system` if none. */
export function readThemePreference(): DashboardState['theme'] {
    try {
        const value = localStorage.getItem(THEME_STORAGE_KEY);
        return value === 'light' || value === 'dark' ? value : 'system';
    } catch {
        return 'system';
    }
}
