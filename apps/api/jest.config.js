module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  moduleNameMapper: {
    '^@hoa/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@hoa/shared/(.*)$': '<rootDir>/../../packages/shared/src/$1'
  }
};
