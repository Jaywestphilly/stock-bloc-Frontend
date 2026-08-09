const fs = require('fs');
let content = fs.readFileSync('public/vacancy-empire.html', 'utf8');

const newCSS = `
  @keyframes flashGreen {
    0% { color: #fff; text-shadow: 0 0 30px var(--green); transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  @keyframes pulseRed {
    0% { color: #fff; text-shadow: 0 0 30px var(--red); transform: scale(0.95); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .hud-value { transition: transform 0.2s; display: inline-block; }
  .hud-value.flash-green { animation: flashGreen 0.6s ease-out; }
  .hud-value.pulse-red { animation: pulseRed 0.6s ease-in-out; }
`;

content = content.replace('.hud-value.highlight { color: var(--teal); }', '.hud-value.highlight { color: var(--teal); }' + newCSS);

const newJS = `
function animateValue(id, oldVal, newVal) {
  const el = document.getElementById(id);
  if (!el) return;
  if (newVal > oldVal) {
    el.classList.remove('flash-green', 'pulse-red');
    void el.offsetWidth; // trigger reflow
    el.classList.add('flash-green');
  } else if (newVal < oldVal) {
    el.classList.remove('flash-green', 'pulse-red');
    void el.offsetWidth;
    el.classList.add('pulse-red');
  }
}

let lastCash = 0;
let lastCF = 0;
let lastNW = 0;

function updateUI() {
`;

content = content.replace('function updateUI() {', newJS);

const newUpdateUI = `
  if (state.cash !== lastCash) animateValue('uiCash', lastCash, state.cash);
  const currentCF = calculateCashFlow();
  if (currentCF !== lastCF) animateValue('uiCF', lastCF, currentCF);
  if (state.netWorth !== lastNW) animateValue('uiNW', lastNW, state.netWorth);

  lastCash = state.cash;
  lastCF = currentCF;
  lastNW = state.netWorth;

  document.getElementById('uiCash').innerText = fmt.format(state.cash);
`;

content = content.replace("  document.getElementById('uiCash').innerText = fmt.format(state.cash);", newUpdateUI);

fs.writeFileSync('public/vacancy-empire.html', content);
