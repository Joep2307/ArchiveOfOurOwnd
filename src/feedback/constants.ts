/** Headers AO3 needs before it answers with the comments script. */
export const SCRIPT_HEADERS: Readonly<Record<string, string>> = {
    Accept: 'text/javascript, application/javascript',
    'X-Requested-With': 'XMLHttpRequest',
};

/** Save the results found so far after this many works. */
export const FEEDBACK_CHECKPOINT_EVERY = 10;

/** Comment threads deeper than AO3 shows, followed per work at most. */
export const MAX_THREAD_PAGES = 50;
