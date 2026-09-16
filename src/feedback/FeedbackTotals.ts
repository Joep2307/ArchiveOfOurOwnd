/** How often the reader gave kudos and commented, for some works. */
export type FeedbackTotals = {
    /** Works with a known kudos answer. */
    checked: number;
    kudos: number;
    commented: number;
    /** Readable works not looked at yet. */
    unchecked: number;
};
