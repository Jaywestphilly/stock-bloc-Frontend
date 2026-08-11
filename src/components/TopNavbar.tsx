import React, { useState } from "react";
import { ViewTab } from "../types";
import {
  TrendingUp,
  Cpu,
  Building2,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  Terminal,
  BookOpen,
  Layers,
  Orbit,
  ShieldAlert,
  Sparkles,
  Briefcase,
  Radio,
  FileText,
  Youtube,
  Globe,
  BarChart3,
} from "lucide-react";
import { triggerHaptic } from "../utils/haptics";

interface TopNavbarProps {
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenTerminal?: () => void;
  onOpenOnboarding?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ activeTab, onSelectTab, onOpenTerminal, onOpenOnboarding }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const marketsMenu = [
    { id: "watchlist", label: "Live Watchlist Workstation", icon: TrendingUp },
    { id: "intelligence", label: "13F Hedge Fund Intel", icon: Layers },
    { id: "macro", label: "Macro Economic Briefings", icon: FileText },
  ];

  const aiMenu = [
    { id: "ai_revolution", label: "AI Infrastructure & Morgan Stanley Heatmap", icon: BarChart3 },
    { id: "dyson_swarm", label: "Dyson Swarm Compute", icon: Orbit },
    { id: "war_gov_ufo", label: "Defense Tech & Aerospace", icon: ShieldAlert },
    { id: "ai_insights", label: "Autonomous Agent Insights", icon: Cpu },
  ];

  const educationMenu = [
    { id: "onboarding", label: "Guided 2-Step Terminal Tour", icon: Sparkles },
    { id: "terminal_guide", label: "Terminal Guide & Manual", icon: Terminal },
    { id: "mit_courses", label: "MIT & University Courses", icon: GraduationCap },
    { id: "investopedia", label: "Investopedia Free Trading Game", icon: Sparkles },
    { id: "small_business", label: "Small Business & QSBS Tax Hub", icon: Briefcase },
    { id: "youtube", label: "Free Game Educational Videos", icon: Radio },
  ];

  const renderDropdown = (
    label: string,
    menuKey: string,
    IconHeader: React.ElementType,
    items: { id: string; label: string; icon: React.ElementType }[],
    isActive: boolean
  ) => {
    return (
      <div 
        className="relative group"
        onMouseEnter={() => setActiveDropdown(menuKey)}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <button
          className={`px-3 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none ${
            isActive || activeDropdown === menuKey
              ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/30 border border-cyan-200"
              : "text-cyan-300 hover:text-white hover:bg-cyan-950/40 border border-cyan-500/20"
          }`}
        >
          <IconHeader className="w-3.5 h-3.5 shrink-0" />
          <span>{label}</span>
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>

        {activeDropdown === menuKey && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-neutral-950 border border-cyan-500/40 rounded-xl shadow-2xl p-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    triggerHaptic("selection");
                    setActiveDropdown(null);
                    if (item.id === "onboarding") {
                      if (onOpenOnboarding) onOpenOnboarding();
                    } else {
                      onSelectTab(item.id as ViewTab);
                    }
                  }}
                  className="w-full px-3 py-2 text-left text-[11px] font-bold text-cyan-100 hover:bg-cyan-500/20 hover:text-white flex items-center gap-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const isMarketsActive = ["watchlist", "intelligence", "macro", "brand"].includes(activeTab);
  const isAiActive = ["dyson_swarm", "war_gov_ufo", "ai_insights", "ai_revolution", "satellite_map"].includes(activeTab);
  const isEducationActive = ["investopedia", "small_business", "youtube", "terminal_guide", "mit_courses"].includes(activeTab);

  return (
    <nav
      className="hidden md:flex items-center justify-center gap-2 px-3 py-2 bg-black/95 border-b border-cyan-500/30 overflow-visible font-mono text-xs select-none relative z-40"
      aria-label="Desktop Top Navigation"
    >
      <div className="flex items-center gap-2">
        {/* 1. YOUTUBE & INTEL FEED (FIRST TAB) */}
        <button
          onClick={() => {
            triggerHaptic("selection");
            onSelectTab("news");
          }}
          className={`px-3 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none ${
            activeTab === "news"
              ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/40 border border-cyan-200"
              : "text-cyan-300 hover:text-white hover:bg-cyan-950/40 border border-cyan-500/20"
          }`}
          title="Combined YouTube & Intel Feed"
        >
          <Youtube className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>YOUTUBE & INTEL FEED</span>
        </button>

        {/* 2. MARKETS */}
        {renderDropdown("MARKETS", "markets", TrendingUp, marketsMenu, isMarketsActive)}

        {/* 3. AI */}
        {renderDropdown("AI & TECH", "ai", Cpu, aiMenu, isAiActive)}

        {/* 4. REAL ESTATE */}
        <button
          onClick={() => {
            triggerHaptic("selection");
            onSelectTab("real_estate");
          }}
          className={`px-2.5 py-1 rounded-xl font-black text-[10px] sm:text-[11px] flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none ${
            activeTab === "real_estate"
              ? "bg-amber-400 text-black shadow-lg shadow-amber-400/30 border border-amber-200"
              : "text-amber-300 hover:text-white hover:bg-amber-950/40 border border-amber-500/20"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="flex flex-col text-center leading-none tracking-tight">
            <span>REAL</span>
            <span>ESTATE</span>
          </span>
        </button>

        {/* 5. CREDIT */}
        <button
          onClick={() => {
            triggerHaptic("selection");
            onSelectTab("credit");
          }}
          className={`px-3 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none ${
            activeTab === "credit"
              ? "bg-emerald-400 text-black shadow-lg shadow-emerald-400/30 border border-emerald-200"
              : "text-emerald-300 hover:text-white hover:bg-emerald-950/40 border border-emerald-500/20"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CREDIT</span>
        </button>

        {/* 6. EDUCATION */}
        {renderDropdown("EDUCATION", "education", GraduationCap, educationMenu, isEducationActive)}

        {/* 7. YOUTUBE CHANNEL VIDEOS */}
        <button
          onClick={() => {
            triggerHaptic("selection");
            onSelectTab("youtube");
          }}
          className={`px-3 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none ${
            activeTab === "youtube"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 border border-rose-300"
              : "text-rose-300 hover:text-white hover:bg-rose-950/40 border border-rose-500/20"
          }`}
          title="Stock Bloc YouTube Channel Videos (@stockbloc)"
        >
          <Youtube className="w-3.5 h-3.5 text-rose-400" />
          <span>YOUTUBE VIDEOS</span>
        </button>

        {/* 8. BOOKS & STORE (Top Button) */}
        <button
          onClick={() => {
            triggerHaptic("selection");
            onSelectTab("pricing");
          }}
          className={`px-3 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none ${
            activeTab === "pricing"
              ? "bg-purple-400 text-black shadow-lg shadow-purple-400/30 border border-purple-200"
              : "text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-500/20"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          <span>BOOKS & STORE</span>
        </button>

        {/* 7. FREE TERMINAL (Top Button) */}
        {onOpenTerminal && (
          <button
            onClick={() => {
              triggerHaptic("selection");
              onOpenTerminal();
            }}
            className="px-3.5 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none bg-amber-400 text-black shadow-lg shadow-amber-400/30 border border-amber-200 hover:bg-amber-300"
            title="Open Stock Bloc Workstation Terminal"
          >
            <Terminal className="w-3.5 h-3.5 text-black animate-pulse" />
            <span>FREE TERMINAL</span>
          </button>
        )}
      </div>
    </nav>
  );
};
