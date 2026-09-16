import { workIdFromHref } from './workIdFromHref';

describe('workIdFromHref', () => {
    it.each([
        ['/works/123', 123],
        ['/works/123/', 123],
        ['/works/123?view_adult=true', 123],
        ['/works/123#comments', 123],
        ['/works/123/chapters/456', 123],
        ['/collections/fest_2024/works/123', 123],
        ['https://archiveofourown.org/works/123', 123],
    ])('reads %s', (href, id) => {
        expect(workIdFromHref(href)).toBe(id);
    });

    it.each([
        '/works/123/bookmarks',
        '/works/123/edit',
        '/works/new',
        '/works/search?work_search[query]=x',
        '/series/5',
        '/users/someone/works',
        'https://example.com/works/123',
        'javascript:void(0)',
    ])('ignores %s', (href) => {
        expect(workIdFromHref(href)).toBeNull();
    });
});
