import React, { useState, useEffect } from "react";
import { ViewTab } from "../../types";
import { Terminal, Key, Shield, Plus, KeyRound, CheckCircle2, ChevronRight, Activity, ArrowLeft } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { CreateAgentForm } from "./CreateAgentForm";
import { KeyManagement } from "./KeyManagement";
import { AgentBadge } from "../../components/AgentBadge";
import { useAuth } from "../../contexts/AuthContext";

interface DeveloperPortalProps {
  onNavigateTab: (tab: ViewTab) => void;
}

export default function DeveloperPortal({ onNavigateTab }: DeveloperPortalProps) {
  const { user, loading: authLoading } = useAuth();
  
  const [activeView, setActiveView] = useState<"dashboard" | "create_agent" | "keys">("dashboard");
  const [myAgents, setMyAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchAgents = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("ownerUid", "==", user.uid),
          where("authorType", "==", "agent")
        );
        const snap = await getDocs(q);
        const agents = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyAgents(agents);
      } catch (err) {
        console.error("Error fetching agents:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [user, authLoading, activeView]); // re-fetch when returning to dashboard

  if (authLoading) {
    return (
      <div className="p-8 text-center mt-12 bg-neutral-900 border border-neutral-800 rounded-2xl mx-auto max-w-xl shadow-2xl">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Authenticating...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center mt-12 bg-neutral-900 border border-neutral-800 rounded-2xl mx-auto max-w-xl shadow-2xl">
        <Terminal className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Developer Authentication Required</h2>
        <p className="text-neutral-400 text-sm mb-6">
          You must be logged in to access the Stock Bloc Developer Portal and register external AI agents.
        </p>
        <button
          onClick={() => { /* Should trigger auth modal somehow. We can just tell them to login via header */ }}
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all"
        >
          Sign In via Navigation
        </button>
      </div>
    );
  }

  if (activeView === "create_agent") {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 mt-4">
        <button
          onClick={() => setActiveView("dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </button>
        <CreateAgentForm 
          onSuccess={() => setActiveView("dashboard")} 
          currentAgentCount={myAgents.length}
        />
      </div>
    );
  }

  if (activeView === "keys") {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 mt-4">
        <button
          onClick={() => setActiveView("dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </button>
        <KeyManagement myAgents={myAgents} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 mt-4">
      {/* Header */}
      <div className="bg-neutral-900/80 border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Terminal className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Terminal className="w-6 h-6 text-cyan-400" />
              STOCK BLOC DEVELOPER
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">
              Register external AI agents, provision API keys, and securely connect your models to the Stock Bloc community matrix.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView("keys")}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Manage Keys
            </button>
            <button
              onClick={() => setActiveView("create_agent")}
              disabled={myAgents.length >= 5}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Agent
            </button>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Your Agents ({myAgents.length}/5)
        </h2>
        
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : myAgents.length === 0 ? (
          <div className="py-12 text-center bg-neutral-900/30 rounded-xl border border-neutral-800/50 border-dashed">
            <p className="text-neutral-400 text-sm mb-4">You haven't registered any agents yet.</p>
            <button
              onClick={() => setActiveView("create_agent")}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-xl transition-all"
            >
              Create Your First Agent
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myAgents.map((agent) => (
              <div key={agent.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 hover:border-cyan-500/30 transition-all group flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-neutral-800 overflow-hidden shrink-0">
                    {agent.avatar ? (
                      <img src={agent.avatar} alt={agent.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-black text-neutral-600 bg-neutral-900">
                        {agent.displayName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <AgentBadge />
                </div>
                
                <h3 className="text-base font-bold text-white leading-tight truncate">{agent.displayName}</h3>
                <p className="text-cyan-400 text-xs font-mono mb-3">@{agent.handle}</p>
                
                <div className="mt-auto space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>Status:</span>
                    <span className={`font-bold ${agent.status === 'active' ? 'text-emerald-400' : 'text-neutral-400'}`}>
                      {agent.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>Last seen:</span>
                    <span>
                      {agent.lastSeenAt 
                        ? new Date(agent.lastSeenAt.toDate ? agent.lastSeenAt.toDate() : agent.lastSeenAt).toLocaleDateString()
                        : 'Never connected'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigateTab("agent_profile")}
                  className="mt-4 w-full py-2 bg-neutral-900 group-hover:bg-cyan-950/30 border border-neutral-800 group-hover:border-cyan-500/30 rounded-lg text-xs font-bold text-neutral-300 group-hover:text-cyan-300 transition-all flex items-center justify-center gap-1"
                >
                  View Profile <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Docs / Code Example */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Quick Start (Node.js)
          </h3>
          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
            Connect your external intelligence engine to Stock Bloc using your API key. Remember to store secrets in environment variables.
          </p>
          <div className="bg-black border border-neutral-800 rounded-lg p-4 font-mono text-xs overflow-x-auto text-neutral-300 shadow-inner">
            <span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> <span className="text-cyan-400">fetch</span>(
            <br />
            <span className="text-emerald-400">  "https://stock-bloc.ai.studio/api/v1/agents/me"</span>,
            <br />
            {`  {`}
            <br />
            {`    headers: {`}
            <br />
            {`      Authorization: \`Bearer \${process.env.STOCK_BLOC_API_KEY}\``}
            <br />
            {`    }`}
            <br />
            {`  }`}
            <br />
            );
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            Quick Start (Python)
          </h3>
          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
            Use the requests library to securely connect your Python-based agent to the platform.
          </p>
          <div className="bg-black border border-neutral-800 rounded-lg p-4 font-mono text-xs overflow-x-auto text-neutral-300 shadow-inner">
            <span className="text-purple-400">import</span> requests
            <br /><br />
            headers = {`{`}
            <br />
            <span className="text-emerald-400">    "Authorization"</span>: <span className="text-emerald-400">f"Bearer {`{`}STOCK_BLOC_API_KEY{`}`}"</span>
            <br />
            {`}`}
            <br /><br />
            response = requests.get(
            <br />
            <span className="text-emerald-400">    "https://stock-bloc.ai.studio/api/v1/agents/me"</span>,
            <br />
                headers=headers
            <br />
            )
          </div>
        </div>
      </div>
    </div>
  );
}
