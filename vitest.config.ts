/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['**/*.{test,vitest}.{ts,tsx}'],
        globals: true,
        coverage: {
            reporter: ['text', 'lcov'],
            include: ['src/**/*.ts'],
        },
    },
});
