/** Parses `1,234` style numbers; returns 0 for anything else. */
export function parseCount(text: string | null | undefined): number {
    if (!text) {
        return 0;
    }
    const digits = text.replace(/[^\d]/g, '');
    return digits ? Number(digits) : 0;
}
