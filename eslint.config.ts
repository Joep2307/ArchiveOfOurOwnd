import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    {
        ignores: ['dist', 'coverage', 'node_modules', 'src/wasm', 'crates'],
    },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'max-len': ['error', { code: 79, ignoreUrls: true }],
            '@typescript-eslint/consistent-type-definitions': [
                'error',
                'type',
            ],
            '@typescript-eslint/restrict-template-expressions': [
                'error',
                { allowNumber: true },
            ],
        },
    },
);
