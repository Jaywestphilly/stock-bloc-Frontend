const fs = require('fs');
let app = fs.readFileSync('src/app/App.tsx', 'utf-8');

const importStatement = `const MitCoursesHub = safeLazy(
  () => import("../features/education/MitCoursesHub").then(module => ({ default: module.MitCoursesHub })),
  "MitCoursesHub"
);`;

app = app.replace("const TerminalGuideHub", importStatement + "\nconst TerminalGuideHub");

const renderStatement = `        {activeTab === "mit_courses" && <MitCoursesHub />}`;

app = app.replace("{activeTab === \"terminal_guide\" && <TerminalGuideHub onOpenTerminal={() => handleSelectTab(\"terminal\")} />}", "{activeTab === \"terminal_guide\" && <TerminalGuideHub onOpenTerminal={() => handleSelectTab(\"terminal\")} />}\n" + renderStatement);

fs.writeFileSync('src/app/App.tsx', app);
console.log("Patched App.tsx");
