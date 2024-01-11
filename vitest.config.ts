/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['**/*.{test,vitest}.{ts,tsx}'],
        coverage: {
            reporter: ['text', 'lcov'],
            include: ['src/**/*.ts'],
            thresholds: { lines: 99, branches: 98, functions: 100, statements: 99 },
        },
    },
});
