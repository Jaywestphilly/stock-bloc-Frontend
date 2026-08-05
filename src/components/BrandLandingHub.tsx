import React, { useState } from "react";
import { motion } from "motion/react";
import { StockBlocLogo } from "./StockBlocLogo";
import {
  Flame,
  Layers,
  Building2,
  ShieldCheck,
  Orbit,
  ShieldAlert,
  Zap,
  Globe,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Radio,
  MessageSquare,
  Twitter,
  Youtube,
  Mail,
  Check,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import { triggerHaptic } from "../utils/haptics";
import { trackEvent } from "../utils/analytics";
import { ViewTab } from "../types";
import { appendUTM } from "../utils/utm";
import { db, saveUserDataLocally } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface BrandLandingHubProps {
  onSelectTab: (tab: ViewTab) => void;
  onOpenLinktree: () => void;
}

export const BrandLandingHub: React.FC<BrandLandingHubProps> = ({
  onSelectTab,
  onOpenLinktree,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;

    triggerHaptic("success");
    setIsSubmitting(true);

    trackEvent("newsletter_signup", { email: newsletterEmail, section: "homepage" });

    try {
      if (db) {
        await addDoc(collection(db, "newsletter_subscribers"), {
          email: newsletterEmail,
          timestamp: new Date().toISOString(),
          source: "weekly_brief_card",
        });
      }
    } catch (err) {
      saveUserDataLocally(`newsletter_${Date.now()}`, { email: newsletterEmail });
    }

    setIsSubmitting(false);
    setNewsletterSubscribed(true); trackEvent("newsletter_signup", { email: newsletterEmail });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-8 font-mono select-none">
      {/* Hero Header Card */}
      <div className="relative bg-black rounded-3xl p-6 sm:p-10 overflow-hidden shadow-2xl shadow-cyan-500/10 border border-cyan-500/30">
        {/* Top Telemetry Hash Overlay */}
        <div className="absolute top-2 left-4 right-4 flex items-center justify-between text-[9px] font-mono text-cyan-500/60 font-semibold tracking-widest pointer-events-none uppercase">
          <span>blockchain data ie 8998141</span>
          <span className="hidden sm:inline">blockchainsn date 802686</span>
          <span>matrix rate 4002666</span>
        </div>

        {/* Background Cyber Rays & Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/30 via-black to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#08334415_1px,transparent_1px),linear-gradient(to_bottom,#08334415_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* HUD Frame Ticks */}
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-5 pt-3">
          {/* Logo Emblem */}
          <div
            className="relative group cursor-pointer flex flex-col items-center justify-center my-1"
            onClick={() => {
              triggerHaptic("selection");
              onOpenLinktree();
            }}
          >
            <div className="absolute -inset-6 bg-cyan-500/25 rounded-full blur-3xl group-hover:bg-cyan-400/40 transition-all duration-300 pointer-events-none" />

            <div className="relative z-10 p-2">
              <StockBlocLogo size="hero" showText={true} showTagline={true} />
            </div>
          </div>

          {/* Subtitle */}
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs sm:text-sm text-cyan-300 font-mono font-bold uppercase tracking-widest">
              QUANT WEALTH MATRIX & 13F HEDGE FUND INTELLIGENCE ENGINE
            </p>
          </div>

          {/* Social Proof Stats Bar */}
          <div className="w-full pt-2 border-t border-cyan-500/20 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-cyan-300 font-bold uppercase tracking-widest font-mono">
            <span>1,842 DECLASSIFIED RECORDS</span>
            <span className="text-cyan-500/50">|</span>
            <span>18+ LIVE TICKERS</span>
            <span className="text-cyan-500/50">|</span>
            <span>6 INTELLIGENCE MODULES</span>
            <span className="text-cyan-500/50">|</span>
            <span>REAL-TIME MARKET DATA</span>
          </div>

          {/* Community Buttons (X / Twitter & YouTube) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-md">
            <a
              href={appendUTM("https://x.com/thestockbloc?s=21", "hero_btn")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                triggerHaptic("selection");
                trackEvent("community_joined", { platform: "x_twitter" });
              }}
              className="w-full sm:w-1/2 py-2.5 px-4 bg-cyan-400 text-black font-black font-tech text-xs uppercase tracking-wider alien-block-cut-sm hover:bg-cyan-300 shadow-lg shadow-cyan-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Twitter className="w-4 h-4 text-black fill-black" />
              <span>FOLLOW ON X (@THESTOCKBLOC)</span>
            </a>

            <a
              href={appendUTM("https://youtube.com/@stockbloc", "hero_btn")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                triggerHaptic("selection");
                trackEvent("community_joined", { platform: "youtube" });
              }}
              className="w-full sm:w-1/2 py-2.5 px-4 bg-rose-950/60 border border-rose-500/60 text-rose-300 hover:bg-rose-900/60 font-black font-tech text-xs uppercase tracking-wider alien-block-cut-sm shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Youtube className="w-4 h-4 text-rose-400" />
              <span>FOLLOW ON YOUTUBE</span>
            </a>
          </div>
        </div>
      </div>

      {/* SECTION E (16): Weekly Market Brief Card */}
      <div className="bg-[#040e1a] border-l-4 border-l-amber-400 border border-cyan-500/30 alien-block-cut p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase rounded alien-block-cut-sm">
                SUNDAY DISPATCH
              </span>
              <h3 className="text-base sm:text-lg font-black font-tech text-white uppercase tracking-wider">
                GET THE WEEKLY MARKET BRIEF
              </h3>
            </div>
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              Every Sunday. Hedge fund moves, RSI extremes, credit building tips, and REIT opportunities. Straight to your inbox.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0">
            {newsletterSubscribed ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-400 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>You're subscribed. First brief arrives Sunday.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="bg-black/90 border border-cyan-500/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-amber-400 min-w-[220px]"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-400 text-black font-black font-tech uppercase text-xs tracking-wider alien-block-cut-sm hover:bg-amber-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>SUBSCRIBE</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Refined Mission Statement Card */}
      <div className="relative bg-gradient-to-b from-black to-neutral-950 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-10 text-white space-y-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-cyan-500/30 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-black text-2xl shadow-inner shrink-0">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-mono text-cyan-200 uppercase tracking-wider alien-text-glow">
              STOCK BLOC BRAND POSITIONING & MISSION
            </h2>
            <p className="text-xs sm:text-sm text-cyan-400/90 font-mono tracking-wider uppercase mt-0.5">
              CORE PLATFORM: Market intelligence, hedge fund tracking, credit building, and real estate analysis.
            </p>
            <p className="text-xs text-amber-400/90 font-mono tracking-wider uppercase mt-0.5">
              STOCK BLOC LABS: Exploring the frontiers of energy, defense, and emerging opportunity.
            </p>
          </div>
        </div>

        {/* Mission Body */}
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-neutral-300 font-sans">
          <p>
            STOCK BLOC provides algorithmic market intelligence, institutional filing synthesis, and financial education frameworks. Our core modules are engineered to help independent investors research high-conviction market signals with clarity and confidence.
          </p>
          <div className="p-4 bg-black/80 border border-cyan-500/30 rounded-2xl font-mono text-xs text-cyan-200 space-y-1">
            <span className="text-amber-400 font-bold block">[ EDUCATIONAL PLATFORM PRINCIPLE ]</span>
            <p>
              Stock Bloc Labs archives declassified military documents, aerial records, and energy grid models purely for informational and research purposes. Nothing on Stock Bloc constitutes financial, investment, legal, or credit repair advice.
            </p>
          </div>
        </div>
      </div>

      {/* Two Tiers Capability Section */}
      <div className="space-y-6">
        {/* CORE PLATFORM GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black font-mono text-cyan-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-cyan-400 inline-block animate-ping" />
              CORE PLATFORM
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono uppercase bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
              PRIMARY BRAND IDENTITY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Core 1: Watchlist */}
            <button type="button" aria-label="Open watchlist Module" onClick={() => { triggerHaptic("selection"); trackEvent("module_opened", { section: "watchlist" }); onSelectTab("watchlist"); }} className="bg-black/90 border-2 border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-4 space-y-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 text-left w-full transition-all hover:scale-[1.02] shadow-lg group"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Flame className="w-4 h-4 text-cyan-400 group-hover:animate-bounce" />
              </div>
              <div>
                <h4 className="font-extrabold font-mono text-white text-sm uppercase group-hover:text-cyan-300 transition-colors">
                  QUANT WATCHLIST
                </h4>
                <p className="text-sm text-neutral-400 mt-1 leading-normal font-sans">
                  Real-time stock momentum, RSI overbought/oversold scores, and market benchmarks.
                </p>
              </div>
              <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 uppercase font-mono">
                <span>OPEN WATCHLIST</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* Core 2: 13F Hedge Fund Intel */}
            <button type="button" aria-label="Open intelligence Module" onClick={() => { triggerHaptic("selection"); trackEvent("module_opened", { section: "intelligence" }); onSelectTab("intelligence"); }} className="bg-black/90 border-2 border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-4 space-y-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 text-left w-full transition-all hover:scale-[1.02] shadow-lg group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <Layers className="w-4 h-4 text-purple-400 group-hover:animate-spin-slow" />
              </div>
              <div>
                <h4 className="font-extrabold font-mono text-white text-sm uppercase group-hover:text-purple-300 transition-colors">
                  13F HEDGE FUND INTEL
                </h4>
                <p className="text-sm text-neutral-400 mt-1 leading-normal font-sans">
                  SEC quarterly filing analysis, Berkshire, Citadel, and whale portfolio tracking.
                </p>
              </div>
              <div className="text-[10px] text-purple-400 font-bold flex items-center gap-1 uppercase font-mono">
                <span>VIEW 13F FILINGS</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* Core 3: Credit 800+ */}
            <button type="button" aria-label="Open credit Module" onClick={() => { triggerHaptic("selection"); trackEvent("module_opened", { section: "credit" }); onSelectTab("credit"); }} className="bg-black/90 border-2 border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-4 space-y-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 text-left w-full transition-all hover:scale-[1.02] shadow-lg group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110" />
              </div>
              <div>
                <h4 className="font-extrabold font-mono text-white text-sm uppercase group-hover:text-emerald-300 transition-colors">
                  CREDIT 800+
                </h4>
                <p className="text-sm text-neutral-400 mt-1 leading-normal font-sans">
                  Credit score calculators, dispute playbooks, and utilization optimization.
                </p>
              </div>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 uppercase font-mono">
                <span>BUILD CREDIT</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* Core 4: Real Estate & REITs */}
            <button type="button" aria-label="Open real_estate Module" onClick={() => { triggerHaptic("selection"); trackEvent("module_opened", { section: "real_estate" }); onSelectTab("real_estate"); }} className="bg-black/90 border-2 border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-4 space-y-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 text-left w-full transition-all hover:scale-[1.02] shadow-lg group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Building2 className="w-4 h-4 text-amber-400 group-hover:scale-110" />
              </div>
              <div>
                <h4 className="font-extrabold font-mono text-white text-sm uppercase group-hover:text-amber-300 transition-colors">
                  REAL ESTATE & REITS
                </h4>
                <p className="text-sm text-neutral-400 mt-1 leading-normal font-sans">
                  Property deal calculators, cap rate models, and high-yield dividend REITs.
                </p>
              </div>
              <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1 uppercase font-mono">
                <span>ANALYZE DEALS</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>

        {/* DIVIDER LINE */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t-2 border-amber-500/40" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#030812] px-4 font-mono text-xs font-black text-amber-400 uppercase tracking-widest border border-amber-500/40 rounded-full py-1 shadow-md">
              EXPERIMENTAL INTELLIGENCE
            </span>
          </div>
        </div>

        {/* STOCK BLOC LABS GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black font-mono text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                STOCK BLOC LABS
              </h3>
              <p className="text-[11px] text-amber-400/80 font-mono">
                Stock Bloc Labs explores emerging frontiers. Not investment advice.
              </p>
            </div>
            <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase rounded alien-block-cut-sm">
              EXPERIMENTAL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Labs 1: Energy */}
            <button type="button" aria-label="Open dyson_swarm Module" onClick={() => { triggerHaptic("selection"); trackEvent("module_opened", { section: "dyson_swarm" }); onSelectTab("dyson_swarm"); }} className="bg-black/90 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl p-3.5 space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 text-left w-full transition-all hover:scale-[1.02] shadow-lg group relative"
              title="Stock Bloc Labs explores emerging frontiers. Not investment advice."
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Orbit className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              </div>
              <div>
                <h4 className="font-extrabold font-mono text-white text-xs uppercase group-hover:text-amber-300 transition-colors">
                  LABS: ENERGY
                </h4>
                <p className="text-sm text-neutral-400 mt-1 leading-normal font-sans">
                  Dyson Swarm orbital solar arrays, fusion, and power infrastructure.
                </p>
              </div>
              <div className="text-[9px] text-amber-400 font-bold flex items-center gap-1 uppercase font-mono">
                <span>INSPECT GRID</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </button>

            {/* Labs 2: Defense */}
            <button type="button" aria-label="Open war_gov_ufo Module" onClick={() => { triggerHaptic("selection"); trackEvent("module_opened", { section: "war_gov_ufo" }); onSelectTab("war_gov_ufo"); }} className="bg-black/90 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl p-3.5 space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 text-left w-full transition-all hover:scale-[1.02] shadow-lg group relative"
              title="Stock Bloc Labs explores emerging frontiers. Not investment advice."
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-400 group-hover:animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold font-mono text-white text-xs uppercase group-hover:text-amber-300 transition-colors">
                  LABS: DEFENSE
                </h4>
                <p className="text-sm text-neutral-400 mt-1 leading-normal font-sans">
                  WAR.GOV declassified records, aerial intelligence, and aerospace contracts.
                </p>
              </div>
              <div className="text-[9px] text-amber-400 font-bold flex items-center gap-1 uppercase font-mono">
                <span>SCAN DEFENSE</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </button>

            {/* Labs 3: Revolution */}
            <button type="button" aria-label="Open ai_insights Module" onClick={() => { triggerHaptic("selection"); trackEvent("module_opened", { section: "ai_insights" }); onSelectTab("ai_insights"); }} className="bg-black/90 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl p-3.5 space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 text-left w-full transition-all hover:scale-[1.02] shadow-lg group relative"
              title="Stock Bloc Labs explores emerging frontiers. Not investment advice."
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110" />
              </div>
              <div>
                <h4 className="font-extrabold font-mono text-white text-xs uppercase group-hover:text-amber-300 transition-colors">
                  LABS: REVOLUTION
                </h4>
                <p className="text-sm text-neutral-400 mt-1 leading-normal font-sans">
                  Next-gen AI models, quantum computing, and autonomous agents.
                </p>
              </div>
              <div className="text-[9px] text-amber-400 font-bold flex items-center gap-1 uppercase font-mono">
                <span>EXPLORE REVOLUTION</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </button>

            {/* Labs 4: Startups */}
            <button type="button" aria-label="Open small_business Module" onClick={() => { triggerHaptic("selection"); trackEvent("module_opened", { section: "small_business" }); onSelectTab("small_business"); }} className="bg-black/90 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl p-3.5 space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 text-left w-full transition-all hover:scale-[1.02] shadow-lg group relative"
              title="Stock Bloc Labs explores emerging frontiers. Not investment advice."
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Briefcase className="w-4 h-4 text-amber-400 group-hover:scale-110" />
              </div>
              <div>
                <h4 className="font-extrabold font-mono text-white text-xs uppercase group-hover:text-amber-300 transition-colors">
                  LABS: STARTUPS
                </h4>
                <p className="text-sm text-neutral-400 mt-1 leading-normal font-sans">
                  SBA funding models, venture pitch tools, and startup cash flow.
                </p>
              </div>
              <div className="text-[9px] text-amber-400 font-bold flex items-center gap-1 uppercase font-mono">
                <span>VIEW STARTUPS</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </button>

            {/* Labs 5: Media */}
            <button type="button" aria-label="Open youtube Module" onClick={() => { triggerHaptic("selection"); trackEvent("module_opened", { section: "youtube" }); onSelectTab("youtube"); }} className="bg-black/90 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl p-3.5 space-y-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 text-left w-full transition-all hover:scale-[1.02] shadow-lg group relative"
              title="Stock Bloc Labs explores emerging frontiers. Not investment advice."
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Radio className="w-4 h-4 text-amber-400 group-hover:scale-110" />
              </div>
              <div>
                <h4 className="font-extrabold font-mono text-white text-xs uppercase group-hover:text-amber-300 transition-colors">
                  LABS: MEDIA
                </h4>
                <p className="text-sm text-neutral-400 mt-1 leading-normal font-sans">
                  YouTube video library, 13F breakdown streams, and market podcasts.
                </p>
              </div>
              <div className="text-[9px] text-amber-400 font-bold flex items-center gap-1 uppercase font-mono">
                <span>OPEN MEDIA HUB</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
