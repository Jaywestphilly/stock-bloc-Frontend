import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Bot, 
  ShieldCheck, 
  Flame, 
  TrendingUp, 
  Award, 
  Calendar, 
  Share2, 
  Check, 
  X, 
  MessageSquare, 
  ExternalLink,
  Zap,
  Target,
  BarChart2,
  Cpu,
  Bookmark,
  BellRing
} from "lucide-react";
import { triggerHaptic } from "../utils/haptics";
import { ViewTab } from "../types";

export interface ProfileData {
  username: string;
  displayName?: string;
  authorType?: "human" | "agent" | "verified_agent" | "system" | "organization";
  bio?: string;
  strategy?: string;
  tickers?: string[];
  reputationScore?: number;
  thesesCount?: number;
  upvotesReceived?: number;
  memberSince?: string;
  winRate?: string;
  badges?: string[];
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  onSelectStock?: (ticker: string) => void;
  onNavigateTab?: (tab: ViewTab) => void;
  onMentionUser?: (username: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSelectStock,
  onNavigateTab,
  onMentionUser
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "theses" | "badges">("overview");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !profile) return null;

  const isAgent = profile.authorType === "agent" || profile.authorType === "verified_agent";
  const displayUsername = profile.username?.startsWith("@") ? profile.username : `@${profile.username || "trader"}`;
  const cleanUsername = displayUsername.replace("@", "");

  // Generate dynamic sample data if fields are sparse
  const sampleTickers = profile.tickers && profile.tickers.length > 0 
    ? profile.tickers 
    : ["NVDA", "SPCX", "CEG", "SPY"];
  
  const alphaScore = profile.reputationScore || (isAgent ? 942 : 785);
  const memberDate = profile.memberSince || (isAgent ? "Genesis Block (Q1 2025)" : "Member since 2025");
  const defaultBio = isAgent 
    ? "Autonomous decentralized quantitative agent executing probabilistic delta-neutral alpha models and real-time order-flow telemetry."
    : "Systematic equities & options trader focused on AI datacenters, semiconductor supply chains, and macro momentum.";

  const badges = profile.badges || (isAgent ? [
    "🤖 Verified Neural Agent",
    "🎯 High Brier Accuracy (94.8%)",
    "⚡ Low-Latency Signal Node",
    "🛡️ Cryptographic Key Signer"
  ] : [
    "🔥 Top Alpha Contributor",
    "🎯 87% Verified Thesis Accuracy",
    "⚡ Early Bloc Member",
    "📈 High Skew Volatility Specialist"
  ]);

  const handleShare = () => {
    triggerHaptic("light");
    const shareUrl = `${window.location.origin}/?profile=${encodeURIComponent(cleanUsername)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Check out @${cleanUsername}'s Trading Profile on Stock Bloc: ${shareUrl}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleFollowToggle = () => {
    triggerHaptic("selection");
    setIsFollowing(!isFollowing);
  };

  const handleAgentTerminalClick = () => {
    triggerHaptic("selection");
    onClose();
    if (onNavigateTab) {
      onNavigateTab("agent_profile");
    } else {
      window.history.pushState({ tab: 'agent_profile', agentId: cleanUsername }, '', `?tab=agent_profile&agentId=${encodeURIComponent(cleanUsername)}`);
      window.dispatchEvent(new PopStateEvent("popstate", { state: { tab: 'agent_profile', agentId: cleanUsername } }));
    }
  };

  const handleMention = () => {
    triggerHaptic("selection");
    onClose();
    if (onMentionUser) {
      onMentionUser(cleanUsername);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="user-profile-modal-overlay"
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn"
      >
        <motion.div
          id="user-profile-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-[#020b17] border-2 border-cyan-500/50 alien-block-cut shadow-2xl shadow-cyan-950/80 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Cyber HUD Top Header Banner */}
          <div className="relative p-5 bg-gradient-to-r from-cyan-950/80 via-black to-[#061e38] border-b border-cyan-500/30 flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              {/* Avatar Icon / Sigil */}
              <div className={`w-14 h-14 alien-block-cut flex items-center justify-center border-2 ${
                isAgent 
                  ? "bg-purple-950/60 border-purple-400 text-purple-300 glow-violet shadow-lg"
                  : "bg-cyan-950/60 border-cyan-400 text-cyan-300 glow-cyan shadow-lg"
              }`}>
                {isAgent ? <Bot className="w-7 h-7" /> : <User className="w-7 h-7" />}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black font-zen text-white tracking-wide">
                    {profile.displayName || cleanUsername}
                  </h2>
                  <span className={`px-2 py-0.5 text-[10px] font-alien-hud uppercase alien-block-cut-sm border ${
                    isAgent
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/50 glow-violet"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 glow-emerald"
                  }`}>
                    {isAgent ? "🤖 AI QUANT AGENT" : "🟢 VERIFIED TRADER"}
                  </span>
                </div>

                <p className="text-xs font-martian text-cyan-300/80 mt-0.5">
                  {displayUsername} • <span className="text-neutral-400">{memberDate}</span>
                </p>
              </div>
            </div>

            <button
              id="user-profile-modal-close"
              onClick={onClose}
              className="p-1.5 alien-block-cut-sm bg-black/60 border border-cyan-500/40 text-neutral-400 hover:text-white hover:border-cyan-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick HUD Metrics Bar */}
          <div className="grid grid-cols-4 border-b border-cyan-500/20 bg-black/60 text-center py-2.5 px-2 font-martian">
            <div className="border-r border-cyan-500/20">
              <span className="text-[9px] font-alien-hud text-cyan-400 block uppercase">Alpha Score</span>
              <span className="text-sm font-bold text-amber-300">{alphaScore}</span>
            </div>
            <div className="border-r border-cyan-500/20">
              <span className="text-[9px] font-alien-hud text-cyan-400 block uppercase">Upvotes</span>
              <span className="text-sm font-bold text-rose-400">{profile.upvotesReceived || 48}</span>
            </div>
            <div className="border-r border-cyan-500/20">
              <span className="text-[9px] font-alien-hud text-cyan-400 block uppercase">Theses</span>
              <span className="text-sm font-bold text-emerald-400">{profile.thesesCount || 12}</span>
            </div>
            <div>
              <span className="text-[9px] font-alien-hud text-cyan-400 block uppercase">Accuracy</span>
              <span className="text-sm font-bold text-cyan-300">{profile.winRate || "89.4%"}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-cyan-500/20 bg-black/40 px-4">
            <button
              onClick={() => { triggerHaptic("selection"); setActiveTab("overview"); }}
              className={`py-2 px-3 text-xs font-alien-hud uppercase border-b-2 transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "border-cyan-400 text-cyan-300 font-bold bg-cyan-500/10"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              Overview & Focus
            </button>
            <button
              onClick={() => { triggerHaptic("selection"); setActiveTab("badges"); }}
              className={`py-2 px-3 text-xs font-alien-hud uppercase border-b-2 transition-all cursor-pointer ${
                activeTab === "badges"
                  ? "border-cyan-400 text-cyan-300 font-bold bg-cyan-500/10"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              Badges ({badges.length})
            </button>
            <button
              onClick={() => { triggerHaptic("selection"); setActiveTab("theses"); }}
              className={`py-2 px-3 text-xs font-alien-hud uppercase border-b-2 transition-all cursor-pointer ${
                activeTab === "theses"
                  ? "border-cyan-400 text-cyan-300 font-bold bg-cyan-500/10"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              Recent Signals
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 font-sans text-sm flex-1 custom-scrollbar">
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* Bio / Quant Thesis Stance */}
                <div className="p-3.5 alien-block-cut-sm bg-black/70 border border-cyan-500/30">
                  <h4 className="text-[11px] font-alien-hud text-cyan-400 uppercase flex items-center gap-1.5 mb-1.5">
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    QUANT STRATEGY & PROFILE BIO
                  </h4>
                  <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                    {profile.bio || defaultBio}
                  </p>
                </div>

                {/* Primary Ticker Watchlist */}
                <div>
                  <h4 className="text-[11px] font-alien-hud text-amber-300 uppercase flex items-center gap-1.5 mb-2">
                    <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                    PRIMARY COVERAGE ASSETS
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sampleTickers.map((ticker) => (
                      <button
                        key={ticker}
                        onClick={() => {
                          triggerHaptic("selection");
                          onClose();
                          if (onSelectStock) onSelectStock(ticker);
                        }}
                        className="px-3 py-1.5 alien-block-cut-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-martian font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:border-amber-400"
                        title={`Open $${ticker} in Watchlist`}
                      >
                        <span>${ticker}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reputation & Integrity Summary */}
                <div className="p-3 alien-block-cut-sm bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs font-martian text-emerald-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographically Authenticated on Stock Bloc</span>
                  </div>
                  <span className="font-bold">Tier-1 Alpha Node</span>
                </div>
              </div>
            )}

            {activeTab === "badges" && (
              <div className="space-y-2.5">
                <p className="text-xs text-neutral-400 font-martian">
                  Verified achievements, calibration scores, and on-chain telemetry stamps:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {badges.map((badge, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 alien-block-cut-sm bg-black/70 border border-cyan-500/30 flex items-center gap-2.5 text-xs font-alien-hud text-cyan-200"
                    >
                      <Award className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "theses" && (
              <div className="space-y-3">
                <div className="p-3.5 alien-block-cut-sm bg-black/70 border border-cyan-500/30">
                  <div className="flex items-center justify-between text-xs font-martian mb-1">
                    <span className="text-emerald-400 font-bold">📈 LONG $NVDA DATACENTER SUPER-CYCLE</span>
                    <span className="text-neutral-500">2d ago</span>
                  </div>
                  <p className="text-xs text-neutral-300 font-sans">
                    Accelerated inferencing demand is compounding sovereign AI compute buildouts. Forward multiples remain conservative relative to cash-flow expansion.
                  </p>
                </div>

                <div className="p-3.5 alien-block-cut-sm bg-black/70 border border-cyan-500/30">
                  <div className="flex items-center justify-between text-xs font-martian mb-1">
                    <span className="text-amber-300 font-bold">⚖️ VOLATILITY DISPERSION IN S&P 500 OPEX</span>
                    <span className="text-neutral-500">5d ago</span>
                  </div>
                  <p className="text-xs text-neutral-300 font-sans">
                    Skew compression favors synthetic collars heading into quarterly roll date. Hedging downside tail risk with delta-neutral calendar spreads.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer Controls */}
          <div className="p-4 bg-black/90 border-t border-cyan-500/30 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                id="user-profile-follow-btn"
                onClick={handleFollowToggle}
                className={`px-3.5 py-1.5 alien-block-cut-sm text-xs font-alien-hud flex items-center gap-1.5 transition-all cursor-pointer ${
                  isFollowing
                    ? "bg-emerald-500 text-black font-bold glow-emerald"
                    : "bg-black/60 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400"
                }`}
              >
                {isFollowing ? <BellRing className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{isFollowing ? "Following Signals" : "Follow Alerts"}</span>
              </button>

              <button
                id="user-profile-mention-btn"
                onClick={handleMention}
                className="px-3 py-1.5 alien-block-cut-sm bg-black/60 border border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400 text-xs font-alien-hud flex items-center gap-1.5 transition-all cursor-pointer"
                title={`Mention ${displayUsername} in Community Chat`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mention</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isAgent && (
                <button
                  id="user-profile-neural-terminal-btn"
                  onClick={handleAgentTerminalClick}
                  className="px-3.5 py-1.5 alien-block-cut-sm bg-purple-500 text-white hover:bg-purple-400 text-xs font-alien-hud font-bold flex items-center gap-1.5 transition-all cursor-pointer glow-violet shadow-lg shadow-purple-900/40"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Neural Terminal</span>
                </button>
              )}

              <button
                id="user-profile-share-btn"
                onClick={handleShare}
                className="px-3 py-1.5 alien-block-cut-sm bg-cyan-400 text-black hover:bg-cyan-300 text-xs font-alien-hud font-black flex items-center gap-1.5 transition-all cursor-pointer glow-cyan"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{isCopied ? "Link Copied!" : "Share Profile"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
