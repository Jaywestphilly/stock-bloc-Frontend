const fs = require('fs');
let file = fs.readFileSync('src/features/research/DysonSwarmHub.tsx', 'utf-8');

// Add "live_macro" (or maybe live_news, live_launches) to activeTab state - we'll just add it into starlink_hub for news, or replace starship hub with news?
// Instead, let's create a new tab "live_space_news" and "live_launches". Wait, DysonSwarmHub has a "launch_cadence" tab. We can hook it up there.
// DysonSubTab = "starlink_hub" | "starship_hub" | "launch_cadence" | "dyson_metaphor" | "spacex_history" | "space_docs" | "planet_labs" | "dyson_power"

file = file.replace(
  '| "dyson_power";',
  '| "dyson_power"\n  | "space_news";'
);

const fetchCode = `
  const [spaceNews, setSpaceNews] = useState<any[]>([]);
  const [isSpaceNewsLoading, setIsSpaceNewsLoading] = useState(false);
  const [liveLaunches, setLiveLaunches] = useState<any>(null);
  const [isLaunchesLoading, setIsLaunchesLoading] = useState(false);

  useEffect(() => {
    if (activeSubTab === "space_news" && spaceNews.length === 0) {
      setIsSpaceNewsLoading(true);
      fetch("/api/space/news")
        .then(r => r.json())
        .then(d => {
          setSpaceNews(d);
          setIsSpaceNewsLoading(false);
        })
        .catch(e => {
          console.error(e);
          setIsSpaceNewsLoading(false);
        });
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (activeSubTab === "launch_cadence" && !liveLaunches) {
      setIsLaunchesLoading(true);
      fetch("/api/space/launches")
        .then(r => r.json())
        .then(d => {
          setLiveLaunches(d);
          setIsLaunchesLoading(false);
        })
        .catch(e => {
          console.error(e);
          setIsLaunchesLoading(false);
        });
    }
  }, [activeSubTab]);
`;

file = file.replace('const [activeVideo', fetchCode + '\n  const [activeVideo');

const newsTabButton = `
            <button
              onClick={() => {
                triggerHaptic("light");
                setActiveSubTab("space_news");
              }}
              className={\`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all \${
                activeSubTab === "space_news"
                  ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                  : "bg-white/5 text-cyan-300 hover:bg-white/10 border border-cyan-900/40"
              }\`}
            >
              Live Space News
            </button>
`;

// Insert the new tab button
file = file.replace('</nav>', newsTabButton + '\n          </nav>');

// We will inject the live launches UI in the "launch_cadence" section, just above the existing mock data or replacing part of it.
// Actually, let's insert the Space News section.

const newsTabContent = `
        {/* Live Space News Panel */}
        {activeSubTab === "space_news" && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/40">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Live Spaceflight News</h3>
                <p className="text-sm text-cyan-300/70">Latest articles from Spaceflight News API</p>
              </div>
            </div>
            
            {isSpaceNewsLoading ? (
               <div className="flex items-center gap-2 text-cyan-400 p-4">
                 <div className="w-4 h-4 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
                 Fetching live news...
               </div>
            ) : spaceNews.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {spaceNews.map((news: any) => (
                   <a key={news.id} href={news.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-cyan-500/40 transition-colors flex flex-col justify-between">
                     <div>
                       <div className="text-xs text-cyan-400 font-mono mb-2">{news.news_site}</div>
                       <h4 className="text-sm font-bold text-white mb-2">{news.title}</h4>
                       <p className="text-xs text-neutral-400 line-clamp-3">{news.summary}</p>
                     </div>
                     <div className="mt-4 text-[10px] text-neutral-500 font-mono">
                       {new Date(news.published_at).toLocaleString()}
                     </div>
                   </a>
                 ))}
               </div>
            ) : (
               <div className="p-4 bg-red-900/20 text-red-400 rounded-xl">No news found or failed to load.</div>
            )}
          </div>
        )}
`;

file = file.replace('{/* -----------------------------', newsTabContent + '\n        {/* -----------------------------');

fs.writeFileSync('src/features/research/DysonSwarmHub.tsx', file);
console.log("Patched DysonSwarmHub.tsx");
