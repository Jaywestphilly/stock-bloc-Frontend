const fs = require('fs');
let code = fs.readFileSync('src/features/portfolio/MyBlocDashboard.tsx', 'utf8');

// We can do a simple global replacement of `localStorage.` to `safeStorage.`
// and add the wrapper at the top of the file.

const wrapper = `
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
    } catch (e) {}
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {}
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
  }
};
`;

code = code.replace(/import React, \{ /g, wrapper + "\nimport React, { ");
code = code.replace(/\blocalStorage\./g, 'safeStorage.');

fs.writeFileSync('src/features/portfolio/MyBlocDashboard.tsx', code);
