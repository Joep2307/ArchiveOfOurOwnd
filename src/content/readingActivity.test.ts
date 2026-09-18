import { createDemoLibrary } from '@/demo';
import { createMemoryStorage, saveLibrary, loadLibrary } from '@/storage';
import { computeStats } from '@/stats';
import { loadCore } from '../../tests/loadCore';
import { savedConnection } from '@/connection/savedConnection';
import {
    activityKey,
    applyActivity,
    saveActivity,
    type ReadingActivity,
} from './readingActivity';

function fixture() {
    const library = createDemoLibrary(1);
    const work = library.works[0];
    if (!work) throw new Error('Missing work');
    Object.assign(work, {
        kind: 'work',
        id: 42,
        key: 'work-42',
        words: 1000,
        chaptersPosted: 2,
    });
    return library;
}
const progress = (
    activeMs: number,
    chapters: Record<string, boolean> = { '1': true, '2': true },
): Record<string, ReadingActivity> => ({
    'work-42': {
        activeMs,
        chapters,
        sessions: {},
        updatedAt: '2026-09-17T12:00:00Z',
    },
});

describe('reading estimates', () => {
    it('uses pace, active time and chapter endings', () => {
        const library = fixture();
        const status = (ms: number, pace = 250) =>
            applyActivity(library, progress(ms), pace).reviews?.['work-42']
                ?.status;
        expect(status(10000)).toBe('opened');
        expect(status(120000)).toBe('partial');
        expect(status(240000)).toBe('finished');
        expect(status(240000, 125)).toBe('partial');
        expect(
            applyActivity(library, progress(240000, { '1': true }), 250)
                .reviews?.['work-42']?.status,
        ).toBe('partial');
    });

    it('preserves every manual answer and does not invent rereads', () => {
        for (const status of [
            'finished',
            'opened',
            'partial',
            'unsure',
        ] as const) {
            const library = fixture();
            const manual = {
                status,
                words: 1000,
                reviewedAt: '2026-09-16',
                readCount: 2,
            };
            library.reviews = { 'work-42': manual };
            expect(
                applyActivity(library, progress(600000), 250).reviews?.[
                    'work-42'
                ],
            ).toEqual(manual);
        }
        expect(
            applyActivity(fixture(), progress(600000), 250).reviews?.[
                'work-42'
            ]?.readCount,
        ).toBe(1);
    });

    it('counts automatic results as estimates, not confirmations', () => {
        const library = applyActivity(fixture(), progress(240000), 250);
        const totals = computeStats(
            library.works,
            loadCore(),
            library.reviews,
        ).totals;
        expect(totals.words).toBe(1000);
        expect(totals.confirmedWords).toBe(0);
        expect(totals.estimatedWords).toBe(1000);
        const partial = applyActivity(fixture(), progress(120000), 250);
        expect(
            computeStats(partial.works, loadCore(), partial.reviews).totals
                .words,
        ).toBe(500);
    });

    it('merges chapter sessions without double counting', async () => {
        const storage = createMemoryStorage();
        const update = {
            username: 'reader',
            workId: 42,
            chapter: 1,
            session: 'first',
            activeMs: 10000,
            reachedEnd: true,
        };
        await saveActivity(storage, update);
        await saveActivity(storage, update);
        await saveActivity(storage, { ...update, activeMs: 9000 });
        await saveActivity(storage, { ...update, activeMs: 20000 });
        await saveActivity(storage, {
            ...update,
            chapter: 2,
            session: 'second',
        });
        const key = activityKey('reader');
        const saved = (await storage.get([key]))[key] as Record<
            string,
            ReadingActivity
        >;
        expect(saved['work-42']?.activeMs).toBe(30000);
        expect(saved['work-42']?.chapters).toEqual({ '1': true, '2': true });
    });

    it('applies activity using the website’s saved pace', async () => {
        const library = fixture();
        const storage = createMemoryStorage({
            [activityKey(library.username)]: progress(240000),
        });
        const saved = savedConnection(storage, 'http://localhost:5173');
        await saved.allow();
        const websiteStorage = {
            get: async (keys: string[]) =>
                (await saved.access({
                    operation: 'get',
                    keys,
                })) as Record<string, unknown>,
            set: async (items: Record<string, unknown>) => {
                await saved.access({ operation: 'set', items });
            },
            remove: async (keys: string[]) => {
                await saved.access({ operation: 'remove', keys });
            },
        };
        await saveLibrary(websiteStorage, library);
        const loaded = await loadLibrary(websiteStorage, library.username);
        expect(loaded?.reviews?.['work-42']?.status).toBe('finished');
        await websiteStorage.set({ wordsPerMinute: 125 });
        expect(
            (await loadLibrary(websiteStorage, library.username))?.reviews?.[
                'work-42'
            ]?.status,
        ).toBe('partial');
    });
});
