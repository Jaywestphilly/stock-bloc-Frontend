const fs = require('fs');

let content = fs.readFileSync('src/features/research/DysonSwarmHub.tsx', 'utf8');

// 1. Remove STARLINK_SHELLS import
content = content.replace(/\s*STARLINK_SHELLS,/, '');

// 2. Remove search state and handleSearchMission
const searchStateRegex = /\/\/ Grounded Search State[\s\S]*?const handleSearchMission = async [\s\S]*?\}\s*;/;
content = content.replace(searchStateRegex, '');

// 3. Remove Orbital Shells Table
const shellsTableRegex = /\{\/\* Orbital Shells Table \*\/\}[\s\S]*?<\/div>\s*<\/div>/;
content = content.replace(shellsTableRegex, '');

// 4. Remove Grounded Search Form
const searchFormRegex = /\{\/\* 5\. GROUNDED SEARCH MISSION VERIFICATION FORM \*\/\}[\s\S]*?<\/div>\s*<\/div>/;
content = content.replace(searchFormRegex, '');

fs.writeFileSync('src/features/research/DysonSwarmHub.tsx', content);
console.log("Cleanup done.");
