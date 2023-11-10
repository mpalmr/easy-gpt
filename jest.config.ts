import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  testMatch: [
    '**/__tests__/*.test.ts',
  ],
  transform: {
    '^.*\\.ts$': [
      'ts-jest',
      { babelConfig: true },
    ],
  },
};

export default jestConfig;
