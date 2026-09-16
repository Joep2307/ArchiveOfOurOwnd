import { OPEN_DASHBOARD_MESSAGE } from './constants';

export function isOpenDashboardMessage(message: unknown): boolean {
    return (
        typeof message === 'object' &&
        message !== null &&
        (message as { type?: unknown }).type === OPEN_DASHBOARD_MESSAGE
    );
}
