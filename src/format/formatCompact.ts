const formatter = new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

/** `12345` → `12.3K` */
export function formatCompact(value: number): string {
    return formatter.format(value);
}
