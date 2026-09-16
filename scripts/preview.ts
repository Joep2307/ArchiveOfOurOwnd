/**
 * Opens the dashboard in a normal browser tab with demo data, for
 * working on the design without reloading the extension.
 */
import { createServer } from 'vite';

const server = await createServer({ configFile: 'vite.config.ts' });
await server.listen();
server.printUrls();
