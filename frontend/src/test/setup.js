import '@testing-library/jest-dom/vitest';

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {}
  });
}
