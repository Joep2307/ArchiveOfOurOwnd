import { NAV_CLASS, NAV_SELECTORS } from './constants';

/**
 * Adds a link to the AO3 header that opens the dashboard, or updates
 * its label. Does nothing on pages without a header.
 */
export function setDashboardLink(
    doc: Document,
    label: string,
    onOpen: () => void,
): void {
    const existing = doc.querySelector(`.${NAV_CLASS} a`);
    if (existing) {
        if (existing.textContent !== label) {
            existing.textContent = label;
        }
        return;
    }
    const nav = NAV_SELECTORS.map((selector) =>
        doc.querySelector(selector),
    ).find((found) => found !== null);
    if (!nav) {
        return;
    }
    const item = doc.createElement('li');
    item.className = NAV_CLASS;
    const link = doc.createElement('a');
    link.href = '#';
    link.textContent = label;
    link.title = 'Open the Reading Stats dashboard';
    link.addEventListener('click', (event) => {
        event.preventDefault();
        onOpen();
    });
    item.append(link);
    nav.append(item);
}
