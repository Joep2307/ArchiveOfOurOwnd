import type { Chapters } from './Chapters';

/** Parses `3/5`, `1,024/?` and similar chapter counts. */
export function parseChapters(text: string): Chapters {
    const [postedText = '', totalText = ''] = text.split('/');
    const posted = Number(postedText.replace(/[^\d]/g, '')) || 0;
    const totalDigits = totalText.replace(/[^\d]/g, '');
    return {
        posted,
        total: totalDigits ? Number(totalDigits) : null,
    };
}
