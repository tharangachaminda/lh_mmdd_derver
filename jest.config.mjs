/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testMatch: ['**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.json'
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(node-llama-cpp|lifecycle-utils)/)',
  ],
  moduleFileExtensions: ['ts', 'mts', 'js', 'mjs', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts'],
  testTimeout: 10000,
};
