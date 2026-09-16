import { parseHtml } from '@/parse';
import { parseCommentsPage } from './parseCommentsPage';
import { parseKudosPage } from './parseKudosPage';
import { unwrapCommentsScript } from './unwrapCommentsScript';

// Trimmed from a real `show_comments` answer.
const SCRIPT = [
    String.raw`/* replace the top "Comments" link */`,
    String.raw`$j("#show_comments_link_top").html(` +
        String.raw`"<a href=\"/users/decoy\">Hide<\/a>");`,
    String.raw`$j("#comments_placeholder").html(` +
        String.raw`"<ol class=\"pagination actions\">` +
        String.raw`<li><span class=\"current\">1<\/span><\/li> ` +
        String.raw`<li><a rel=\"next\" data-remote=\"true\" ` +
        String.raw`href=\"/comments/show_comments?page=2` +
        String.raw`&amp;view_adult=true&amp;work_id=7\">2<\/a>` +
        String.raw`<\/li><\/ol>");`,
    String.raw`$j("#comments_placeholder").append(` +
        String.raw`"<!-- START thread -->\n<ol class=\"thread\">\n` +
        String.raw`<li class=\"odd comment group user-1\" ` +
        String.raw`id=\"comment_45\" role=\"article\">\n` +
        String.raw`      <h4 class=\"heading byline\">\n` +
        String.raw`            ` +
        String.raw`<a href=\"/users/Night%20Owl/pseuds/Owl\">Owl<\/a>\n` +
        String.raw`            <span class=\'parent\'>\n` +
        String.raw`              ` +
        String.raw`on <a href=\"/works/7/chapters/9\">Chapter 2<\/a>\n` +
        String.raw`            <\/span>\n<\/h4>\n` +
        String.raw`<blockquote>It\'s ` +
        String.raw`<a href=\"/users/Reader\">Reader<\/a>!` +
        String.raw`<\/blockquote><\/li>\n` +
        String.raw`<li class=\"comment\"><p>(<a href=\"/comments/88\">` +
        String.raw`3 more comments in this thread<\/a>)<\/p><\/li>");`,
    String.raw`$j("#comments_placeholder").append("<\/ol>");`,
    String.raw`$j("#comments_placeholder").slideDown();`,
].join('\n');

describe('unwrapCommentsScript', () => {
    it('joins only the HTML written into the placeholder', () => {
        const html = unwrapCommentsScript(SCRIPT);
        expect(html).toContain('<li class="odd comment group user-1"');
        expect(html).toContain("It's");
        expect(html).toContain('</ol>');
        expect(html).not.toContain('decoy');
    });

    it('is empty for anything else', () => {
        expect(unwrapCommentsScript('<html><body>Hi</body></html>')).toBe('');
    });
});

describe('parseCommentsPage', () => {
    const doc = parseHtml(unwrapCommentsScript(SCRIPT));

    it('finds comments by login, ignoring case and pseud', () => {
        expect(parseCommentsPage(doc, 'night owl').found).toBe(true);
    });

    it('ignores users only mentioned inside a comment', () => {
        expect(parseCommentsPage(doc, 'Reader').found).toBe(false);
    });

    it('reads the pages and the cut-off threads', () => {
        const page = parseCommentsPage(doc, 'Reader');
        expect(page.lastPage).toBe(2);
        expect(page.cutThreads).toEqual([88]);
    });
});

describe('parseKudosPage', () => {
    const html = `
        <header><p id="greeting"><a href="/users/Reader">Hi</a></p></header>
        <h2 class="heading">51 - 100 of 120 Users Who Left Kudos</h2>
        <ol class="pagination actions">
          <li><a href="/works/7/kudos?page=1&amp;view_adult=true">1</a></li>
          <li><span class="current">2</span></li>
          <li><a href="/works/7/kudos?page=3&amp;view_adult=true">3</a></li>
        </ol>
        <div id="kudos"><p class="kudos">
          <a href="/users/someone">someone</a>,
          <a href="/users/Friend_1">Friend_1</a> left kudos on this work!
        </p></div>`;

    it('finds the reader among the kudos, not in the header', () => {
        const doc = parseHtml(html);
        expect(parseKudosPage(doc, 'friend_1')).toEqual({
            found: true,
            lastPage: 3,
            cutThreads: [],
        });
        expect(parseKudosPage(doc, 'Reader').found).toBe(false);
    });

    it('handles a work with only guest kudos', () => {
        const doc = parseHtml('<h3>12 guests have also left kudos</h3>');
        expect(parseKudosPage(doc, 'Reader')).toEqual({
            found: false,
            lastPage: 1,
            cutThreads: [],
        });
    });
});
