const fs = require('fs');
let file = fs.readFileSync('src/features/research/DysonSwarmHub.tsx', 'utf-8');

const launchesContent = `
            {/* Live Launch Manifest (from API) */}
            {isLaunchesLoading ? (
              <div className="flex items-center gap-2 text-cyan-400 p-4 bg-neutral-900/50 rounded-2xl border border-white/5">
                <div className="w-4 h-4 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
                Fetching live SpaceX launches...
              </div>
            ) : liveLaunches ? (
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Rocket className="w-4 h-4" /> Live Upcoming Orbital Launch Schedule
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {(liveLaunches.upcoming || []).slice(0, 5).map((launch: any) => (
                    <div key={launch.id} className="p-4 rounded-xl bg-neutral-900/80 border border-white/10 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-black text-white text-sm">{launch.name}</div>
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono text-[10px]">
                          {new Date(launch.date_utc).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Flight Number: {launch.flight_number}
                      </div>
                      {launch.links?.webcast && (
                         <a href={launch.links.webcast} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-[10px] hover:underline">Watch Webcast</a>
                      )}
                    </div>
                  ))}
                  {(!liveLaunches.upcoming || liveLaunches.upcoming.length === 0) && (
                    <div className="text-neutral-500 text-xs">No upcoming launches found in API.</div>
                  )}
                </div>
              </div>
            ) : null}
`;

file = file.replace('{/* Upcoming Launch Manifest */}', launchesContent + '\n            {/* Upcoming Launch Manifest */}');

fs.writeFileSync('src/features/research/DysonSwarmHub.tsx', file);
console.log("Patched DysonSwarmHub.tsx for launches");
