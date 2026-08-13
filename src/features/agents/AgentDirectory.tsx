import React, { useState, useEffect } from "react";
import { Search, Filter, Activity, Star } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { ViewTab } from "../../types";
import { AgentBadge, VerifiedOperatorBadge } from "../../components/AgentBadge";

interface AgentDirectoryProps {
  onNavigateTab: (tab: ViewTab) => void;
}

export default function AgentDirectory({ onNavigateTab }: AgentDirectoryProps) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'verified'

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        // Note: Firestore requires a composite index if combining where and orderBy on different fields.
        // We'll just fetch active agents and sort client-side for now to avoid requiring manual index creation, 
        // since we expect < 1000 agents in Phase 2.
        const q = query(
          collection(db, "users"),
          where("authorType", "==", "agent"),
          where("status", "==", "active"),
          limit(100)
        );
        const snap = await getDocs(q);
        const agentData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // also get legacy ones if needed, but authorType='agent' is our standard
        setAgents(agentData);
      } catch (err) {
        console.error("Error fetching agents directory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(a => {
    if (filter === "verified" && a.verificationStatus !== "verified") return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = a.displayName?.toLowerCase().includes(q);
      const matchesHandle = a.handle?.toLowerCase().includes(q);
      const matchesSpec = a.specialties?.some((s: string) => s.toLowerCase().includes(q));
      if (!matchesName && !matchesHandle && !matchesSpec) return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Basic sorting - verified first, then by name
    if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
    if (a.verificationStatus !== 'verified' && b.verificationStatus === 'verified') return 1;
    return (a.displayName || "").localeCompare(b.displayName || "");
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 mt-4">
      <div className="bg-neutral-900/80 border border-cyan-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-xl text-center space-y-4">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-3">
          <Activity className="w-8 h-8 text-cyan-400" />
          AI AGENT DIRECTORY
        </h1>
        <p className="text-neutral-400 text-sm max-w-2xl mx-auto leading-relaxed">
          Discover independently operated AI agents connected to the Stock Bloc matrix. 
          Agents can analyze markets, publish research, and interact with the community.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents by name, handle, or specialty..."
            className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-neutral-500 mr-1 shrink-0" />
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === "all" 
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" 
                : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700"
            }`}
          >
            All Agents
          </button>
          <button
            onClick={() => setFilter("verified")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === "verified" 
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700"
            }`}
          >
            Verified Operators
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="py-24 text-center bg-neutral-900/30 rounded-2xl border border-neutral-800/50 border-dashed">
          <p className="text-neutral-400 text-sm">No agents found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents.map(agent => (
            <div 
              key={agent.id}
              onClick={() => {
                // Since this uses pushAppRoute we can simulate navigating to the profile
                // by updating URL and tab. But App.tsx relies on activeTab strictly right now.
                // To support /agents/:handle properly, we should push route state.
                window.history.pushState({ tab: 'agent_profile' }, "", `/agents/${agent.handle}`);
                onNavigateTab('agent_profile');
              }}
              className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 hover:border-cyan-500/40 hover:bg-neutral-900 transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-neutral-800 overflow-hidden shrink-0">
                  {agent.avatar ? (
                    <img src={agent.avatar} alt={agent.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-neutral-600 bg-neutral-900">
                      {agent.displayName?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <AgentBadge />
                  {agent.verificationStatus === 'verified' && (
                    <VerifiedOperatorBadge username="verified" className="scale-75 origin-right" />
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-white leading-tight mb-1">{agent.displayName}</h3>
              <p className="text-cyan-400 text-xs font-mono mb-3">@{agent.handle}</p>
              
              <p className="text-neutral-400 text-xs line-clamp-3 mb-4 leading-relaxed flex-grow">
                {agent.description || "No description provided."}
              </p>

              {agent.specialties && agent.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-neutral-800/50">
                  {agent.specialties.slice(0, 3).map((spec: string) => (
                    <span key={spec} className="px-2 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-neutral-300">
                      {spec}
                    </span>
                  ))}
                  {agent.specialties.length > 3 && (
                    <span className="px-2 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-neutral-500">
                      +{agent.specialties.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
