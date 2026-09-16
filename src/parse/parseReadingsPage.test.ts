import { loadFixture } from '../../tests/fixtures/loadFixture';
import { parseHtml } from './parseHtml';
import { parseReadingsPage } from './parseReadingsPage';

const NOW = new Date(2026, 8, 16, 12, 0, 0);

describe('parseReadingsPage', () => {
    const page = parseReadingsPage(
        parseHtml(loadFixture('readings-page.html')),
        NOW,
        1,
    );

    it('reads user and pagination', () => {
        expect(page.username).toBe('reader_one');
        expect(page.loggedIn).toBe(true);
        expect(page.lastPage).toBe(41);
        expect(page.works).toHaveLength(4);
    });

    it('parses a full work', () => {
        const work = page.works[0];
        expect(work).toMatchObject({
            key: 'work-1001',
            kind: 'work',
            id: 1001,
            title: 'The Long Way Home',
            authors: [
                { user: 'quill', pseud: 'Quill Writes' },
                { user: 'inkpot', pseud: 'inkpot' },
            ],
            anonymous: false,
            fandoms: ['Star Trek', 'Star Wars'],
            rating: 'Teen And Up Audiences',
            categories: ['F/M', 'M/M'],
            warnings: ['No Archive Warnings Apply'],
            relationships: ['Alpha/Beta', 'Charlie/Delta'],
            characters: ['Alpha', 'Beta'],
            freeforms: ['Fluff', 'Slow Burn'],
            language: 'English',
            words: 12345,
            chaptersPosted: 3,
            chaptersTotal: null,
            complete: false,
            kudos: 1203,
            comments: 45,
            bookmarks: 88,
            hits: 20001,
            series: [{ id: 77, title: 'Roads', part: 2 }],
            summary: 'Two friends take the scenic route.',
            updated: '2024-03-05',
            lastVisited: '2026-09-13',
            visits: 7,
            updateAvailable: true,
            markedForLater: false,
        });
    });

    it('parses an anonymous work with hidden warnings', () => {
        const work = page.works[1];
        expect(work).toMatchObject({
            anonymous: true,
            authors: [],
            rating: 'Explicit',
            categories: ['F/F'],
            warnings: [],
            complete: true,
            language: 'Deutsch',
            words: 980,
            chaptersPosted: 1,
            chaptersTotal: 1,
            kudos: 0,
            lastVisited: '2021-02-01',
            visits: 1,
            markedForLater: true,
        });
    });

    it('parses deleted and mystery works', () => {
        expect(page.works[2]).toMatchObject({
            key: 'deleted-1-2',
            kind: 'deleted',
            id: null,
            lastVisited: '2018-07-14',
            visits: 1,
        });
        expect(page.works[3]).toMatchObject({
            key: 'work-1004',
            kind: 'mystery',
            lastVisited: '2026-09-16',
            visits: 1024,
        });
    });

    it('detects a logged-out page', () => {
        const out = parseReadingsPage(
            parseHtml(loadFixture('logged-out.html')),
            NOW,
            1,
        );
        expect(out.loggedIn).toBe(false);
        expect(out.works).toHaveLength(0);
        expect(out.lastPage).toBe(1);
    });
});
