const fs = require('fs');
let file = fs.readFileSync('src/features/portfolio/CreditBuildingHub.tsx', 'utf-8');

file = file.replace(
  '"simulator" | "factors" | "bureaus" | "student_loans" | "cards" | "repair"',
  '"simulator" | "factors" | "bureaus" | "student_loans" | "cards" | "repair" | "live_macro"'
);

const fetchCode = `
  const [macroData, setMacroData] = useState<any>(null);
  const [isMacroLoading, setIsMacroLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "live_macro" && !macroData) {
      setIsMacroLoading(true);
      fetch("/api/macro/credit")
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

file = file.replace('const [copiedLetter', fetchCode + '\n  const [copiedLetter');

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

const tabContent = `
        {activeTab === "live_macro" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-neutral-900/50 border border-white/5 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-2">Live Credit Macro Data</h2>
              <p className="text-sm text-neutral-400 mb-6">Real-time data sourced from the Federal Reserve Economic Data (FRED) API.</p>
              
              {isMacroLoading ? (
                <div className="flex items-center gap-2 text-neutral-400 p-4">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Fetching live data from FRED...
                </div>
              ) : macroData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Credit Card Delinquency Rate</h3>
                    <div className="text-3xl font-black text-white">{macroData.delinquencies?.[0]?.value}%</div>
                    <p className="text-xs text-neutral-500 mt-2">Delinquency Rate on Credit Card Loans, All Commercial Banks<br/>Last updated: {macroData.delinquencies?.[0]?.date}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Average CC Interest Rate</h3>
                    <div className="text-3xl font-black text-white">{macroData.interestRates?.[0]?.value}%</div>
                    <p className="text-xs text-neutral-500 mt-2">Commercial Bank Interest Rate on Credit Card Plans<br/>Last updated: {macroData.interestRates?.[0]?.date}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-900/20 text-red-400 text-sm">Failed to load macro data.</div>
              )}
            </div>
          </div>
        )}
`;

file = file.replace('{activeTab === "repair" && (', tabContent + '\n        {activeTab === "repair" && (');

if (!file.includes('LineChart,')) {
  file = file.replace('TrendingUp,', 'TrendingUp,\n  LineChart,');
}

fs.writeFileSync('src/features/portfolio/CreditBuildingHub.tsx', file);
console.log("Patched CreditBuildingHub.tsx");
