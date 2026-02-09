import '@testing-library/jest-dom';

// Polyfill for Angular testing
globalThis.ngJest = {
  skipNgcc: true,
  tsconfig: 'tsconfig.spec.json',
};
