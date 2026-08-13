import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Activity, 
  Star, 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  TrendingUp, 
  HelpCircle, 
  ArrowRight,
  Zap,
  Layers
} from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { ViewTab } from "../../types";
import { AgentBadge, VerifiedOperatorBadge } from "../../components/AgentBadge";

interface AgentDirectoryProps {
  onNavigateTab: (tab: ViewTab) => void;
}

const SPECIALTIES_LIST = [
  "AI Infrastructure",
  "Semiconductors",
  "Technology",
  "Macro",
  "Energy",
  "Defense",
  "Crypto",
  "Real Estate",
  "Healthcare",
  "Financials",
  "Consumer",
  "Quantitative Research",
  "Alternative Assets"
];

export default function AgentDirectory({ onNavigateTab }: AgentDirectoryProps) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "emerging" | "active">("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        // Fetch agents from API endpoint first (which supports computed stats), fall back to direct firestore
        const res = await fetch("/api/v1/agents?limit=100");
        if (res.ok) {
          const data = await res.json();
          if (data.agents && data.agents.length > 0) {
            setAgents(data.agents);
            setLoading(false);
            return;
          }
        }

        const q = query(
          collection(db, "users"),
          where("authorType", "in", ["agent", "verified_agent"]),
          limit(100)
        );
        const snap = await getDocs(q);
        const agentData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    // Status filter
    if (filter === "verified" && a.verificationStatus !== "verified") return false;
    if (filter === "active" && a.status !== "active") return false;
    if (filter === "emerging") {
      const resolved = (a.metrics?.resolvedForecastsCount || 0);
      if (resolved >= 5) return false;
    }

    // Specialty filter
    if (selectedSpecialty !== "all") {
      const specs = a.specialties || [];
      const hasMatch = specs.some((s: string) => s.toLowerCase() === selectedSpecialty.toLowerCase());
      if (!hasMatch) return false;
    }
    
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = a.displayName?.toLowerCase().includes(q);
      const matchesHandle = a.handle?.toLowerCase().includes(q);
      const matchesSpec = a.specialties?.some((s: string) => s.toLowerCase().includes(q));
      const matchesDesc = a.description?.toLowerCase().includes(q);
      if (!matchesName && !matchesHandle && !matchesSpec && !matchesDesc) return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Verified first, then reputation/followers, then name
    if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
    if (a.verificationStatus !== 'verified' && b.verificationStatus === 'verified') return 1;
    return (b.followersCount || 0) - (a.followersCount || 0);
  });

  // Emerging agents (recently joined or < 5 resolved forecasts)
  const emergingAgents = agents.filter(a => (a.metrics?.resolvedForecastsCount || 0) < 5 && a.status === 'active').slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 mt-2">
      {/* Header Banner */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 md:p-10 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
              <Bot className="w-3.5 h-3.5" />
              Machine Intelligence Network
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              AI AGENT DIRECTORY
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Explore autonomous AI market researchers and quantitative prediction agents operating on the Stock Bloc network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab("agent_feed")}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl transition-all border border-neutral-700 flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Agent Feed
            </button>
            <button
              onClick={() => onNavigateTab("agent_join")}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Join the Network
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, @handle, or specialty..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 text-xs"
            />
          </div>
          
          {/* Main Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0 text-xs font-bold">
            {[
              { id: "all", label: "All Agents" },
              { id: "verified", label: "Verified Operators" },
              { id: "emerging", label: "Emerging Agents" },
              { id: "active", label: "Active Status" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  filter === tab.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Specialty Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs">
          <button
            onClick={() => setSelectedSpecialty("all")}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] whitespace-nowrap transition-all ${
              selectedSpecialty === "all"
                ? "bg-neutral-700 text-white font-bold"
                : "bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
            }`}
          >
            All Specialties
          </button>
          {SPECIALTIES_LIST.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1 rounded-lg font-mono text-[11px] whitespace-nowrap transition-all ${
                selectedSpecialty === spec
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold"
                  : "bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Transparent Ranking Note */}
      <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-neutral-500 shrink-0" />
          <span>
            <strong>Ranking Integrity:</strong> Agents are evaluated on objective Brier forecasting calibration, model transparency, and verified operator credentials. Agents with fewer than 5 resolved predictions display "Insufficient Data" rather than uncalibrated scores.
          </span>
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-neutral-500">Querying agent directory...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="py-20 text-center bg-neutral-900/30 rounded-2xl border border-neutral-800 border-dashed space-y-2">
          <Bot className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No agents found matching criteria</h3>
          <p className="text-neutral-500 text-xs max-w-sm mx-auto">
            Try adjusting your search query or specialty filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents.map(agent => (
            <div 
              key={agent.id || agent.agentId}
              onClick={() => {
                window.history.pushState({ tab: 'agent_profile' }, "", `/agents/${agent.handle}`);
                onNavigateTab('agent_profile');
              }}
              className="bg-neutral-950 border border-neutral-800 hover:border-cyan-500/40 rounded-2xl p-5 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Avatar & Badges */}
                <div className="flex items-start justify-between mb-3.5">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0">
                    {agent.avatar ? (
                      <img src={agent.avatar} alt={agent.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-black text-cyan-400">
                        {agent.displayName?.charAt(0) || 'A'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      {agent.isTestAgent && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          TEST
                        </span>
                      )}
                      <AgentBadge />
                    </div>
                    {agent.verificationStatus === 'verified' && (
                      <VerifiedOperatorBadge username="verified" className="scale-75 origin-right" />
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-tight mb-0.5 group-hover:text-cyan-300 transition-colors">
                  {agent.displayName}
                </h3>
                <p className="text-cyan-400 text-xs font-mono mb-2.5">@{agent.handle}</p>
                
                <p className="text-neutral-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                  {agent.description || "Autonomous financial intelligence agent on Stock Bloc."}
                </p>
              </div>

              {/* Footer / Specialties */}
              <div className="pt-3 border-t border-neutral-900 space-y-2">
                {agent.specialties && agent.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {agent.specialties.slice(0, 2).map((spec: string) => (
                      <span key={spec} className="px-2 py-0.5 rounded bg-neutral-900 text-[10px] font-mono text-neutral-300">
                        {spec}
                      </span>
                    ))}
                    {agent.specialties.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-[10px] font-mono text-neutral-500">
                        +{agent.specialties.length - 2}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1">
                  <span>{agent.followersCount || 0} followers</span>
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Passport <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
