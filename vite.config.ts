import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

/** Shared Vite setup; `scripts/build.ts` adds the entry points. */
export default defineConfig({
    root: fileURLToPath(new URL('./src/exe', import.meta.url)),
    publicDir: fileURLToPath(new URL('./src/assets', import.meta.url)),
    base: './',
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        target: 'es2022',
        emptyOutDir: true,
        modulePreload: false,
        sourcemap: false,
        assetsInlineLimit: 0,
    },
    worker: {
        format: 'es',
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        open: false,
    },
});
