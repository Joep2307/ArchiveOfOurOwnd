import { addOpenedWorkId } from './addOpenedWorkId';
import { MAX_OPENED_IDS } from './constants';
import { createMemoryStorage } from './createMemoryStorage';
import { loadHighlightSetting } from './loadHighlightSetting';
import { loadOpenedWorkIds } from './loadOpenedWorkIds';
import { saveHighlightSetting } from './saveHighlightSetting';

describe('opened work ids', () => {
    it('keeps the newest first without duplicates', async () => {
        const storage = createMemoryStorage();
        await addOpenedWorkId(storage, 'me', 1);
        await addOpenedWorkId(storage, 'me', 2);
        await addOpenedWorkId(storage, 'me', 1);
        expect(await loadOpenedWorkIds(storage, 'me')).toEqual([1, 2]);
        expect(await loadOpenedWorkIds(storage, 'other')).toEqual([]);
    });

    it('stops growing at the limit', async () => {
        const storage = createMemoryStorage();
        for (let id = 0; id <= MAX_OPENED_IDS; id += 1) {
            await addOpenedWorkId(storage, 'me', id);
        }
        const ids = await loadOpenedWorkIds(storage, 'me');
        expect(ids).toHaveLength(MAX_OPENED_IDS);
        expect(ids[0]).toBe(MAX_OPENED_IDS);
    });
});

describe('highlight setting', () => {
    it('is on until switched off', async () => {
        const storage = createMemoryStorage();
        expect(await loadHighlightSetting(storage)).toBe(true);
        await saveHighlightSetting(storage, false);
        expect(await loadHighlightSetting(storage)).toBe(false);
    });
});
