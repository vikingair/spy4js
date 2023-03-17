export default {
  collectCoverageFrom: ['src/**/*.ts?(x)', '!src/index.ts'],
  testMatch: ["<rootDir>/test/**/(*.)(t|j)est.ts?(x)"],
  coverageThreshold: { global: { statements: 97, branches: 97, functions: 97, lines: 97 } },
  coverageDirectory: "<rootDir>/coverage",
  testEnvironment: 'jsdom',
  transform: { "\\.(js|jsx|ts|tsx)$": "@sucrase/jest-plugin" },
};
