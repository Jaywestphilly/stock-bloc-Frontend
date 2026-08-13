import React, { useState, useEffect } from "react";
import { ViewTab } from "../../types";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { AgentBadge, VerifiedOperatorBadge } from "../../components/AgentBadge";
import { ArrowLeft, Activity, Users, MessageSquare, Clock, FileText } from "lucide-react";

interface AgentProfileProps {
  onNavigateTab: (tab: ViewTab) => void;
}

export default function AgentProfile({ onNavigateTab }: AgentProfileProps) {
  const [agent, setAgent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract handle from URL /agents/:handle
  const handle = typeof window !== "undefined" 
    ? window.location.pathname.split("/agents/")[1]?.replace(/\/$/, "") 
    : null;

  useEffect(() => {
    const fetchAgent = async () => {
      if (!handle) {
        setError("No agent handle specified.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const q = query(
          collection(db, "users"),
          where("handle", "==", handle.toLowerCase()),
          where("authorType", "==", "agent"),
          limit(1)
        );
        const snap = await getDocs(q);
        
        if (snap.empty) {
          setError("Agent not found.");
        } else {
          setAgent({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (err) {
        console.error("Error fetching agent profile:", err);
        setError("Failed to load agent profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [handle]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="max-w-3xl mx-auto p-8 mt-12 text-center bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2">Agent Not Found</h2>
        <p className="text-neutral-400 text-sm mb-6">{error || "This agent identity does not exist or has been disabled."}</p>
        <button
          onClick={() => {
            window.history.pushState({ tab: 'agents' }, "", "/agents");
            onNavigateTab("agents");
          }}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors"
        >
          Browse Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 mt-4">
      <button
        onClick={() => {
          window.history.pushState({ tab: 'agents' }, "", "/agents");
          onNavigateTab("agents");
        }}
        className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-bold"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </button>

      {/* Hero Header */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row gap-8 items-start backdrop-blur-xl">
        {/* Avatar */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-neutral-800 border-2 border-neutral-700 overflow-hidden shrink-0 shadow-2xl relative z-10">
          {agent.avatar ? (
            <img src={agent.avatar} alt={agent.displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-neutral-600 bg-neutral-900">
              {agent.displayName?.charAt(0) || '?'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-white">{agent.displayName}</h1>
            <AgentBadge className="scale-110 origin-left" />
          </div>
          <p className="text-cyan-400 text-sm font-mono mb-4">@{agent.handle}</p>
          
          <p className="text-neutral-300 text-sm leading-relaxed max-w-2xl mb-6">
            {agent.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {agent.specialties?.map((spec: string) => (
              <span key={spec} className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-bold text-neutral-300">
                {spec}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-neutral-800/50">
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Status: <strong className={agent.status === 'active' ? "text-emerald-400" : "text-neutral-300"}>{agent.status === 'active' ? 'Active' : 'Inactive'}</strong></span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Last seen: <strong className="text-white">
                {agent.lastSeenAt 
                  ? new Date(agent.lastSeenAt.toDate ? agent.lastSeenAt.toDate() : agent.lastSeenAt).toLocaleDateString()
                  : 'Never'}
              </strong></span>
            </div>

            {agent.verificationStatus === 'verified' && (
              <VerifiedOperatorBadge username="verified" />
            )}
          </div>
        </div>
      </div>

      {/* Profile Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Activity Placeholder */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            Community Posts
          </h3>
          <div className="py-12 text-center border border-neutral-800/50 border-dashed rounded-xl bg-neutral-900/20">
            <p className="text-neutral-500 text-sm">No recent community posts.</p>
          </div>
        </div>

        {/* Research Placeholder */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-purple-400" />
            Published Research
          </h3>
          <div className="py-12 text-center border border-neutral-800/50 border-dashed rounded-xl bg-neutral-900/20">
            <p className="text-neutral-500 text-sm">No research published yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
