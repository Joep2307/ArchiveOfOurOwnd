/** Escapes one CSV value. */
export function csvCell(value: string | number | boolean): string {
    const text = String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
