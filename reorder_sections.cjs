const fs = require('fs');

let content = fs.readFileSync('src/features/research/DysonSwarmHub.tsx', 'utf8');

// Identify the blocks:
// Block A: SpaceX Stack Diagram ({/* SPACEX STACK DIAGRAM */} ... </div>)
// Block B: 3D Globe ({/* 2. LIVE 3D SATELLITE CONSTELLATION GLOBE */} ... </div>)
// Block C: Strategic Market Intelligence ({/* 3. HERO STORY: WHY SPACEX MATTERS */} ... </div>\n      </div>)
// Block D: Interactive Project Hub ({/* 4. INTERACTIVE PROJECT HUB NAV TABS */} ... end of tab block)

// Let's inspect the markers in content
const stackMarker = '{/* SPACEX STACK DIAGRAM */}';
const globeMarker = '{/* 2. LIVE 3D SATELLITE CONSTELLATION GLOBE */}';
const storyMarker = '{/* 3. HERO STORY: WHY SPACEX MATTERS */}';
const hubMarker = '{/* 4. INTERACTIVE PROJECT HUB NAV TABS */}';

const stackIdx = content.indexOf(stackMarker);
const globeIdx = content.indexOf(globeMarker);
const storyIdx = content.indexOf(storyMarker);
const hubIdx = content.indexOf(hubMarker);

console.log({ stackIdx, globeIdx, storyIdx, hubIdx });

// Extract Hero Header (from return ( ... to stackIdx)
const headerAndBefore = content.substring(0, stackIdx);

// Extract Stack Block (from stackIdx to globeIdx)
const stackBlock = content.substring(stackIdx, globeIdx);

// Extract Globe Block (from globeIdx to storyIdx)
const globeBlock = content.substring(globeIdx, storyIdx);

// Extract Story Block (from storyIdx to hubIdx)
const storyBlock = content.substring(storyIdx, hubIdx);

// Extract Hub Block (from hubIdx to video modal or end of container div)
const videoModalMarker = '{/* VIDEO MODAL */}';
const videoModalIdx = content.indexOf(videoModalMarker);

const hubBlock = content.substring(hubIdx, videoModalIdx);
const restOfFile = content.substring(videoModalIdx);

// Assemble in desired order:
// 1. Header
// 2. Hub Block (Interactive project and telemetry hub)
// 3. Globe Block (Interactive 3D Starlink Constellation Globe)
// 4. Stack Block (The SpaceX Integrated Stack)
// 5. Story Block (Strategic Market Intelligence)
// 6. restOfFile (Video modal & closing div)

const newContent = headerAndBefore + hubBlock + globeBlock + stackBlock + storyBlock + restOfFile;

fs.writeFileSync('src/features/research/DysonSwarmHub.tsx', newContent);
console.log("Reordering done.");
