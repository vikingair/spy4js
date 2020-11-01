module.exports = {
  collectCoverageFrom: ["src/**/*.ts"],
  testMatch: ["<rootDir>/test/**/(*.)test.ts"],
  coverageThreshold: { global: { statements: 100, branches: 100, functions: 100, lines: 100 } },
  coverageDirectory: "<rootDir>/build/coverage"
};
