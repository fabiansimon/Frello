module.exports = {
  clearMocks: true,
  coverageProvider: 'v8',
  preset: 'ts-jest/presets/js-with-ts',
  setupFiles: ['dotenv/config'],
  transform: {
    '^.+\\.mjs$': 'ts-jest',
  },
};
