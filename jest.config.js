module.exports = {
  collectCoverageFrom: ["src/**/*.js"],
  testMatch: ["<rootDir>/test/**/(*.)test.js"],
  coverageThreshold: { global: { statements: 100, branches: 100, functions: 100, lines: 100 } },
  coverageDirectory: "<rootDir>/build/coverage"
};
