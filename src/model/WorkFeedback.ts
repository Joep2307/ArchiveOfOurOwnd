/**
 * Whether the reader left kudos or a comment on one work, as found on
 * AO3. `null` means AO3 would not show it (hidden, deleted, error).
 */
export type WorkFeedback = {
    kudos: boolean | null;
    commented: boolean | null;
    /** ISO timestamp of the check. */
    checkedAt: string;
};
