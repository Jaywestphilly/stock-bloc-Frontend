const fs = require('fs');
let file = fs.readFileSync('src/features/portfolio/RealEstateHub.tsx', 'utf-8');

// Add "live_macro" to activeTab state
file = file.replace(
  '"calculator" | "first_home" | "strategies" | "reits"',
  '"calculator" | "first_home" | "strategies" | "reits" | "live_macro"'
);

// Add the fetch logic inside RealEstateHub
const fetchCode = `
  const [macroData, setMacroData] = useState<any>(null);
  const [isMacroLoading, setIsMacroLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "live_macro" && !macroData) {
      setIsMacroLoading(true);
      fetch("/api/macro/real-estate")
        .then(r => r.json())
        .then(d => {
          setMacroData(d);
          setIsMacroLoading(false);
        })
        .catch(e => {
          console.error(e);
          setIsMacroLoading(false);
        });
    }
  }, [activeTab]);
`;

file = file.replace('const [expandedStrategyId', fetchCode + '\n  const [expandedStrategyId');

// Add the tab button
const tabButtons = `
          <button
            onClick={() => setActiveTab("live_macro")}
            className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all \${
              activeTab === "live_macro"
                ? "bg-white text-black shadow-md"
                : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
            }\`}
          >
            <LineChart className="w-4 h-4" />
            Live Market Data
          </button>
`;

file = file.replace('</nav>', tabButtons + '\n        </nav>');

// Add the tab content
const tabContent = `
        {activeTab === "live_macro" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-neutral-900/50 border border-white/5 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-2">Live Real Estate Macro Data</h2>
              <p className="text-sm text-neutral-400 mb-6">Real-time data sourced from the Federal Reserve Economic Data (FRED) API.</p>
              
              {isMacroLoading ? (
                <div className="flex items-center gap-2 text-neutral-400 p-4">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Fetching live data from FRED...
                </div>
              ) : macroData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">30-Year Fixed Mortgage</h3>
                    <div className="text-3xl font-black text-white">{macroData.mortgage?.[0]?.value}%</div>
                    <p className="text-xs text-neutral-500 mt-2">Last updated: {macroData.mortgage?.[0]?.date}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Housing Starts</h3>
                    <div className="text-3xl font-black text-white">{macroData.housingStarts?.[0]?.value}K</div>
                    <p className="text-xs text-neutral-500 mt-2">New privately-owned housing units (Annual Rate)<br/>Last updated: {macroData.housingStarts?.[0]?.date}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Case-Shiller Index</h3>
                    <div className="text-3xl font-black text-white">{macroData.caseShiller?.[0]?.value}</div>
                    <p className="text-xs text-neutral-500 mt-2">National Home Price Index<br/>Last updated: {macroData.caseShiller?.[0]?.date}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-900/20 text-red-400 text-sm">Failed to load macro data.</div>
              )}
            </div>
          </div>
        )}
`;

file = file.replace('{activeTab === "reits" && (', tabContent + '\n        {activeTab === "reits" && (');

// Add LineChart import if missing
if (!file.includes('LineChart,')) {
  file = file.replace('Calculator,', 'Calculator,\n  LineChart,');
}

fs.writeFileSync('src/features/portfolio/RealEstateHub.tsx', file);
console.log("Patched RealEstateHub.tsx");
