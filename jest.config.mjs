export default {
  collectCoverageFrom: ['src/**/*.ts?(x)', '!src/index.ts'],
  testMatch: ["<rootDir>/test/**/(*.)test.ts?(x)"],
  coverageThreshold: { global: { statements: 100, branches: 100, functions: 100, lines: 100 } },
  coverageDirectory: "<rootDir>/build/coverage",
  testEnvironment: 'jsdom',
  transform: { "\\.(js|jsx|ts|tsx)$": "@sucrase/jest-plugin" },
};
