import type { DashboardState } from '@/app';
import { THEME_STORAGE_KEY } from './constants';

export function writeThemePreference(theme: DashboardState['theme']): void {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Storage can be unavailable; the theme just won't persist.
    }
}
