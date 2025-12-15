// @ts-check

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import imp from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import simpleImpSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default defineConfig(
    { ignores: ['node_modules', 'dist'] },
    {
        files: ['**/*.{j,t}s?(x)'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            // reactRecommended, // not compatible currently
            // reactHooks.configs.recommended, // not compatible currently
        ],
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            prettier,
            import: imp,
            'simple-import-sort': simpleImpSort,
        },
        rules: {
            // ...hookRules,
            'prettier/prettier': 'warn',
            'arrow-body-style': ['warn', 'as-needed'],
            'no-console': 'warn',
            eqeqeq: ['error', 'always'],
            'simple-import-sort/imports': [
                'warn',
                {
                    groups: [
                        [
                            'vitest',
                            // scss and css file imports
                            '\\.s?css$',
                            // side effect (e.g. `import "./foo"`)
                            '^\\u0000',
                            // every import starting with "react"
                            '^react',
                            // things that start with a letter (or digit or underscore), or `@` followed by a letter
                            '^@?\\w',
                            // internal relative paths
                            '^\\.',
                        ],
                    ],
                },
            ],
            'simple-import-sort/exports': 'warn',
            'no-restricted-imports': [
                'error',
                {
                    patterns: ['**/build/*', '**/dist/*'],
                },
            ],
            'import/no-duplicates': 'warn',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        files: ['**/*.d.ts'],
        rules: {
            'no-var': 'off',
        },
    },
    {
        files: ['**/*.test.ts?(x)'],
        rules: {
            '@typescript-eslint/no-non-null-assertion': 'off',
        },
    },
    {
        files: ['**/*.jest.ts?(x)'],
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
        },
    }
);
