const fs = require('fs');
let content = fs.readFileSync('public/vacancy-empire.html', 'utf8');

content = content.replace(/\\n/g, '\n');
fs.writeFileSync('public/vacancy-empire.html', content);
