const formatter = new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

/** `2024-03-05` → `Mar 5, 2024`; `—` for `null`. */
export function formatDate(iso: string | null): string {
    if (!iso) {
        return '—';
    }
    const date = new Date(`${iso.slice(0, 10)}T12:00:00`);
    return Number.isNaN(date.getTime()) ? iso : formatter.format(date);
}
