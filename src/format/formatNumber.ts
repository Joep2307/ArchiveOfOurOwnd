const formatter = new Intl.NumberFormat('en');

/** `12345.6` → `12,346` */
export function formatNumber(value: number): string {
    return formatter.format(Math.round(value));
}
