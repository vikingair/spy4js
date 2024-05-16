// @ts-check

/** @type {import('jest').Config} */
const config = {
    testMatch: ['<rootDir>/test/**/(*.)jest.ts?(x)'],
    testEnvironment: 'jsdom',
    transform: { '\\.(js|jsx|ts|tsx)$': '@sucrase/jest-plugin' },
};

export default config;
