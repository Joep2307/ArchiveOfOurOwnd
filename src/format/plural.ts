/** `plural(1, 'work')` → `1 work`; `plural(3, 'work')` → `3 works` */
export function plural(
    count: number,
    singular: string,
    pluralForm = `${singular}s`,
): string {
    const formatted = new Intl.NumberFormat('en').format(count);
    return `${formatted} ${count === 1 ? singular : pluralForm}`;
}
