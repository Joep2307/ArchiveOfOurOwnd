import type { BrowserTarget } from './BrowserTarget';
import { DASHBOARD_ORIGINS } from '../connection/protocol';
import {
    CONTENT_SCRIPT,
    CONTENT_STYLE,
    EXTENSION_DESCRIPTION,
    EXTENSION_NAME,
    EXTENSION_PAGES_CSP,
    EXTENSION_SHORT_NAME,
    FIREFOX_MIN_VERSION,
    GECKO_ID,
    HOST_PERMISSION,
    ICON_SIZES,
} from './constants';

/** Builds `manifest.json` for one browser. */
export function createManifest(
    target: BrowserTarget,
    version: string,
): Record<string, unknown> {
    const icons = Object.fromEntries(
        ICON_SIZES.map((size) => [String(size), `icons/icon-${size}.png`]),
    );
    const background =
        target === 'chrome'
            ? { service_worker: 'background.js', type: 'module' }
            : { scripts: ['background.js'], type: 'module' };

    return {
        manifest_version: 3,
        name: EXTENSION_NAME,
        short_name: EXTENSION_SHORT_NAME,
        version,
        description: EXTENSION_DESCRIPTION,
        icons,
        action: {
            default_title: 'Open reading stats',
            default_icon: icons,
        },
        background,
        permissions: ['storage', 'unlimitedStorage'],
        host_permissions: [HOST_PERMISSION],
        content_scripts: [
            {
                matches: [HOST_PERMISSION],
                js: [CONTENT_SCRIPT],
                css: [CONTENT_STYLE],
                run_at: 'document_idle',
            },
            {
                matches: DASHBOARD_ORIGINS.map((origin) => {
                    const url = new URL(origin);
                    return `${url.protocol}//${url.hostname}/*`;
                }),
                js: [CONTENT_SCRIPT],
                run_at: 'document_idle',
            },
        ],
        content_security_policy: {
            extension_pages: EXTENSION_PAGES_CSP,
        },
        ...(target === 'firefox'
            ? {
                  browser_specific_settings: {
                      gecko: {
                          id: GECKO_ID,
                          strict_min_version: FIREFOX_MIN_VERSION,
                          data_collection_permissions: {
                              required: ['none'],
                          },
                      },
                  },
              }
            : {}),
    };
}
