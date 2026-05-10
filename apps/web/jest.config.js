module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx', module: 'CommonJS' } }]
  },
  moduleNameMapper: {
    '^@hoa/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@hoa/shared/(.*)$': '<rootDir>/../../packages/shared/src/$1'
  }
};
