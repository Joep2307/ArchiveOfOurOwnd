import { renderRankTools } from './renderRankTools';
import { renderSection } from './renderSection';
import { renderTopList } from './renderTopList';
import type { ViewContext } from './ViewContext';

/** Top authors, fandoms, ships, characters and series. */
export function renderTopLists(context: ViewContext): HTMLElement {
    const { stats } = context;
    const section = renderSection(
        'people',
        'Favourites',
        renderTopList(context, 'top-authors', 'Authors', stats.authors),
        renderTopList(context, 'top-fandoms', 'Fandoms', stats.fandoms),
        renderTopList(
            context,
            'top-ships',
            'Relationships',
            stats.relationships,
        ),
        renderTopList(
            context,
            'top-characters',
            'Characters',
            stats.characters,
        ),
        renderTopList(context, 'top-series', 'Series', stats.series),
    );
    section.querySelector('.section__title')?.after(renderRankTools(context));
    return section;
}
