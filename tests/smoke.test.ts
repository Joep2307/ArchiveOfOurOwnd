/**
 * Fast structural check: every barrel loads, the wasm core answers,
 * the dashboard boots, and the SCSS compiles. Runs on every commit.
 */
import { compile } from 'sass-embedded';
import * as root from '@/index';
import { createDemoLibrary } from '@/demo';
import { bootDashboard } from '@/exe';
import { createMemoryStorage, saveLibrary } from '@/storage';
import { loadCore } from './loadCore';

describe('smoke', () => {
    it('loads every barrel', () => {
        for (const [name, module] of Object.entries(root)) {
            expect(Object.keys(module).length, name).toBeGreaterThan(0);
        }
    });

    it('initialises the wasm stats core', () => {
        const core = loadCore();
        expect(core.summarize([1, 2, 3, 4]).median).toBe(2.5);
        expect(core.histogram([1, 5], [0, 2])).toEqual([1, 1]);
    });

    it('boots the dashboard with stored data', async () => {
        const storage = createMemoryStorage();
        await saveLibrary(storage, createDemoLibrary(40));
        const app = document.createElement('div');
        document.body.append(app);
        await bootDashboard(app, {
            core: loadCore(),
            deps: { storage },
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(app.querySelector('#highlights')).not.toBeNull();
        expect(app.querySelector('.tile__value')).not.toBeNull();

        const open = async (hash: string): Promise<void> => {
            window.location.hash = hash;
            window.dispatchEvent(new HashChangeEvent('hashchange'));
            await new Promise((resolve) => setTimeout(resolve, 50));
        };
        await open('#/genres');
        expect(app.querySelector('#genres')).not.toBeNull();
        expect(app.querySelector('#highlights')).toBeNull();
        expect(app.querySelector('[data-view="genres"]')?.ariaCurrent).toBe(
            'page',
        );
        await open('#/works');
        expect(app.querySelector('.works-table')).not.toBeNull();
        window.location.hash = '';
    });

    it('compiles the styles', () => {
        const { css } = compile('src/styles/main.scss');
        expect(css.length).toBeGreaterThan(1000);
    });
});
