import { createInitialState } from '@/app/createInitialState';
import type { DashboardController } from '@/app';
import { createDemoLibrary } from '@/demo';
import { computeStats } from '@/stats';
import { loadCore } from '../../tests/loadCore';
import { renderStandouts } from './renderStandouts';
import { renderHighlights } from './renderHighlights';
import { renderTopList } from './renderTopList';
import { renderGenres } from './renderGenres';

function fixture() {
    const state = createInitialState(true);
    state.library = createDemoLibrary(150);
    const stats = computeStats(state.library.works, loadCore());
    const controller = {
        toggleExpanded: (id: string) => {
            state.expanded[id] = !state.expanded[id];
        },
        toggleFacet: vi.fn(),
        reviewWork: vi.fn(),
    } as unknown as DashboardController;
    return { state, stats, controller };
}

function more(root: HTMLElement): HTMLButtonElement {
    const button = [...root.querySelectorAll('button')].find((item) =>
        /Show more|Show fewer/.test(item.textContent),
    );
    if (!button) throw new Error('Missing expansion button');
    return button;
}

describe('expandable rankings', () => {
    it('expands standouts independently and keeps reviews available', () => {
        const context = fixture();
        let view = renderStandouts(context);
        expect(view.querySelectorAll('ol')[0]?.children).toHaveLength(10);
        more(view).click();
        view = renderStandouts(context);
        const rows = view.querySelectorAll('ol')[0]?.children;
        expect(rows).toHaveLength(context.stats.mostVisited.length);
        expect(rows?.[10]?.querySelector('details')).not.toBeNull();
        expect(view.querySelectorAll('ol')[1]?.children).toHaveLength(10);
        expect(more(view).getAttribute('aria-expanded')).toBe('true');
        more(view).click();
        view = renderStandouts(context);
        expect(view.querySelectorAll('ol')[0]?.children).toHaveLength(10);
    });

    it('reveals rankings beyond the old 100 item limit', () => {
        const context = fixture();
        const template = context.stats.authors[0];
        if (!template) throw new Error('Missing author');
        const entries = Array.from({ length: 125 }, (_, i) => ({
            ...template,
            value: String(i),
            label: `Author ${i}`,
        }));
        const render = () =>
            renderTopList(context, 'authors', 'Authors', entries);
        expect(render().querySelectorAll('li')).toHaveLength(10);
        more(render()).click();
        expect(render().querySelectorAll('li')).toHaveLength(125);
        expect(more(render()).textContent).toBe('Show fewer');
    });

    it('expands highlights and truncated genre lists', () => {
        const context = fixture();
        more(renderHighlights(context)).click();
        expect(
            renderHighlights(context).querySelector('ol')?.children,
        ).toHaveLength(context.stats.freeforms.length);
        const template = context.stats.languages[0];
        if (!template) throw new Error('Missing language');
        context.stats.languages = Array.from({ length: 12 }, (_, i) => ({
            ...template,
            value: String(i),
            label: `Language ${i}`,
        }));
        const languagePanel = () => {
            const list = renderGenres(context).querySelector(
                'ol[aria-label="Works per language"]',
            );
            if (!list?.parentElement) throw new Error('Missing languages');
            return list.parentElement;
        };
        expect(languagePanel().querySelectorAll('li')).toHaveLength(8);
        more(languagePanel()).click();
        expect(languagePanel().querySelectorAll('li')).toHaveLength(12);
        context.stats.languages = [template];
        expect(languagePanel().querySelector('.link-button')).toBeNull();
    });
});
