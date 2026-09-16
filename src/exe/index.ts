// Entry points are loaded by the browser, not imported. This barrel
// re-exports their bootstrap functions for the smoke test.
export { startBackground } from '@/background';
export { startContentScript } from '@/content';
export { bootDashboard } from '@/dashboard';
