import { bootDashboard } from '@/exe';
import { createDemoLibrary } from '@/demo';
import {
    createMemoryStorage,
    saveLibrary,
    loadActiveLibrary,
} from '@/storage';
import { parseLibraryFile } from '@/export';
import { loadCore } from './loadCore';
import { reviewCandidates } from '@/stats';

async function openReview(root: HTMLElement): Promise<void> {
    await vi.waitFor(() => {
        const button = [...root.querySelectorAll('button')].find(
            (item) => item.textContent === 'Review reading history',
        );
        if (!button || button.disabled) {
            throw new Error('Review menu not ready');
        }
        button.click();
    });
    await vi.waitFor(() => {
        expect(root.querySelector('dialog')?.open).toBe(true);
    });
}

describe('biggest reads review', () => {
    beforeAll(() => {
        // jsdom does not implement the native dialog lifecycle.
        HTMLDialogElement.prototype.showModal = function () {
            this.open = true;
        };
        HTMLDialogElement.prototype.close = function () {
            this.open = false;
        };
    });
    it('keeps answers until closing, with counts and undo', async () => {
        const storage = createMemoryStorage();
        const library = createDemoLibrary(40);
        const candidates = reviewCandidates(library.works);
        await saveLibrary(storage, library);
        const root = document.createElement('div');
        document.body.append(root);
        await bootDashboard(root, { core: loadCore(), deps: { storage } });
        await openReview(root);
        await vi.waitFor(() => {
            expect(
                root.querySelectorAll('#reading-review select'),
            ).toHaveLength(candidates.length);
        });
        expect(root.querySelector('main #reading-review')).toBeNull();
        const dialog = root.querySelector('dialog');
        if (!dialog) throw new Error('Missing dialog');
        dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
        await vi.waitFor(() => {
            expect(dialog.open).toBe(false);
        });
        await openReview(root);
        const selects = root.querySelectorAll<HTMLSelectElement>(
            '#reading-review select',
        );
        expect(selects).toHaveLength(candidates.length);
        expect(
            root.querySelector<HTMLDetailsElement>(
                '.reading-review-list details',
            )?.open,
        ).toBe(false);
        const longest = library.works
            .filter((w) => w.kind === 'work')
            .sort(
                (a, b) => b.words - a.words || a.key.localeCompare(b.key),
            )[0];
        if (!longest || !selects[0]) throw new Error('Missing review work');
        expect(selects[0].getAttribute('aria-label')).toContain(longest.title);
        const initialCount = root.querySelector<HTMLInputElement>(
            '.reading-review-list input[type="number"]',
        );
        if (!initialCount) throw new Error('Missing full read count');
        expect(initialCount.closest('[hidden]')).not.toBeNull();
        selects[0].value = 'multiple';
        selects[0].dispatchEvent(new Event('change'));
        expect(initialCount.closest('[hidden]')).toBeNull();
        expect(
            (await loadActiveLibrary(storage))?.reviews?.[longest.key],
        ).toBeUndefined();
        initialCount.value = '2';
        const saveCount = [...root.querySelectorAll('button')].find(
            (button) => button.textContent === 'Save read count',
        );
        if (!saveCount) throw new Error('Missing save button');
        saveCount.click();
        await vi.waitFor(async () => {
            expect(
                (await loadActiveLibrary(storage))?.reviews?.[longest.key]
                    ?.words,
            ).toBe(longest.words);
            expect(
                (await loadActiveLibrary(storage))?.reviews?.[longest.key]
                    ?.readCount,
            ).toBe(2);
        });
        await vi.waitFor(() => {
            expect(
                root.querySelectorAll('.reading-review-list select'),
            ).toHaveLength(candidates.length);
            expect(root.textContent).toContain(
                'Saved. This work leaves the list when you close.',
            );
        });
        dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
        await vi.waitFor(() => {
            expect(dialog.open).toBe(false);
        });
        await openReview(root);
        expect(
            root.querySelectorAll('.reading-review-list select'),
        ).toHaveLength(candidates.length - 1);
        const saved = await loadActiveLibrary(storage);
        if (!saved) throw new Error('Missing library');
        expect(parseLibraryFile(JSON.stringify(saved)).reviews).toEqual(
            saved.reviews,
        );
        const updated = saved.works.find((w) => w.key === longest.key);
        if (!updated) throw new Error('Missing work');
        updated.words += 1000;
        await saveLibrary(storage, saved);
        await bootDashboard(root, { core: loadCore(), deps: { storage } });
        await openReview(root);
        await vi.waitFor(() => {
            expect(
                root.querySelectorAll('.reading-review-list select'),
            ).toHaveLength(candidates.length - 1);
        });
        expect(
            (await loadActiveLibrary(storage))?.reviews?.[longest.key]?.words,
        ).toBe(longest.words);
        const count = root.querySelector<HTMLInputElement>(
            '.review-history input[type="number"]',
        );
        if (!count) throw new Error('Missing full read count');
        expect(count.value).toBe('2');
        count.value = '3';
        count.dispatchEvent(new Event('change'));
        await vi.waitFor(async () => {
            const review = (await loadActiveLibrary(storage))?.reviews?.[
                longest.key
            ];
            expect(review?.readCount).toBe(3);
            expect(review?.words).toBe(longest.words);
        });
        await vi.waitFor(() => {
            expect(root.textContent).toContain('Undo review');
        });
        const undo = [
            ...root.querySelectorAll<HTMLButtonElement>(
                '#reading-review button',
            ),
        ].find((button) => button.textContent === 'Undo review');
        if (!undo) throw new Error('Missing undo');
        undo.click();
        await vi.waitFor(async () => {
            expect(
                (await loadActiveLibrary(storage))?.reviews?.[longest.key],
            ).toBeUndefined();
        });
        await vi.waitFor(() => {
            expect(
                root.querySelectorAll('.reading-review-list select'),
            ).toHaveLength(candidates.length);
        });
        const once = root.querySelector<HTMLSelectElement>(
            '.reading-review-list select',
        );
        if (!once) throw new Error('Missing restored work');
        once.value = 'finished';
        once.dispatchEvent(new Event('change'));
        await vi.waitFor(async () => {
            expect(
                (await loadActiveLibrary(storage))?.reviews?.[longest.key]
                    ?.readCount,
            ).toBe(1);
        });
    });

    it.each([0, -1, 1.5, '2'])('rejects invalid read count %s', (count) => {
        const library = createDemoLibrary(1);
        expect(() =>
            parseLibraryFile(
                JSON.stringify({
                    ...library,
                    reviews: {
                        test: {
                            status: 'finished',
                            words: 100,
                            reviewedAt: '2026-09-16',
                            readCount: count,
                        },
                    },
                }),
            ),
        ).toThrow();
    });

    it('rejects malformed review data in backups', () => {
        const library = createDemoLibrary(1);
        expect(() =>
            parseLibraryFile(
                JSON.stringify({
                    ...library,
                    reviews: { bad: { status: 'finished', words: -1 } },
                }),
            ),
        ).toThrow();
        expect(
            parseLibraryFile(JSON.stringify(library)).reviews,
        ).toBeUndefined();
    });
});
