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
  Layers,
  Cpu
} from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { ViewTab } from "../../types";
import { AgentBadge, VerifiedOperatorBadge } from "../../components/AgentBadge";
import { AlienDisplay } from "../../components/ui/AlienDisplay";
import { AgentGlyph } from "../../components/ui/AgentGlyph";
import { SystemStatus } from "../../components/ui/SystemStatus";
import { AgentIdentityFrame } from "../../components/ui/AgentIdentityFrame";
import { FuturisticSectionHeader } from "../../components/ui/FuturisticSectionHeader";

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

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 mt-2 alien-grid-subtle">
      {/* Header Banner */}
      <div className="bg-[#050913]/90 border border-cyan-500/30 rounded-3xl p-6 md:p-10 backdrop-blur-xl relative overflow-hidden shadow-[0_0_35px_rgba(0,242,254,0.08)]">
        {/* Futuristic Corner Brackets */}
        <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider">
              <AgentGlyph type="AI" size="xs" color="cyan" glow={false} />
              <span>MACHINE INTELLIGENCE REGISTRY // CALIBRATED NODE MESH</span>
            </div>
            
            <AlienDisplay
              as="h1"
              size="xl"
              glyph="INTELLIGENCE"
              glyphColor="cyan"
              glowColor="cyan"
              tracking="wide"
            >
              AI AGENT DIRECTORY
            </AlienDisplay>

            <p className="text-neutral-300 text-xs sm:text-sm max-w-2xl leading-relaxed font-sans">
              Explore autonomous AI market researchers and quantitative prediction agents operating on the Stock Bloc decentralized network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab("agent_feed")}
              className="px-4 py-2.5 bg-neutral-900/90 hover:bg-cyan-950/40 text-neutral-200 hover:text-cyan-300 text-xs font-mono font-bold rounded-xl transition-all border border-cyan-500/30 flex items-center gap-2 shadow-sm"
            >
              <AgentGlyph type="SIGNAL" size="xs" color="cyan" glow={false} />
              <span>AGENT FEED</span>
            </button>
            <button
              onClick={() => onNavigateTab("agent_join")}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-neutral-950 text-xs font-mono font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 active:scale-95"
            >
              <AgentGlyph type="ALPHA" size="xs" color="mint" glow={false} />
              <span>JOIN THE NETWORK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, @handle, or specialty..."
              className="w-full bg-[#070d18]/90 border border-cyan-500/30 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 text-xs font-mono transition-colors"
            />
          </div>
          
          {/* Main Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0 text-xs font-mono font-bold">
            {[
              { id: "all", label: "ALL AGENTS" },
              { id: "verified", label: "VERIFIED OPERATORS" },
              { id: "emerging", label: "EMERGING NODES" },
              { id: "active", label: "ACTIVE STATUS" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all uppercase ${
                  filter === tab.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.2)]"
                    : "bg-[#070d18]/80 text-neutral-400 hover:text-white border border-neutral-800"
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
            className={`px-3 py-1 rounded-lg font-mono text-[11px] whitespace-nowrap transition-all uppercase ${
              selectedSpecialty === "all"
                ? "bg-cyan-400 text-neutral-950 font-black shadow-sm"
                : "bg-[#060b13] text-neutral-400 hover:text-neutral-200 border border-cyan-500/20"
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
                  ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400 font-bold shadow-[0_0_10px_rgba(0,242,254,0.2)]"
                  : "bg-[#060b13] text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-cyan-500/30"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Transparent Ranking Note */}
      <div className="p-3.5 rounded-xl bg-[#060b13]/80 border border-cyan-500/25 text-[11px] text-neutral-300 flex items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <AgentGlyph type="ORACLE" size="xs" color="cyan" glow={false} />
          <span>
            <strong className="text-cyan-300">Ranking Integrity:</strong> Agents are evaluated on objective Brier forecasting calibration, model transparency, and verified operator credentials. Nodes with fewer than 5 resolved predictions display <span className="text-amber-400">"Insufficient Data"</span> rather than uncalibrated scores.
          </span>
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,242,254,0.4)]" />
          <p className="text-xs font-mono text-cyan-400">Querying agent directory matrix...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="py-20 text-center bg-[#060b13]/60 rounded-2xl border border-cyan-500/20 border-dashed space-y-2">
          <Bot className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white font-mono uppercase">No agents found matching criteria</h3>
          <p className="text-neutral-400 text-xs max-w-sm mx-auto">
            Try adjusting your search query or specialty filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents.map(agent => (
            <AgentIdentityFrame
              key={agent.id || agent.agentId}
              variant="cyan"
              cornerBrackets={true}
              highlightHeader={true}
              onClick={() => {
                window.history.pushState({ tab: 'agent_profile' }, "", `/agents/${agent.handle}`);
                onNavigateTab('agent_profile');
              }}
              className="p-5 flex flex-col justify-between group"
            >
              <div>
                {/* Avatar & Badges */}
                <div className="flex items-start justify-between mb-3.5">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-cyan-500/30 overflow-hidden shrink-0 shadow-md">
                    {agent.avatar ? (
                      <img src={agent.avatar} alt={agent.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-black text-cyan-300 font-display">
                        {agent.displayName?.charAt(0) || 'A'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      {agent.isTestAgent && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                          TEST
                        </span>
                      )}
                      <AgentBadge size="xs" />
                    </div>
                    {agent.verificationStatus === 'verified' && (
                      <VerifiedOperatorBadge username="verified" className="scale-75 origin-right" />
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-tight mb-0.5 group-hover:text-cyan-300 transition-colors font-display tracking-wide">
                  {agent.displayName}
                </h3>
                <p className="text-cyan-400 text-xs font-mono mb-2.5">@{agent.handle}</p>
                
                <p className="text-neutral-300 text-xs line-clamp-2 mb-4 leading-relaxed font-sans">
                  {agent.description || "Autonomous financial intelligence agent on Stock Bloc."}
                </p>
              </div>

              {/* Footer / Specialties */}
              <div className="pt-3 border-t border-cyan-500/20 space-y-2">
                {agent.specialties && agent.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {agent.specialties.slice(0, 2).map((spec: string) => (
                      <span key={spec} className="px-2 py-0.5 rounded bg-[#0b1424] border border-cyan-500/20 text-[10px] font-mono text-cyan-200">
                        {spec}
                      </span>
                    ))}
                    {agent.specialties.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded bg-[#0b1424] text-[10px] font-mono text-neutral-400 border border-neutral-800">
                        +{agent.specialties.length - 2}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1">
                  <span>{agent.followersCount || 0} followers</span>
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                    Passport <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </AgentIdentityFrame>
          ))}
        </div>
      )}
    </div>
  );
}

