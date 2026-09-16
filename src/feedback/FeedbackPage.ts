/** What one kudos or comments page says about the reader. */
export type FeedbackPage = {
    found: boolean;
    lastPage: number;
    /** Comment ids whose replies AO3 left out of the page. */
    cutThreads: number[];
};
