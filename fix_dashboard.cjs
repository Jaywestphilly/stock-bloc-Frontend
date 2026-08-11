const fs = require('fs');
let code = fs.readFileSync('src/features/portfolio/MyBlocDashboard.tsx', 'utf8');

// Fix the safeStorage wrapper
code = code.replace(/window\.safeStorage/g, 'window.localStorage');
fs.writeFileSync('src/features/portfolio/MyBlocDashboard.tsx', code);
