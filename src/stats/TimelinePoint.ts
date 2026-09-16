/** Works whose last visit falls in one month. */
export type TimelinePoint = {
    /** `YYYY-MM` */
    month: string;
    label: string;
    works: number;
    words: number;
};
