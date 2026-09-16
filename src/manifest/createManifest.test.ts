import { createManifest } from './createManifest';

describe('createManifest', () => {
    it('uses a service worker for Chrome', () => {
        const manifest = createManifest('chrome', '1.2.3');
        expect(manifest.version).toBe('1.2.3');
        expect(manifest.background).toEqual({
            service_worker: 'background.js',
            type: 'module',
        });
        expect(manifest).not.toHaveProperty('browser_specific_settings');
    });

    it('uses background scripts and a gecko id for Firefox', () => {
        const manifest = createManifest('firefox', '1.2.3');
        expect(manifest.background).toEqual({
            scripts: ['background.js'],
            type: 'module',
        });
        expect(manifest).toHaveProperty('browser_specific_settings.gecko.id');
    });

    it.each(['chrome', 'firefox'] as const)(
        'runs the content script on AO3 in %s',
        (target) => {
            const manifest = createManifest(target, '1.2.3');
            expect(manifest.content_scripts).toEqual([
                {
                    matches: ['https://archiveofourown.org/*'],
                    js: ['content.js'],
                    css: ['content.css'],
                    run_at: 'document_idle',
                },
            ]);
        },
    );
});
