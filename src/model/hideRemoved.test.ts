import { createDemoLibrary } from '@/demo';
import { hideRemoved } from './hideRemoved';

describe('hideRemoved', () => {
    it('returns the same library when nothing was removed', () => {
        const library = createDemoLibrary(5);
        expect(hideRemoved(library)).toBe(library);
    });

    it('drops removed works and keeps the rest in order', () => {
        const library = createDemoLibrary(5);
        const [first, second, ...rest] = library.works;
        const hidden = hideRemoved({
            ...library,
            removed: [first?.key ?? '', second?.key ?? ''],
        });
        expect(hidden.works).toEqual(rest);
    });
});
