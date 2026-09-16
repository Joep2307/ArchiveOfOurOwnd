/**
 * One creator of a work. `user` is the account name (stable key),
 * `pseud` the name shown on the work.
 */
export type AuthorRef = {
    user: string;
    pseud: string;
};
