import { createDemoLibrary } from '@/demo';
import type { Work } from '@/model';
import { parseHtml } from '@/parse';
import { loadFixture } from '../../tests/fixtures/loadFixture';
import { buildReadIndex } from './buildReadIndex';
import { clearMarks } from './clearMarks';
import { BADGE_CLASS, READ_CLASS, READ_LINK_CLASS } from './constants';
import { markReadWorks } from './markReadWorks';

function work(id: number): Work {
    const [template] = createDemoLibrary(1).works;
    if (!template) {
        throw new Error('demo library is empty');
    }
    return {
        ...template,
        key: `work-${id}`,
        id,
        lastVisited: '2024-03-05',
        visits: 3,
    };
}

function listing(): Document {
    return parseHtml(loadFixture('works-listing.html'));
}

const library = {
    version: 1 as const,
    username: 'reader_one',
    syncedAt: null,
    works: [work(1001)],
};

describe('markReadWorks', () => {
    it('marks read blurbs and links only', () => {
        const doc = listing();
        markReadWorks(doc, buildReadIndex(library, [3003]), null);

        const read = [...doc.querySelectorAll(`.${READ_CLASS}`)];
        expect(read.map((node) => node.id)).toEqual([
            'work_1001',
            'bookmark_9',
        ]);
        const links = [...doc.querySelectorAll(`.${READ_LINK_CLASS}`)];
        expect(links.map((node) => node.id)).toEqual(['rec-read']);
    });

    it('adds one badge with visit details per read blurb', () => {
        const doc = listing();
        const index = buildReadIndex(library, [3003]);
        markReadWorks(doc, index, null);
        markReadWorks(doc, index, null);

        const badges = doc.querySelectorAll(`#work_1001 .${BADGE_CLASS}`);
        expect(badges).toHaveLength(1);
        expect(badges[0]?.getAttribute('title')).toBe(
            'In your AO3 history · last opened Mar 5, 2024 · 3 visits',
        );
        expect(
            doc
                .querySelector(`#bookmark_9 .${BADGE_CLASS}`)
                ?.getAttribute('title'),
        ).toMatch(/not synced/);
    });

    it('unmarks works that are no longer in the index', () => {
        const doc = listing();
        markReadWorks(doc, buildReadIndex(library, []), null);
        markReadWorks(doc, buildReadIndex(null, []), null);
        expect(doc.querySelector(`.${READ_CLASS}`)).toBeNull();
        expect(doc.querySelector(`.${READ_LINK_CLASS}`)).toBeNull();
        expect(doc.querySelector(`.${BADGE_CLASS}`)).toBeNull();
    });

    it('badges the title of a read work page', () => {
        const doc = parseHtml(
            '<div id="workskin"><div class="preface group">' +
                '<h2 class="title heading">Home</h2></div>' +
                '<a id="next" href="/works/1001/chapters/2">Next</a>' +
                '</div>',
        );
        markReadWorks(doc, buildReadIndex(library, []), 1001);
        expect(doc.querySelector(`.title .${BADGE_CLASS}`)).not.toBeNull();
        // Links to the page you are on are not highlighted.
        expect(doc.querySelector(`.${READ_LINK_CLASS}`)).toBeNull();
    });

    it('clearMarks removes everything', () => {
        const doc = listing();
        markReadWorks(doc, buildReadIndex(library, []), null);
        clearMarks(doc);
        expect(
            doc.querySelector(
                `.${READ_CLASS}, .${READ_LINK_CLASS}, .${BADGE_CLASS}`,
            ),
        ).toBeNull();
    });
});
