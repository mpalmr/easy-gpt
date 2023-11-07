'use strict';

module.exports = {
  root: true,
  overrides: [
    {
      files: ['**/*.js'],
      extends: [
        'airbnb-base',
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2022,
      },
      rules: {
        'no-console': 0,
        strict: [2, 'global'],
      },
    },
    {
      files: ['**/*.ts'],
      extends: [
        'airbnb-base',
        'airbnb-typescript/base',
      ],
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
      },
      rules: {
        'import/prefer-default-export': 0,
        '@typescript-eslint/lines-between-class-members': 0,
      },
    },
    {
      files: [
        'jest.setup.ts',
        '**/__tests__/*.ts',
        '**/__mocks__/*.ts',
        './tests/**/*.ts',
      ],
      plugins: ['jest'],
      env: {
        'jest/globals': true,
      },
    },
    {
      files: [
        '**/*.js',
        './migrations/**/*.ts',
        './seeds/**/*.ts',
        'jest.setup.ts',
        '**/__tests__/*.ts',
        '**/__mocks__/*.ts',
        './tests/**/*.ts',
      ],
      rules: {
        'import/no-extraneous-dependencies': [2, {
          devDependencies: true,
        }],
      },
    },
  ],
};
