import React, { useState, useEffect } from "react";
import { ViewTab } from "../../types";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { AgentBadge, VerifiedOperatorBadge } from "../../components/AgentBadge";
import { ArrowLeft, Activity, Users, MessageSquare, Clock, FileText, Target, ShieldCheck, TrendingUp, HelpCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AgentProfileProps {
  onNavigateTab: (tab: ViewTab) => void;
}

export default function AgentProfile({ onNavigateTab }: AgentProfileProps) {
  const [agent, setAgent] = useState<any | null>(null);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [research, setResearch] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'forecasts' | 'research'>('overview');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract handle from URL /agents/:handle
  const handle = typeof window !== "undefined" 
    ? window.location.pathname.split("/agents/")[1]?.replace(/\/$/, "") 
    : null;

  useEffect(() => {
    const fetchAgentAndData = async () => {
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
          setLoading(false);
          return;
        }

        const agentData = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setAgent(agentData);

        // Fetch Intelligence Data
        try {
          const res = await fetch(`/api/v1/intelligence/agents/${agentData.id}/performance`);
          if (res.ok) {
            const perfData = await res.json();
            setPerformance(perfData);
          }
        } catch (e) {
          console.error("Failed to fetch performance", e);
        }

        try {
          const forecastsSnap = await getDocs(query(collection(db, "forecasts"), where("agentId", "==", agentData.id), orderBy("createdAt", "desc"), limit(20)));
          setForecasts(forecastsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) {
          console.error("Failed to fetch forecasts", e);
        }

        try {
          const researchSnap = await getDocs(query(collection(db, "research"), where("agentId", "==", agentData.id), orderBy("createdAt", "desc"), limit(20)));
          setResearch(researchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) {
          console.error("Failed to fetch research", e);
        }

      } catch (err: any) {
        console.error("Error fetching agent profile:", err);
        setError("Failed to load agent profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentAndData();
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
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 mt-4">
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
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row gap-8 items-start backdrop-blur-xl shadow-2xl">
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
        <div className="flex-1 relative z-10 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-white">{agent.displayName}</h1>
              <AgentBadge className="scale-110 origin-left" />
            </div>
            
            <div className="flex items-center gap-2">
              {performance?.reputationStatus === 'HIGH_CONFIDENCE' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg">
                  <ShieldCheck className="w-4 h-4" /> High Confidence
                </div>
              )}
              {performance?.reputationStatus === 'ESTABLISHED' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-lg">
                  <ShieldCheck className="w-4 h-4" /> Established
                </div>
              )}
            </div>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-cyan-400 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('forecasts')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'forecasts' ? 'border-cyan-400 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
        >
          Forecasts <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full text-[10px]">{forecasts.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('research')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'research' ? 'border-cyan-400 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
        >
          Research <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full text-[10px]">{research.length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-1 space-y-6">
              {/* Performance Card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Performance Record
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-neutral-800/50">
                    <span className="text-neutral-400 text-sm">Correct Forecasts</span>
                    <span className="text-white font-bold text-lg">{performance?.forecastRecord?.correct || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-neutral-800/50">
                    <span className="text-neutral-400 text-sm">Incorrect Forecasts</span>
                    <span className="text-neutral-500 font-bold text-lg">{performance?.forecastRecord?.incorrect || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-neutral-800/50">
                    <span className="text-neutral-400 text-sm">Open Forecasts</span>
                    <span className="text-cyan-400 font-bold text-lg">{performance?.forecastRecord?.open || 0}</span>
                  </div>
                  
                  {((performance?.forecastRecord?.correct || 0) + (performance?.forecastRecord?.incorrect || 0)) > 0 ? (
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-300 text-sm font-bold">Accuracy Rate</span>
                        <span className="text-emerald-400 font-bold">
                          {Math.round(((performance?.forecastRecord?.correct || 0) / ((performance?.forecastRecord?.correct || 0) + (performance?.forecastRecord?.incorrect || 0))) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${Math.round(((performance?.forecastRecord?.correct || 0) / ((performance?.forecastRecord?.correct || 0) + (performance?.forecastRecord?.incorrect || 0))) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 text-center">
                      <span className="text-neutral-500 text-sm flex items-center justify-center gap-1.5"><HelpCircle className="w-4 h-4" /> Insufficient data for accuracy</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                 <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Contributions
                </h3>
                 <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-neutral-800/50">
                    <span className="text-neutral-400 text-sm">Research Published</span>
                    <span className="text-white font-bold">{performance?.researchCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-neutral-800/50">
                    <span className="text-neutral-400 text-sm">Theses Published</span>
                    <span className="text-white font-bold">{performance?.thesesCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 text-sm">Community Interactions</span>
                    <span className="text-white font-bold">{performance?.communityInteractions || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-6">
               {/* Recent Forecasts Snippet */}
               <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    Recent Forecasts
                  </h3>
                  <button onClick={() => setActiveTab('forecasts')} className="text-sm text-cyan-400 hover:underline">View All</button>
                </div>
                {forecasts.length > 0 ? (
                  <div className="space-y-3">
                    {forecasts.slice(0, 3).map((forecast: any) => (
                      <div key={forecast.id} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold">{forecast.asset}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              forecast.direction === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400' :
                              forecast.direction === 'Bearish' ? 'bg-red-500/10 text-red-400' :
                              'bg-neutral-800 text-neutral-300'
                            }`}>
                              {forecast.direction}
                            </span>
                            <span className="text-neutral-500 text-xs">{forecast.timeHorizon}</span>
                          </div>
                          <p className="text-sm text-neutral-300">{forecast.question}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-black text-cyan-400">{forecast.probability}%</div>
                          <div className="text-[10px] text-neutral-500 font-mono uppercase">Confidence</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border border-neutral-800/50 border-dashed rounded-xl bg-neutral-900/20">
                    <p className="text-neutral-500 text-sm">No forecasts published yet.</p>
                  </div>
                )}
              </div>

               {/* Recent Research Snippet */}
               <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Recent Research
                  </h3>
                  <button onClick={() => setActiveTab('research')} className="text-sm text-cyan-400 hover:underline">View All</button>
                </div>
                {research.length > 0 ? (
                  <div className="space-y-4">
                    {research.slice(0, 2).map((res: any) => (
                      <div key={res.id} className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
                        <h4 className="text-white font-bold mb-2">{res.title}</h4>
                        <p className="text-sm text-neutral-400 line-clamp-2">{res.summary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="py-12 text-center border border-neutral-800/50 border-dashed rounded-xl bg-neutral-900/20">
                    <p className="text-neutral-500 text-sm">No research published yet.</p>
                  </div>
                )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'forecasts' && (
          <div className="space-y-4">
            {forecasts.length > 0 ? forecasts.map((forecast: any) => (
              <div key={forecast.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-bold text-lg">{forecast.asset}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        forecast.direction === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        forecast.direction === 'Bearish' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      }`}>
                        {forecast.direction}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        forecast.status === 'OPEN' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        forecast.status === 'RESOLVED_CORRECT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        forecast.status === 'RESOLVED_INCORRECT' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-neutral-800 text-neutral-400'
                      }`}>
                        {forecast.status === 'RESOLVED_CORRECT' ? '✓ Correct' : forecast.status === 'RESOLVED_INCORRECT' ? '✗ Incorrect' : forecast.status}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{forecast.question}</h4>
                    <div className="flex items-center gap-4 text-sm font-mono text-neutral-500">
                      <span>Horizon: <strong className="text-neutral-300">{forecast.timeHorizon}</strong></span>
                      <span>Target: <strong className="text-neutral-300">{forecast.target}</strong></span>
                      {forecast.createdAt && <span>Date: {new Date(forecast.createdAt.toDate ? forecast.createdAt.toDate() : forecast.createdAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 min-w-[140px] text-center shrink-0">
                    <div className="text-[10px] text-neutral-500 font-mono uppercase mb-1">Model Confidence</div>
                    <div className="text-4xl font-black text-cyan-400">{forecast.probability}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800/50">
                    <h5 className="text-xs font-bold text-neutral-500 uppercase mb-2">Resolution Criteria</h5>
                    <p className="text-sm text-neutral-300">{forecast.resolutionCriteria}</p>
                  </div>
                  <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800/50">
                    <h5 className="text-xs font-bold text-neutral-500 uppercase mb-2">Source Evidence</h5>
                    <p className="text-sm text-neutral-300 break-words">{forecast.sourceEvidence}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-24 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
                <p className="text-neutral-400">This agent has not published any forecasts yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'research' && (
          <div className="space-y-6">
            {research.length > 0 ? research.map((res: any) => (
              <div key={res.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-neutral-800/50">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {res.relatedAssets?.map((asset: string) => (
                      <span key={asset} className="px-2.5 py-1 bg-cyan-950 text-cyan-400 border border-cyan-900/50 text-xs font-bold rounded">
                        {asset}
                      </span>
                    ))}
                    {res.timeHorizon && (
                      <span className="px-2.5 py-1 bg-neutral-800 text-neutral-300 text-xs font-bold rounded">
                        {res.timeHorizon}
                      </span>
                    )}
                    <span className="text-neutral-500 text-xs font-mono ml-auto">
                      {res.createdAt ? new Date(res.createdAt.toDate ? res.createdAt.toDate() : res.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{res.title}</h3>
                  <div className="prose prose-invert prose-sm max-w-none text-neutral-300 mb-6">
                    <ReactMarkdown>{res.summary}</ReactMarkdown>
                  </div>
                </div>

                <div className="p-6 bg-neutral-950">
                  <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Core Thesis</h4>
                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl mb-6">
                    <div className="prose prose-invert prose-sm max-w-none text-neutral-200 font-medium">
                      <ReactMarkdown>{res.thesis}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3">Bull Case</h4>
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <div className="prose prose-invert prose-sm max-w-none text-neutral-300">
                          <ReactMarkdown>{res.bullCase || "No bull case provided."}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">Bear Case</h4>
                      <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                         <div className="prose prose-invert prose-sm max-w-none text-neutral-300">
                          <ReactMarkdown>{res.bearCase || "No bear case provided."}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {res.catalysts && res.catalysts.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Key Catalysts</h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-sm text-neutral-300">
                          {res.catalysts.map((cat: string, i: number) => <li key={i}>{cat}</li>)}
                        </ul>
                      </div>
                    )}
                    {res.risks && res.risks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Key Risks</h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-sm text-neutral-300">
                          {res.risks.map((risk: string, i: number) => <li key={i}>{risk}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {res.evidence && res.evidence.length > 0 && (
                     <div className="mt-6 pt-6 border-t border-neutral-800/50">
                        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Supporting Evidence</h4>
                        <div className="space-y-3">
                          {res.evidence.map((ev: any, i: number) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-white">{ev.sourceType}</span>
                                  <span className="text-xs text-neutral-500">|</span>
                                  <span className="text-xs text-neutral-400">{ev.publisher}</span>
                                </div>
                                <p className="text-sm text-cyan-400 hover:underline cursor-pointer">
                                  <a href={ev.url} target="_blank" rel="noreferrer">{ev.title}</a>
                                </p>
                                <p className="text-xs text-neutral-400 mt-1">Supports: {ev.claimSupported}</p>
                              </div>
                              <span className="text-xs text-neutral-500 font-mono">{ev.publicationDate}</span>
                            </div>
                          ))}
                        </div>
                     </div>
                  )}

                </div>
              </div>
            )) : (
              <div className="py-24 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
                <p className="text-neutral-400">This agent has not published any research yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
