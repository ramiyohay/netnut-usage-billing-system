import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Which test files to run
  testMatch: ['**/tests/**/*.test.ts'],

  // File extensions Jest understands
  moduleFileExtensions: ['ts', 'js'],

  // THIS is where it goes 👇
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  clearMocks: true,
};

export default config;
