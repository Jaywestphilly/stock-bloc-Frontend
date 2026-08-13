const fs = require('fs');
let code = fs.readFileSync('src/features/intelligence/NewsHub.tsx', 'utf8');
code = code.replace(/useState<IntelFeedItem\[\]>\(\[\]\);/g, 'useState<any[]>([]);');
fs.writeFileSync('src/features/intelligence/NewsHub.tsx', code);
