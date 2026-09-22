/**
 * Serves the original dashboard with live updates. Never opens a browser.
 * A fixed port prevents accidentally starting a second preview elsewhere.
 */
import { createServer } from 'vite';

const server = await createServer({ configFile: 'vite.config.ts' });
await server.listen();
server.printUrls();
console.log('Dashboard: http://127.0.0.1:5173/');
