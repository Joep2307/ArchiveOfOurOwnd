const formatter = new Intl.RelativeTimeFormat('en', {
    numeric: 'auto',
});

/** ISO timestamp → `5 minutes ago`, `yesterday`… */
export function formatRelativeTime(iso: string, now: Date): string {
    const seconds = (Date.parse(iso) - now.getTime()) / 1000;
    const steps: [Intl.RelativeTimeFormatUnit, number][] = [
        ['year', 31_536_000],
        ['month', 2_592_000],
        ['day', 86_400],
        ['hour', 3_600],
        ['minute', 60],
    ];
    for (const [unit, size] of steps) {
        if (Math.abs(seconds) >= size) {
            return formatter.format(Math.round(seconds / size), unit);
        }
    }
    return 'just now';
}
