/** Progress of the reading speed test on the Advanced page. */
export type SpeedTest = {
    /** When the reader pressed start, in ms; `null` when not reading. */
    startedAt: number | null;
    /** Measured words a minute of the last finished test. */
    result: number | null;
    /** The last test was finished too quickly to be real reading. */
    tooFast: boolean;
};
