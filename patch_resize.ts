import fs from 'fs';
let content = fs.readFileSync('src/components/Starlink3DGlobe.tsx', 'utf8');

content = content.replace(
  `width={isFullscreen ? window.innerWidth : undefined}`,
  ``
);

fs.writeFileSync('src/components/Starlink3DGlobe.tsx', content);
