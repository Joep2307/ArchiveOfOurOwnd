/** Every class we add to AO3 pages starts with this prefix. */
export const READ_CLASS = 'ao3rs-read';
export const READ_LINK_CLASS = 'ao3rs-read-link';
export const BADGE_CLASS = 'ao3rs-badge';
export const NAV_CLASS = 'ao3rs-nav';

export const DASHBOARD_LINK_LABEL = 'Reading stats';
export const SYNC_LINK_LABEL = 'Sync reading stats';

/** Wait for AO3 to settle before marking content added later. */
export const REMARK_DELAY_MS = 200;

/** `/works/1`, `/works/1/chapters/2`, `/collections/x/works/1`. */
export const WORK_PATH =
    /^(?:\/collections\/[^/]+)?\/works\/(\d+)(?:\/chapters\/\d+)?\/?$/;

export const BLURB_SELECTOR = 'li.blurb';
export const BLURB_TITLE_SELECTOR = '.header .heading a[href]';
export const WORK_TITLE_SELECTOR = '#workskin .preface .title';
/** Links that are navigation, not a mention of another work. */
export const SKIP_LINKS_SELECTOR =
    '#header, #footer, .blurb, .work.navigation, .chapter.navigation';
export const NAV_SELECTORS = [
    '#header ul.primary.navigation',
    '#greeting ul.user.navigation',
];
