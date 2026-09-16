import { describe, expect, it } from 'vitest';
import { DASHBOARD_VIEWS } from './constants';
import { viewFromHash } from './viewFromHash';
import { viewHash } from './viewHash';

describe('viewFromHash', () => {
    it('opens the dashboard for an empty hash', () => {
        expect(viewFromHash('')).toBe('dashboard');
        expect(viewFromHash('#')).toBe('dashboard');
        expect(viewFromHash('#/')).toBe('dashboard');
    });

    it('reads a page', () => {
        expect(viewFromHash('#/genres')).toBe('genres');
    });

    it('ignores other anchors and unknown pages', () => {
        expect(viewFromHash('#main')).toBeNull();
        expect(viewFromHash('#/nope')).toBeNull();
    });

    it('round-trips every page', () => {
        for (const view of DASHBOARD_VIEWS) {
            expect(viewFromHash(viewHash(view))).toBe(view);
        }
    });
});
