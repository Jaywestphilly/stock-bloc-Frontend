const fs = require('fs');
let code = fs.readFileSync('src/app/App.tsx', 'utf8');

// Replace localStorage.setItem("stock_bloc_onboarding_dismissed"
code = code.replace(
  /localStorage\.setItem\("stock_bloc_onboarding_dismissed", "true"\);/g,
  'try { localStorage.setItem("stock_bloc_onboarding_dismissed", "true"); } catch (e) {}'
);

// Replace const dismissed = localStorage.getItem("stock_bloc_onboarding_dismissed");
code = code.replace(
  /const dismissed = localStorage\.getItem\("stock_bloc_onboarding_dismissed"\);/g,
  'let dismissed = null; try { dismissed = localStorage.getItem("stock_bloc_onboarding_dismissed"); } catch (e) {}'
);

// Replace localStorage.getItem("stockbloc_day_mode") if it isn't wrapped
// Wait, in App.tsx it's currently:
//      const stored = localStorage.getItem("stockbloc_day_mode");
//      if (stored === null) {
// let's just wrap it.
code = code.replace(
  /const stored = localStorage\.getItem\("stockbloc_day_mode"\);/g,
  'let stored = null; try { stored = localStorage.getItem("stockbloc_day_mode"); } catch (e) {}'
);

fs.writeFileSync('src/app/App.tsx', code);
