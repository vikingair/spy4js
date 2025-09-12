// @ts-check

/** @type {import('jest').Config} */
const config = {
    testMatch: ['<rootDir>/test/**/(*.)jest.ts?(x)'],
    testEnvironment: 'jsdom',
};

export default config;
