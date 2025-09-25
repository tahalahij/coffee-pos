module.exports = {
  displayName: 'Unit Tests',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
  ],
  coverageDirectory: '../coverage/unit',
};

