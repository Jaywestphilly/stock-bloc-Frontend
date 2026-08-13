const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(/updated_at\?\: string;/g, 'updated_at?: string;\n  fleet_metrics?: any;');
fs.writeFileSync('src/types.ts', code);
