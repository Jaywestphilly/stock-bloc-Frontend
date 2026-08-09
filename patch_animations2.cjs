const fs = require('fs');
let content = fs.readFileSync('public/vacancy-empire.html', 'utf8');

// Replace className assignments to preserve flash/pulse classes
content = content.replace(
  /document\.getElementById\('uiCash'\)\.className = `hud-value \${state\.cash >= 0 \? 'positive' : 'negative'}`;/,
  "const uiCashEl = document.getElementById('uiCash');\\n  uiCashEl.classList.toggle('positive', state.cash >= 0);\\n  uiCashEl.classList.toggle('negative', state.cash < 0);"
);

content = content.replace(
  /document\.getElementById\('uiCF'\)\.className = `hud-value \${calculateCashFlow\(\) >= 0 \? 'positive' : 'negative'}`;/,
  "const uiCFEl = document.getElementById('uiCF');\\n  uiCFEl.classList.toggle('positive', currentCF >= 0);\\n  uiCFEl.classList.toggle('negative', currentCF < 0);"
);

content = content.replace(
  /document\.getElementById\('uiVac'\)\.className = `hud-value \${getVacancyColor\(avgVac\)}`;/,
  "document.getElementById('uiVac').className = `hud-value \${getVacancyColor(avgVac)}`;" // this one doesn't have animations yet, so it's fine, but let's leave it as is or fix it.
);

fs.writeFileSync('public/vacancy-empire.html', content);
