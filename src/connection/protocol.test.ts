import { isAllowedAo3Url, isDashboardUrl } from './protocol';

describe('dashboard connection boundaries', () => {
    it('only trusts configured dashboard origins', () => {
        expect(
            isDashboardUrl('http://localhost:5173/dashboard.html?demo'),
        ).toBe(true);
        expect(isDashboardUrl('http://127.0.0.1:5173/')).toBe(true);
        for (const url of [
            'http://localhost:9999',
            'https://evil.test',
            'http://localhost.evil.test:5173',
            'invalid',
        ]) {
            expect(isDashboardUrl(url)).toBe(false);
        }
    });

    it('restricts AO3 requests to history and feedback', () => {
        for (const path of [
            '/',
            '/users/reader/readings?page=2',
            '/works/123/kudos?page=1',
            '/comments/show_comments?work_id=123&page=2',
            '/comments/456?view_adult=true',
        ]) {
            expect(isAllowedAo3Url(`https://archiveofourown.org${path}`)).toBe(
                true,
            );
        }
        for (const url of [
            'https://evil.test/',
            'https://archiveofourown.org/users/logout',
            'https://archiveofourown.org/users/reader/preferences',
            'https://archiveofourown.org/works/123?delete=true',
            'https://user:password@archiveofourown.org/',
            'https://archiveofourown.org/users/reader/../preferences',
        ]) {
            expect(isAllowedAo3Url(url)).toBe(false);
        }
    });
});
