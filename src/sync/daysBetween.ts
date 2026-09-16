/** Whole days between two `YYYY-MM-DD` dates (absolute). */
export function daysBetween(a: string, b: string): number {
    const ms = Math.abs(Date.parse(a) - Date.parse(b));
    return Math.round(ms / 86_400_000);
}
