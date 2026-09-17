import { el } from '@/ui/el';

/** Resume after the user signs in on AO3. */
export function showLoginDialog(standalone: boolean): Promise<boolean> {
    return new Promise((resolve) => {
        const dialog = el('dialog', {
            className: 'review-dialog',
            attrs: {
                'aria-labelledby': 'ao3-login-heading',
            },
        });
        const finish = (proceed: boolean): void => {
            dialog.close();
            dialog.remove();
            resolve(proceed);
        };
        dialog.append(
            el('h2', {
                text: 'Connect your AO3 account',
                attrs: { id: 'ao3-login-heading' },
            }),
            el('p', {
                text:
                    'Log in to AO3 in this browser, then return here ' +
                    'to load your reading history. If you are already ' +
                    'logged in, continue below.',
            }),
            el('p', {
                text: standalone
                    ? 'Your password stays on AO3. Your history stays ' +
                      'locally in the extension and returns on refresh.'
                    : 'Your password stays on AO3. Your history is saved ' +
                      'locally in the extension.',
            }),
            el('a', {
                className: 'button',
                text: 'Open AO3 login',
                attrs: {
                    href: 'https://archiveofourown.org/users/login',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
            el('button', {
                className: 'button button--primary',
                text: 'I’m logged in — load my history',
                attrs: { type: 'button' },
                on: {
                    click: () => {
                        finish(true);
                    },
                },
            }),
            el('button', {
                className: 'button button--ghost',
                text: 'Cancel',
                attrs: { type: 'button' },
                on: {
                    click: () => {
                        finish(false);
                    },
                },
            }),
        );
        dialog.addEventListener('cancel', (event) => {
            event.preventDefault();
            finish(false);
        });
        document.body.append(dialog);
        dialog.showModal();
    });
}
