import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  testMatch: [
    '**/__tests__/*.spec.ts',
  ],
  transform: {
    '^.*\\.ts$': [
      'ts-jest',
      { babelConfig: true },
    ],
  },
  setupFilesAfterEnv: [
    '<rootDir>/jest.integration.setup.ts',
  ],
};

export default jestConfig;
