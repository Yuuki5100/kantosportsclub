// jest.config.js
import nextJest from 'next/jest.js';

// Next.js の Jest 設定ファクトリ
const createJestConfig = nextJest({
  dir: './',
});

// カスタムJest設定
const customJestConfig = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jest-environment-jsdom',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: './src/tsconfig.json' }],
  },

  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: './tsconfig.json',
    },
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@composite/(.*)$': '<rootDir>/src/components/composite/$1',
    '^@base/(.*)$': '<rootDir>/src/components/base/$1',
    '^@functional/(.*)$': '<rootDir>/src/components/functional/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@slices/(.*)$': '<rootDir>/src/slices/$1',
    '^@lang/(.*)$': '<rootDir>/src/lang/$1',
    '^next/router$': 'next-router-mock',
    '^next/navigation$': 'next-router-mock/next-navigation',
  },

  moduleDirectories: ['node_modules', 'src'],

  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.(ts|tsx)',
    '<rootDir>/src/__tests__/**/*.test.(ts|tsx)',
    '<rootDir>/src/**/*.test.(ts|tsx)',
  ],

  collectCoverage: false,
  coveragePathIgnorePatterns: [
    'src/stories',
    'src/pages',
    'src/lang',
    'src/utils/file',
    'src/api',
    'src/components/base',
    'src/components/composite',
    'src/components/CRJ',
    'src/components/providers',
    'src/components/sample',
    'src/slices',
    'src/styles',
    'src/theme',
    'src/types',
    'src/config',
    'src/const/CRJ',
    'src/message',
  ],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!src/**/*.stories.{ts,tsx}',
  ],

  coverageReporters: [
    ['html'], // ✅ index.html を明示的に出力
    'text',
    'json',
    'lcov',
  ],
  coverageDirectory: '<rootDir>/coverage',

  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Test Report',
        outputPath: '<rootDir>/scripts/jest-report.html',
      },
    ],
  ],
};

export default createJestConfig(customJestConfig);
