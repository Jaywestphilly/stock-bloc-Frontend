const fs = require('fs');
let code = fs.readFileSync('src/app/App.tsx', 'utf8');
code = code.replace(/exportName\?\: string\n\)\: React\.ComponentType<any>\n\) \{/g, 'exportName?: string\n): React.ComponentType<any> {');
fs.writeFileSync('src/app/App.tsx', code);
