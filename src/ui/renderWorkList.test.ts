import { createInitialState, type DashboardController } from '@/app';
import { createDemoLibrary } from '@/demo';
import { reviewControl } from './renderWorkList';

it('reveals Save for multiple reads and validates the count', () => {
    const library = createDemoLibrary(10);
    const work = library.works.find((item) => item.kind === 'work');
    if (!work) throw new Error('Missing work');
    library.reviews = {
        [work.key]: {
            status: 'finished',
            readCount: 1,
            words: work.words,
            reviewedAt: '2026-09-17',
        },
    };
    const reviewWork = vi.fn().mockResolvedValue(undefined);
    const controller = { reviewWork } as unknown as DashboardController;
    const editor = reviewControl(
        work,
        {
            ...createInitialState(false),
            library,
        },
        controller,
    );
    const select = editor.querySelector('select');
    const input = editor.querySelector('input');
    const save = editor.querySelector('button');
    if (!select || !input || !save) throw new Error('Missing controls');
    expect(save.hidden).toBe(true);
    select.value = 'multiple';
    select.dispatchEvent(new Event('change'));
    expect(save.hidden).toBe(false);
    expect(input.hidden).toBe(false);
    expect(input.value).toBe('2');
    input.value = '1';
    save.click();
    expect(reviewWork).not.toHaveBeenCalled();
    input.value = '3';
    save.click();
    expect(reviewWork).toHaveBeenCalledWith(work.key, 'finished', 3);
});
