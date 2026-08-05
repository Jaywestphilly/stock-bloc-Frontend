
import { useMarketStore } from "../stores/marketStore";
import { useUserStore } from "../stores/userStore";
import { useModalStore } from "../stores/modalStore";
import { BackendWatchlistStock } from "../types";

import React, { useState, useMemo, useRef, useEffect, Suspense, lazy, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { Header } from "../components/Header";
import { getRouteFromLocation, pushAppRoute } from "./router";
import { CategoryTabs } from "../components/CategoryTabs";
import { StockCard } from "../features/market/StockCard";
import { HeatmapView } from "../features/market/HeatmapView";
import { MarketPulseCard } from "../features/market/MarketPulseCard";
import type { IntelligenceSubTab } from "../features/intelligence/MarketIntelligenceHub";
import { LaunchSplashModal } from "../components/LaunchSplashModal";
import { AffiliateLink } from "../components/AffiliateLink";
import { GlobalDisclaimerBar } from "../components/GlobalDisclaimerBar";
import { NotFinancialAdviceTag } from "../components/NotFinancialAdviceTag";
import { WatchlistNewsTicker } from "../components/WatchlistNewsTicker";
import { BottomNav } from "../components/BottomNav";
import { TopNavbar } from "../components/TopNavbar";
import { CommandPalette } from "../components/CommandPalette";
import { TsunamiVolatilityTicker } from "../components/TsunamiVolatilityTicker";
import { Footer } from "../components/Footer";

// Lazy-loaded heavy modal components for code-splitting and bundle size optimization
const StockDetailModal = lazy(() =>
  import("../components/StockDetailModal").then((m) => ({ default: m.StockDetailModal }))
);
const AiCopilotModal = lazy(() =>
  import("../components/AiCopilotModal").then((m) => ({ default: m.AiCopilotModal }))
);
const BrandLinktreeModal = lazy(() =>
  import("../components/BrandLinktreeModal").then((m) => ({ default: m.BrandLinktreeModal }))
);
const SocialShareModal = lazy(() =>
  import("../components/SocialShareModal").then((m) => ({ default: m.SocialShareModal }))
);
const ImageAnalyzerModal = lazy(() =>
  import("../components/ImageAnalyzerModal").then((m) => ({ default: m.ImageAnalyzerModal }))
);
const LiveSearchGroundingModal = lazy(() =>
  import("../components/LiveSearchGroundingModal").then((m) => ({ default: m.LiveSearchGroundingModal }))
);
const FocusMusicPlayerModal = lazy(() =>
  import("../components/FocusMusicPlayerModal").then((m) => ({ default: m.FocusMusicPlayerModal }))
);
const AuthModal = lazy(() =>
  import("../components/AuthModal").then((m) => ({ default: m.AuthModal }))
);
const ProSubscriptionModal = lazy(() =>
  import("../components/ProSubscriptionModal").then((m) => ({ default: m.ProSubscriptionModal }))
);
const BloombergTerminalModal = lazy(() =>
  import("../components/BloombergTerminalModal").then((m) => ({ default: m.BloombergTerminalModal }))
);
const BrokerageAffiliateModal = lazy(() =>
  import("../components/BrokerageAffiliateModal").then((m) => ({ default: m.BrokerageAffiliateModal }))
);
const DisclaimerModal = lazy(() =>
  import("../components/DisclaimerModal").then((m) => ({ default: m.DisclaimerModal }))
);
const OnboardingModal = lazy(() =>
  import("../components/OnboardingModal").then((m) => ({ default: m.OnboardingModal }))
);
const DataStatusPanel = lazy(() =>
  import("../components/DataStatusPanel").then((m) => ({ default: m.DataStatusPanel }))
);

// Lazy-loaded hub components for code-splitting
const MarketIntelligenceHub = lazy(() =>
  import("../features/intelligence/MarketIntelligenceHub").then((m) => ({ default: m.MarketIntelligenceHub }))
);
const RealEstateHub = lazy(() =>
  import("../features/portfolio/RealEstateHub").then((m) => ({ default: m.RealEstateHub }))
);
const CreditBuildingHub = lazy(() =>
  import("../features/portfolio/CreditBuildingHub").then((m) => ({ default: m.CreditBuildingHub }))
);
const SmallBusinessHub = lazy(() =>
  import("../features/portfolio/SmallBusinessHub").then((m) => ({ default: m.SmallBusinessHub }))
);
const YouTubeHub = lazy(() =>
  import("../features/intelligence/YouTubeHub").then((m) => ({ default: m.YouTubeHub }))
);
const InvestopediaTab = lazy(() =>
  import("../features/education/InvestopediaTab").then((m) => ({ default: m.InvestopediaTab }))
);
const DysonSwarmHub = lazy(() =>
  import("../features/research/DysonSwarmHub").then((m) => ({ default: m.DysonSwarmHub }))
);
const WarGovUfoHub = lazy(() =>
  import("../features/research/WarGovUfoHub").then((m) => ({ default: m.WarGovUfoHub }))
);
const AiRevolutionHub = lazy(() =>
  import("../features/research/AiRevolutionHub").then((m) => ({ default: m.AiRevolutionHub }))
);
const PlaybooksHub = lazy(() =>
  import("../features/education/PlaybooksHub").then((m) => ({ default: m.PlaybooksHub }))
);
const ProductStorePricing = lazy(() =>
  import("../components/ProductStorePricing").then((m) => ({ default: m.ProductStorePricing }))
);
const MacroBriefingHub = lazy(() =>
  import("../features/research/MacroBriefingHub").then((m) => ({ default: m.MacroBriefingHub }))
);
const MyBlocDashboard = lazy(() =>
  import("../features/portfolio/MyBlocDashboard").then((m) => ({ default: m.MyBlocDashboard }))
);
const BrandLandingHub = lazy(() =>
  import("../components/BrandLandingHub").then((m) => ({ default: m.BrandLandingHub }))
);
const DocsHub = lazy(() =>
  import("../features/education/DocsHub").then((m) => ({ default: m.DocsHub }))
);
const TerminalGuideHub = lazy(() =>
  import("../features/education/TerminalGuideHub").then((m) => ({ default: m.TerminalGuideHub }))
);
const NewsHub = lazy(() =>
  import("../features/intelligence/NewsHub").then((m) => ({ default: m.NewsHub }))
);
const CheckoutSuccess = lazy(() =>
  import("../components/CheckoutSuccess").then((m) => ({ default: m.CheckoutSuccess }))
);


const HubLoadingFallback: React.FC = () => (
  <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[320px] font-mono text-cyan-400 space-y-4 bg-neutral-950/40 border border-cyan-500/20 rounded-xl my-4 mx-2">
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-ping" />
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
    <div className="text-xs uppercase font-black tracking-widest text-cyan-300 animate-pulse flex items-center gap-2">
      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
      LOADING MODULE...
    </div>
  </div>
);

import { DisclaimerBar } from "../components/DisclaimerBar";
import { trackEvent } from "../utils/analytics";
import { FloatingCommunityButton } from "../components/FloatingCommunityButton";
import { INITIAL_STOCKS, STOCK_NEWS_FEED } from "../data/stocks";
import { StockTicker, SectorCategory, SortField, ViewTab } from "../types";
import {
  Search,
  Sparkles,
  TrendingUp,
  Radio,
  Globe,
  ExternalLink,
  X,
  Newspaper,
  Plus,
  Camera,
  Music,
  Database,
  RefreshCw,
  ArrowDown,
  Orbit,
  ShieldAlert,
  LayoutList,
  SlidersHorizontal,
  Activity,
  BarChart3,
  ArrowUpDown,
  Download,
  Zap,
} from "lucide-react";
import { triggerHaptic } from "../utils/haptics";

export function App() {
  const { stocks, setStocks } = useMarketStore();
  const { selectedCategory, setSelectedCategory } = useMarketStore();
  const { sortField, setSortField } = useMarketStore();
  const { sortDirection, setSortDirection } = useMarketStore();
  const { searchQuery, setSearchQuery } = useModalStore();
  const { isSearchOpen, setIsSearchOpen } = useModalStore();
  const { isSyncingLiveQuotes, setIsSyncingLiveQuotes } = useMarketStore();
  const { lastSyncTime, setLastSyncTime } = useMarketStore();

  // Route & High Contrast Initial State
  const initialRoute = useMemo(() => getRouteFromLocation(), []);
  const [activeTab, setActiveTab] = useState<ViewTab>(initialRoute.tab);
  const { isCommandPaletteOpen, setIsCommandPaletteOpen } = useModalStore();
  const { isBloombergTerminalOpen, setIsBloombergTerminalOpen } = useModalStore();
  useEffect(() => {
    if (initialRoute.isTerminalOpen) setIsBloombergTerminalOpen(true);
  }, [initialRoute.isTerminalOpen, setIsBloombergTerminalOpen]);
  const { isDayMode, setIsDayMode } = useUserStore();

  const { watchlistSubTab, setWatchlistSubTab } = useUserStore();

  // Helper to close all modal overlays
  const closeAllModals = useCallback(() => {
    setIsBloombergTerminalOpen(false);
    setSelectedStock(null);
    setIsProSubscriptionOpen(false);
    setIsAuthOpen(false);
    setIsAiCopilotOpen(false);
    setIsCommandPaletteOpen(false);
    setIsBrandLinktreeOpen(false);
    setIsImageScannerOpen(false);
    setIsGroundingSearchOpen(false);
    setIsMusicPlayerOpen(false);
    setIsDisclaimerOpen(false);
    setIsBrokerageModalOpen(false);
    setIsShareModalOpen(false);
    setIsDataStatusOpen(false);
    setIsOnboardingOpen(false);
    setShareStock(null);
    setBrokerageStock(null);
  }, []);

  // Helper to push history state when an overlay opens for back button handling
  const pushOverlayHistory = (isTerminal = false) => {
    if (typeof window !== "undefined") {
      pushAppRoute(activeTab, isTerminal);
    }
  };

  // Sync route history and window popstate
  useEffect(() => {
    pushAppRoute(activeTab, isBloombergTerminalOpen);

    const handlePopState = () => {
      const route = getRouteFromLocation();
      setActiveTab(route.tab);
      closeAllModals();
      if (route.isTerminalOpen) {
        setIsBloombergTerminalOpen(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeTab]);

  // Global Keyboard Shortcuts ('/', 'Esc', Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K for Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
        return;
      }

      const activeElement = document.activeElement as HTMLElement | null;
      const activeTag = activeElement?.tagName;
      const isInputFocused =
        activeTag === "INPUT" ||
        activeTag === "TEXTAREA" ||
        activeTag === "SELECT" ||
        activeElement?.isContentEditable;

      // '/' shortcut to open terminal or focus terminal command line
      if (e.key === "/" && !isInputFocused) {
        e.preventDefault();
        if (!isBloombergTerminalOpen) {
          setIsBloombergTerminalOpen(true);
          pushOverlayHistory(true);
        }
        setTimeout(() => {
          const inputEl = document.getElementById("terminal-command-input");
          if (inputEl) {
            (inputEl as HTMLInputElement).focus();
            (inputEl as HTMLInputElement).select();
          }
        }, 60);
        return;
      }

      // 'Escape' or 'Esc' shortcut to close overlays/modals
      if (e.key === "Escape" || e.key === "Esc") {
        closeAllModals();
        pushAppRoute(activeTab, false);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBloombergTerminalOpen, activeTab, isCommandPaletteOpen, setIsCommandPaletteOpen, setIsBloombergTerminalOpen]);

  // Switch tab and default watchlist to tsunami list with route push
  const handleSelectTab = (tab: ViewTab) => {
    if (tab === "watchlist") {
      setSelectedCategory("tsunami");
      setWatchlistSubTab("tickers");
    }
    setActiveTab(tab);
    setIsBloombergTerminalOpen(false);
    pushAppRoute(tab, false);
  };

  const handleOpenBloombergTerminal = () => {
    setIsBloombergTerminalOpen(true);
    pushAppRoute(activeTab, true);
  };

  const handleCloseBloombergTerminal = () => {
    setIsBloombergTerminalOpen(false);
    pushAppRoute(activeTab, false);
  };

  useEffect(() => {
    if (isDayMode) {
      document.documentElement.classList.add("day-mode");
    } else {
      document.documentElement.classList.remove("day-mode");
    }
  }, [isDayMode]);

  // Sync with OS/System Theme changes when user hasn't explicitly overridden preference
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("stockbloc_day_mode");
      if (stored === null) {
        setIsDayMode(e.matches);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }
  }, [setIsDayMode]);

  const handleToggleDayMode = () => {
    setIsDayMode(!isDayMode);
  };

  const { selectedStock, setSelectedStock } = useMarketStore();
  const { shareStock, setShareStock } = useModalStore();
  const { isShareModalOpen, setIsShareModalOpen } = useModalStore();
  const { isAiCopilotOpen, setIsAiCopilotOpen } = useModalStore();
  const { isBrandLinktreeOpen, setIsBrandLinktreeOpen } = useModalStore();

  // New Feature Modals
  const { isOnboardingOpen, setIsOnboardingOpen } = useModalStore();
  const { isImageScannerOpen, setIsImageScannerOpen } = useModalStore();
  const { isGroundingSearchOpen, setIsGroundingSearchOpen } = useModalStore();
  const { isMusicPlayerOpen, setIsMusicPlayerOpen } = useModalStore();
  const { isAuthOpen, setIsAuthOpen } = useModalStore();
  const { isDisclaimerOpen, setIsDisclaimerOpen } = useModalStore();

  // Auto-show Onboarding for first-time visitors
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("stock_bloc_onboarding_dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsOnboardingOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn("localStorage error", e);
    }
  }, [setIsOnboardingOpen]);

  // Command Palette & Data Status
    const { isDataStatusOpen, setIsDataStatusOpen } = useModalStore();
  const { isProSubscriptionOpen, setIsProSubscriptionOpen } = useModalStore();
  const { isBrokerageModalOpen, setIsBrokerageModalOpen } = useModalStore();
  const { brokerageStock, setBrokerageStock } = useModalStore();
  const { userPlan, setUserPlan } = useUserStore();

  const handleOpenBrokerage = (stk?: StockTicker | null) => {
    setBrokerageStock(stk || selectedStock || stocks[0]);
    setIsBrokerageModalOpen(true);
  };

  // Extract REITs for Real Estate Hub
  const reitStocks = useMemo(
    () => stocks.filter((s) => s.category === "reits"),
    [stocks],
  );

  // Toggle Pinned status
  const handleTogglePin = (symbol: string) => {
    triggerHaptic("selection");
    setStocks(
      stocks.map((s) =>
        s.symbol === symbol ? { ...s, isPinned: !s.isPinned } : s,
      ),
    );
  };

  // Remove Stock from Watchlist
  const handleRemoveStock = (symbol: string) => {
    triggerHaptic("warning");
    setStocks(stocks.filter((s) => s.symbol !== symbol));
  };

  // Helpers for Quick Sorting
  const parseVolumeNumber = (volStr?: string): number => {
    if (!volStr) return 0;
    const clean = volStr.trim().toUpperCase();
    if (clean.includes("B")) return parseFloat(clean) * 1_000_000_000 || 0;
    if (clean.includes("M")) return parseFloat(clean) * 1_000_000 || 0;
    if (clean.includes("K")) return parseFloat(clean) * 1_000 || 0;
    const num = parseFloat(clean.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const calculateStockVolatility = (stock: StockTicker): number => {
    if (!stock) return 0;
    const range52 =
      (stock.low52 || 0) > 0
        ? (((stock.high52 || 0) - stock.low52) / stock.low52) * 100
        : 0;
    const absChange = Math.abs(stock.changePercent || 0);
    let sparklineVariance = 0;
    if (stock.sparkline && stock.sparkline.length > 1) {
      const min = Math.min(...stock.sparkline);
      const max = Math.max(...stock.sparkline);
      if (min > 0) sparklineVariance = ((max - min) / min) * 100;
    }
    return absChange * 3 + range52 + sparklineVariance * 2;
  };

  // Filter and Sort stocks
  const filteredStocks = useMemo(() => {
    let result = [...stocks];

    if (selectedCategory === "asymmetry") {
      result = result.filter(
        (s) =>
          s.asymmetryPotentialStars !== undefined ||
          s.tags.includes("High Asymmetry"),
      );
    } else if (selectedCategory !== "all") {
      result = result.filter((s) => s.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    result.sort((a, b) => {
      // Pin $SPCX as the #1 asset at the very top of all watchlists
      if (a.symbol.toUpperCase() === "SPCX") return -1;
      if (b.symbol.toUpperCase() === "SPCX") return 1;

      // Put pinned stocks next
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const dir = sortDirection === "desc" ? 1 : -1;

      if (sortField === "volatility") {
        return (calculateStockVolatility(b) - calculateStockVolatility(a)) * dir;
      }
      if (sortField === "volume") {
        return (parseVolumeNumber(b.volume) - parseVolumeNumber(a.volume)) * dir;
      }
      if (sortField === "changePercent") {
        return (b.changePercent - a.changePercent) * dir;
      }
      if (sortField === "price") return (b.price - a.price) * dir;
      if (sortField === "name") return a.symbol.localeCompare(b.symbol) * dir;
      if (sortField === "marketCap")
        return (parseVolumeNumber(b.marketCap) - parseVolumeNumber(a.marketCap)) * dir;
      if (sortField === "rsi")
        return ((b.rsi ?? 50) - (a.rsi ?? 50)) * dir;
      if (sortField === "asymmetry")
        return ((b.asymmetryPotentialStars ?? 0) - (a.asymmetryPotentialStars ?? 0)) * dir;
      return 0;
    });

    return result;
  }, [stocks, selectedCategory, searchQuery, sortField, sortDirection]);

  // Export Watchlist as CSV
  const handleExportWatchlistCsv = () => {
    triggerHaptic("success");
    const headers = [
      "Symbol",
      "Name",
      "Price ($)",
      "Change (%)",
      "Volume",
      "Market Cap",
      "RSI",
      "Asymmetry Stars",
      "Category",
    ];
    const rows = filteredStocks.map((s) => [
      `"${s.symbol}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      s.price,
      s.changePercent,
      `"${s.volume}"`,
      `"${s.marketCap}"`,
      s.rsi ?? 50,
      s.asymmetryPotentialStars ?? 0,
      `"${s.category}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `StockBloc_Watchlist_${selectedCategory}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Open Share for stock
  const handleOpenShareStock = (stock: StockTicker) => {
    setShareStock(stock);
    setIsShareModalOpen(true);
  };

  // Open Analyze directly for stock
  const handleAiAnalyzeStock = (stock: StockTicker) => {
    setSelectedStock(stock);
  };

  // Pull to refresh state & gesture handlers
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartRef = useRef<number>(0);
  const pullDistanceRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const triggeredHapticRef = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartRef.current = e.touches[0].clientY;
      setIsPulling(true);
      triggeredHapticRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartRef.current;
    if (diff > 0) {
      const distance = Math.min(diff * 0.45, 90);
      pullDistanceRef.current = distance;

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          setPullDistance(pullDistanceRef.current);
          if (pullDistanceRef.current >= 60 && !triggeredHapticRef.current) {
            triggerHaptic("refresh");
            triggeredHapticRef.current = true;
          }
          rafRef.current = null;
        });
      }
    }
  };

  const handleTouchEnd = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (pullDistanceRef.current >= 60) {
      triggerHaptic("success");
      handleSyncLiveQuotes();
    }
    pullDistanceRef.current = 0;
    setPullDistance(0);
    setIsPulling(false);
    triggeredHapticRef.current = false;
  };

  // Sync Live Market Stock Quotes via raw GitHub watchlist data
  const handleSyncLiveQuotes = useCallback(async () => {
    if (useMarketStore.getState().isSyncingLiveQuotes) return;
    setIsSyncingLiveQuotes(true);
    triggerHaptic("refresh");

    try {
      const res = await fetch("https://raw.githubusercontent.com/Jaywestphilly/stock-bloc-backend/main/market_watchlist_data.json");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      if (json && json.watchlist && Array.isArray(json.watchlist)) {
        const mappedStocks = json.watchlist.map((backendStock: BackendWatchlistStock) => {
          const history1D = (backendStock.sparkline || []).map((price: number, i: number) => ({
            time: new Date(Date.now() - ((backendStock.sparkline || []).length - 1 - i) * 60 * 60 * 1000).toISOString(),
            price
          }));
          const fakeHistory = {
             "1D": history1D,
             "1W": history1D,
             "1M": history1D,
             "1Y": history1D,
             "ALL": history1D
          };
          return {
            symbol: backendStock.symbol,
            name: backendStock.symbol,
            price: backendStock.price,
            change: backendStock.change,
            changePercent: backendStock.percent_change,
            category: "tsunami",
            sparkline: backendStock.sparkline || [],
            history: fakeHistory,
            marketCap: backendStock.market_cap || "N/A",
            peRatio: "N/A",
            high52: backendStock.price,
            low52: backendStock.price,
            volume: "N/A",
            description: backendStock.analysis_summary || "",
            tags: backendStock.sector ? [backendStock.sector] : [],
            isPinned: backendStock.pinned,
            targetPrice: backendStock.target_price,
            rating: backendStock.rating,
            instHolders: backendStock.inst_holders,
            headlines: backendStock.headlines || []
          };
        });
        setStocks(mappedStocks);
        setLastSyncTime(json.updated_at || new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }));
        triggerHaptic("success");
      }
    } catch (err) {
      console.warn("Live quotes sync error:", err);
    } finally {
      setIsSyncingLiveQuotes(false);
    }
  }, []);

  // Auto-sync real-time market stock quotes on initial load and every 30 seconds
  useEffect(() => {
    handleSyncLiveQuotes();
    const interval = setInterval(() => {
      handleSyncLiveQuotes();
    }, 30000);
    return () => clearInterval(interval);
  }, [handleSyncLiveQuotes]);

  // Priority marquee items ensuring SPCX is #1, followed by QQQ and DXYZ
  const spacexStock =
    stocks.find((s) => s.symbol.toUpperCase() === "SPCX") ||
    INITIAL_STOCKS.find((s) => s.symbol.toUpperCase() === "SPCX");
  const qqqStock =
    stocks.find((s) => s.symbol.toUpperCase() === "QQQ") ||
    INITIAL_STOCKS.find((s) => s.symbol.toUpperCase() === "QQQ");
  const dxyzStock =
    stocks.find((s) => s.symbol.toUpperCase() === "DXYZ") ||
    INITIAL_STOCKS.find((s) => s.symbol.toUpperCase() === "DXYZ");
  const restStocks = stocks.filter(
    (s) =>
      s.symbol.toUpperCase() !== "SPCX" &&
      s.symbol.toUpperCase() !== "QQQ" &&
      s.symbol.toUpperCase() !== "DXYZ",
  );

  const marqueeItems = [
    ...(spacexStock ? [spacexStock] : []),
    ...(qqqStock ? [qqqStock] : []),
    ...(dxyzStock ? [dxyzStock] : []),
    ...restStocks,
  ];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`min-h-screen bg-black grid-bg scanlines text-cyan-100 pb-24 font-mono select-none antialiased relative overflow-hidden`}
    >
      {/* Alien Laser Scan Beam */}
      <div className="scan-beam-line" />

      {/* iOS Pull to Refresh Visual Indicator */}
      {(pullDistance > 0 || isSyncingLiveQuotes) && (
        <div
          className="fixed top-2 left-1/2 -translate-x-1/2 z-50 transition-all duration-150 ease-out pointer-events-none"
          style={{
            transform: `translate(-50%, ${Math.min(pullDistance, 60)}px)`,
          }}
        >
          <div className="px-4 py-2 alien-block-cut-sm bg-neutral-950/90 border-2 border-cyan-400 backdrop-blur-xl shadow-2xl flex items-center gap-2 text-xs font-black text-cyan-300 uppercase tracking-wider">
            <RefreshCw
              className={`w-4 h-4 text-cyan-400 ${isSyncingLiveQuotes ? "animate-spin" : ""}`}
            />
            <span>
              {isSyncingLiveQuotes
                ? "CALIBRATING QUANT NODES..."
                : pullDistance >= 60
                  ? "RELEASE TO RE-SCAN"
                  : "PULL TO RE-SCAN"}
            </span>
          </div>
        </div>
      )}

      {/* Top Main iOS Header */}
      <Header
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
        onOpenAiAssistant={() => setIsAiCopilotOpen(true)}
        onOpenLinktree={() => setIsBrandLinktreeOpen(true)}
        onOpenShare={() => {
          setShareStock(null);
          setIsShareModalOpen(true);
        }}
        onOpenImageScanner={() => setIsImageScannerOpen(true)}
        onOpenGroundingSearch={() => setIsGroundingSearchOpen(true)}
        onOpenMusicPlayer={() => setIsMusicPlayerOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenBloombergTerminal={handleOpenBloombergTerminal}
        userPlan={userPlan}
        onSelectTab={handleSelectTab}
        isDayMode={isDayMode}
        onToggleDayMode={handleToggleDayMode}
      />

      {/* Desktop Top Navigation Bar */}
      <TopNavbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenTerminal={handleOpenBloombergTerminal}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      <>
        {/* Ticker Tape Marquee Pill Banner */}
        <div
          className={`w-full bg-[#020912]/90 border-b py-2 px-3 flex items-center gap-3 text-xs font-mono transition-all relative z-10 ${
            isSyncingLiveQuotes
              ? "border-cyan-400 glitch-border-refresh"
              : "border-cyan-500/30"
          }`}
        >
            <span
              className={`text-[10px] uppercase font-black bg-cyan-950/95 px-2.5 py-1 border border-cyan-500/50 alien-block-cut-sm shrink-0 flex items-center gap-1.5 tracking-widest z-20 shadow-lg shadow-black/80 ${
                isSyncingLiveQuotes
                  ? "text-amber-300 glitch-text-refresh border-amber-400"
                  : "text-cyan-300"
              }`}
            >
              <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
              // LIVE
            </span>

            <div className="overflow-hidden w-full relative flex items-center py-1 -my-1">
              <div className="animate-marquee-scroll flex items-center gap-2">
                {[...marqueeItems, ...marqueeItems].map((s, idx) => (
                  <button
                    key={`${s.symbol}-${idx}`}
                    onClick={() => {
                      triggerHaptic("selection");
                      setSelectedStock(s);
                    }}
                    style={{ animationDelay: `${idx * 0.3}s` }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 alien-block-cut-sm bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-200 shrink-0 font-bold active:scale-95 transition-all cursor-pointer text-xs ${
                      isSyncingLiveQuotes
                        ? "glitch-border-refresh"
                        : "animate-periodic-border-glitch"
                    }`}
                  >
                    <span
                      style={{ animationDelay: `${idx * 0.3}s` }}
                      className={`font-black ${isSyncingLiveQuotes ? "glitch-text-refresh text-cyan-300" : "animate-periodic-text-glitch text-cyan-100"}`}
                    >
                      ${s.symbol}
                    </span>
                    <span className="font-mono text-cyan-300/80">
                      $
                      {s.price >= 1000
                        ? s.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : s.price.toFixed(2)}
                    </span>
                    <span
                      className={`font-black font-mono text-[10px] ${s.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {s.changePercent >= 0 ? "+" : ""}
                      {s.changePercent.toFixed(1)}%
                    </span>
                    <NotFinancialAdviceTag className="scale-[0.6] origin-left -ml-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>

      {/* Main Tab Views */}
      <main className="max-w-3xl mx-auto w-full">
        <Suspense fallback={<HubLoadingFallback />}>
          {(activeTab === "watchlist" || activeTab === "podcasts") && (
          <div className="w-full">
            {/* Daily Gemini Market Pulse TL;DR Card */}
            <MarketPulseCard
              onOpenNewsFeed={() => {
                setActiveTab("youtube");
              }}
              onSelectTicker={(symbol) => {
                const matched = stocks.find(
                  (s) => s.symbol.toUpperCase() === symbol.toUpperCase(),
                );
                if (matched) {
                  setSelectedStock(matched);
                } else {
                  setSearchQuery(symbol);
                }
              }}
            />

            {/* Category Selector Tabs & Sort Pill */}
            <CategoryTabs
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              itemCount={filteredStocks.length}
              sortField={sortField}
              onSelectSort={setSortField}
            />

            {/* Real time Scrolling Watchlist News Ticker for Pinned Stocks */}
            <WatchlistNewsTicker
              stocks={stocks}
              onSelectStock={setSelectedStock}
            />

            {/* Brokerage Affiliate Action Bar */}
            <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <AffiliateLink
                href="https://robinhood.com"
                ctaText="OPEN BROKERAGE ACCOUNT"
                partnerName="Robinhood"
                category="watchlist"
                variant="cyan"
              />
            </div>

            {/* Quick Intelligence Action Bar */}
            <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={handleSyncLiveQuotes}
                disabled={isSyncingLiveQuotes}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-black shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-cyan-400 ${isSyncingLiveQuotes ? "animate-spin" : ""}`}
                />
                <span>
                  {isSyncingLiveQuotes
                    ? "Syncing Real Prices..."
                    : "Sync Real Market Prices"}
                </span>
                {lastSyncTime && (
                  <span className="text-[10px] text-neutral-400 font-mono">
                    ({lastSyncTime})
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsImageScannerOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Gemini Vision Scanner</span>
              </button>

              <button
                onClick={() => setIsGroundingSearchOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Search & Maps</span>
              </button>

              <button
                onClick={() => setIsMusicPlayerOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-extrabold shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Music className="w-3.5 h-3.5 text-purple-400" />
                <span>Lyria Focus Beats</span>
              </button>

              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Firebase Sync</span>
              </button>

              <button
                onClick={() => setActiveTab("dyson_swarm")}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-500/40 text-xs font-extrabold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <Orbit className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>Dyson Swarm Hub</span>
              </button>

              <button
                onClick={() => setActiveTab("war_gov_ufo")}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-500/40 text-xs font-black shrink-0 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>WAR.GOV / UFO Matrix</span>
              </button>

              <button
                onClick={() => setActiveTab("intelligence")}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-extrabold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>13F & Intel Matrix</span>
              </button>
            </div>

            {/* Quick Sort Menu Bar at top of StockCard list */}
            <div className="px-4 py-2.5 bg-[#030a12]/90 border-y border-cyan-500/30 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar my-2 backdrop-blur-md">
              <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono font-black text-cyan-300">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-tech uppercase tracking-wider text-[11px] text-cyan-200">
                  Sort:
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    triggerHaptic("selection");
                    setSortDirection(sortDirection === "desc" ? "asc" : "desc");
                  }}
                  className="px-2.5 py-1.5 alien-block-cut-sm bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/40 text-cyan-300 text-[10px] font-black font-mono flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  title="Toggle Sort Direction (High-to-Low or Low-to-High)"
                >
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  <span>{sortDirection === "desc" ? "HIGH → LOW" : "LOW → HIGH"}</span>
                </button>

                <button
                  onClick={() => {
                    triggerHaptic("selection");
                    setSortField("changePercent");
                  }}
                  className={`px-2.5 py-1.5 alien-block-cut-sm font-black text-[11px] font-mono flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                    sortField === "changePercent"
                      ? "bg-emerald-400 text-black shadow-md shadow-emerald-400/30 border border-emerald-300 font-bold"
                      : "bg-neutral-900/90 text-emerald-300 hover:bg-neutral-800 border border-emerald-500/30"
                  }`}
                  title="Sort by Price Change %"
                >
                  <TrendingUp
                    className={`w-3.5 h-3.5 ${sortField === "changePercent" ? "text-black" : "text-emerald-400"}`}
                  />
                  <span>% Change</span>
                </button>

                <button
                  onClick={() => {
                    triggerHaptic("selection");
                    setSortField("volume");
                  }}
                  className={`px-2.5 py-1.5 alien-block-cut-sm font-black text-[11px] font-mono flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                    sortField === "volume"
                      ? "bg-cyan-400 text-black shadow-md shadow-cyan-400/30 border border-cyan-300 font-bold"
                      : "bg-neutral-900/90 text-cyan-300 hover:bg-neutral-800 border border-cyan-500/30"
                  }`}
                  title="Sort by Trading Volume"
                >
                  <BarChart3
                    className={`w-3.5 h-3.5 ${sortField === "volume" ? "text-black" : "text-cyan-400"}`}
                  />
                  <span>Volume</span>
                </button>

                <button
                  onClick={() => {
                    triggerHaptic("selection");
                    setSortField("rsi");
                  }}
                  className={`px-2.5 py-1.5 alien-block-cut-sm font-black text-[11px] font-mono flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                    sortField === "rsi"
                      ? "bg-purple-400 text-black shadow-md shadow-purple-400/30 border border-purple-300 font-bold"
                      : "bg-neutral-900/90 text-purple-300 hover:bg-neutral-800 border border-purple-500/30"
                  }`}
                  title="Sort by RSI Momentum"
                >
                  <Activity
                    className={`w-3.5 h-3.5 ${sortField === "rsi" ? "text-black" : "text-purple-400"}`}
                  />
                  <span>RSI</span>
                </button>

                <button
                  onClick={() => {
                    triggerHaptic("selection");
                    setSortField("volatility");
                  }}
                  className={`px-2.5 py-1.5 alien-block-cut-sm font-black text-[11px] font-mono flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                    sortField === "volatility"
                      ? "bg-amber-400 text-black shadow-md shadow-amber-400/30 border border-amber-300 font-bold"
                      : "bg-neutral-900/90 text-amber-300 hover:bg-neutral-800 border border-amber-500/30"
                  }`}
                  title="Sort by Volatility"
                >
                  <Zap
                    className={`w-3.5 h-3.5 ${sortField === "volatility" ? "text-black" : "text-amber-400"}`}
                  />
                  <span>Volatility</span>
                </button>

                <button
                  onClick={handleExportWatchlistCsv}
                  data-testid="export-watchlist-csv"
                  className="px-2.5 py-1.5 alien-block-cut-sm bg-emerald-400 hover:bg-emerald-300 text-black font-black text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md shadow-emerald-400/20"
                  title="Export Watchlist to CSV File"
                >
                  <Download className="w-3.5 h-3.5 text-black" />
                  <span>EXPORT CSV</span>
                </button>
              </div>
            </div>

            {/* Ticker List Container */}
            <div className="w-full border-t border-neutral-900 mt-1">
              <AnimatePresence mode="popLayout">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock, index) => (
                    <StockCard
                      key={`${selectedCategory}-${searchQuery}-${stock.symbol}`}
                      index={index}
                      stock={stock}
                      onSelect={setSelectedStock}
                      onTogglePin={handleTogglePin}
                      onShare={handleOpenShareStock}
                      onAiAnalyze={handleAiAnalyzeStock}
                      onOpenNewsFeed={() => {
                        setActiveTab("youtube");
                      }}
                      onRemove={handleRemoveStock}
                      isSyncing={isSyncingLiveQuotes}
                      onOpenBrokerages={(st) => handleOpenBrokerage(st)}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center text-neutral-500 space-y-3">
                    <p className="text-sm font-semibold">
                      {stocks.length === 0
                        ? "Your Watchlist is empty."
                        : "No tickers found for search or category."}
                    </p>
                    {stocks.length === 0 ? (
                      <button
                        onClick={() => {
                          setStocks(INITIAL_STOCKS);
                          setSelectedCategory("all");
                          triggerHaptic("success");
                        }}
                        className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        Restore Default Watchlist
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                        }}
                        className="text-xs text-cyan-400 underline font-bold cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {activeTab === "heatmap" && (
          <HeatmapView stocks={stocks} onSelectStock={setSelectedStock} />
        )}

        {[
          "intelligence",
          "earnings",
          "rankings",
          "ipos",
          "ma",
          "regulatory",
          "hedge_funds",
          "report_repository",
        ].includes(activeTab) && (
          <div className="p-4">
            <MarketIntelligenceHub
              initialSubTab={
                ([
                  "earnings",
                  "rankings",
                  "ipos",
                  "ma",
                  "regulatory",
                  "hedge_funds",
                  "report_repository",
                ].includes(activeTab)
                  ? activeTab
                  : "report_repository") as IntelligenceSubTab
              }
              onSubTabChange={(subTab) => setActiveTab(subTab)}
              stocks={stocks}
              activeTicker={selectedStock}
            />
          </div>
        )}

        {activeTab === "macro" && (
          <MacroBriefingHub
            stocks={stocks}
            onSelectTicker={(symbol) => {
              const matched = stocks.find(
                (s) => s.symbol.toUpperCase() === symbol.toUpperCase()
              );
              if (matched) {
                setSelectedStock(matched);
              } else {
                setSearchQuery(symbol);
                setActiveTab("watchlist");
              }
            }}
          />
        )}

        {activeTab === "war_gov_ufo" && (
          <div className="p-4">
            <WarGovUfoHub
              allStocks={stocks}
              onSelectStock={(stock) => setSelectedStock(stock)}
            />
          </div>
        )}

        {activeTab === "dyson_swarm" && <DysonSwarmHub stocks={stocks} />}

        {activeTab === "real_estate" && (
          <RealEstateHub
            reitStocks={reitStocks}
            onSelectStock={setSelectedStock}
          />
        )}

        {activeTab === "small_business" && <SmallBusinessHub />}

        {activeTab === "credit" && <CreditBuildingHub />}

        {activeTab === "youtube" && <YouTubeHub />}

        {activeTab === "news" && <NewsHub />}

        {activeTab === "terminal_guide" && (
          <TerminalGuideHub
            onOpenTerminal={handleOpenBloombergTerminal}
            onNavigateTab={handleSelectTab}
          />
        )}

        {activeTab === "investopedia" && (
          <div className="p-4">
            <InvestopediaTab
              stocks={stocks}
              initialTicker={selectedStock}
              onSelectStock={(stock) => setSelectedStock(stock)}
            />
          </div>
        )}

        {activeTab === "ai_insights" && <AiRevolutionHub />}

        {activeTab === "playbooks" && (
          <PlaybooksHub
            onSelectTab={handleSelectTab}
          />
        )}

        {activeTab === "pricing" && (
          <div className="p-4 sm:p-6">
            <ProductStorePricing
              onSelectTab={handleSelectTab}
              onSuccessCheckout={(sessionId) => {
                handleSelectTab("checkout_success");
              }}
            />
          </div>
        )}

        {activeTab === "checkout_success" && (
          <div className="p-4 sm:p-6">
            <CheckoutSuccess onSelectTab={handleSelectTab} />
          </div>
        )}

        {activeTab === "my_bloc" && (
          <MyBlocDashboard
            stocks={stocks}
            onSelectStock={(stk) => {
              setSelectedStock(stk);
              setActiveTab("watchlist");
            }}
            onSelectTab={handleSelectTab}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === "brand" && (
          <BrandLandingHub
            onSelectTab={handleSelectTab}
            onOpenLinktree={() => setIsBrandLinktreeOpen(true)}
          />
        )}

        {activeTab === "docs" && <DocsHub />}
        </Suspense>
      </main>

      {/* Institutional Footer */}
      <Footer
        onSelectTab={handleSelectTab}
        onOpenLinktree={() => setIsBrandLinktreeOpen(true)}
        onOpenDataStatus={() => setIsDataStatusOpen(true)}
      />

      {/* Global Disclaimer Bar */}
      <DisclaimerBar onOpenDisclaimerModal={() => setIsDisclaimerOpen(true)} />

      {/* Floating X / Twitter / Community Action Button */}
      <FloatingCommunityButton />

      <Suspense fallback={null}>
        {/* Full Disclaimer Modal */}
        <DisclaimerModal
          isOpen={isDisclaimerOpen}
          onClose={() => setIsDisclaimerOpen(false)}
        />

      {/* Search Drawer Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-lg bg-neutral-950 border border-white/15 rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search BTC, ASML, SKHY, BE, PLPC, POET..."
                  className="w-full bg-transparent text-sm font-medium text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-full bg-white/10 text-neutral-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {stocks
                .filter(
                  (s) =>
                    s.symbol
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .slice(0, 8)
                .map((s) => (
                  <div
                    key={s.symbol}
                    onClick={() => {
                      setSelectedStock(s);
                      setIsSearchOpen(false);
                    }}
                    className="p-3 rounded-xl hover:bg-white/10 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-white text-sm block">
                        {s.symbol}
                      </span>
                      <span className="text-xs text-neutral-400">{s.name}</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-white">
                      $
                      {s.price >= 1000
                        ? s.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : s.price.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Stock Detail Modal */}
      <StockDetailModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        onTogglePin={handleTogglePin}
        onShare={handleOpenShareStock}
        onOpenBloombergTerminal={(st) => {
          setSelectedStock(st);
          setIsBloombergTerminalOpen(true);
        }}
        onOpenBrokerages={(st) => handleOpenBrokerage(st)}
      />

      {/* Copilot Drawer Modal */}
      <AiCopilotModal
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        activeTicker={selectedStock?.symbol}
      />

      {/* Stock Bloc Brand Linktree Modal */}
      <BrandLinktreeModal
        isOpen={isBrandLinktreeOpen}
        onClose={() => setIsBrandLinktreeOpen(false)}
      />

      {/* Social Share Snapshot Modal */}
      <SocialShareModal
        stock={shareStock}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Gemini Vision Photo & Document Scanner Modal */}
      <ImageAnalyzerModal
        isOpen={isImageScannerOpen}
        onClose={() => setIsImageScannerOpen(false)}
      />

      {/* Google Search & Maps Grounding Intelligence Modal */}
      <LiveSearchGroundingModal
        isOpen={isGroundingSearchOpen}
        onClose={() => setIsGroundingSearchOpen(false)}
        onSelectStockSymbol={(sym) => {
          const matched = stocks.find(
            (s) => s.symbol.toLowerCase() === sym.toLowerCase(),
          );
          if (matched) setSelectedStock(matched);
        }}
      />

      {/* Lyria Ambient Focus Music Player Modal */}
      <FocusMusicPlayerModal
        isOpen={isMusicPlayerOpen}
        onClose={() => setIsMusicPlayerOpen(false)}
      />

      {/* Firebase Authentication & Storage Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Pro Subscription Modal */}
      <ProSubscriptionModal
        isOpen={isProSubscriptionOpen}
        onClose={() => setIsProSubscriptionOpen(false)}
      />

      {/* SB Terminal Workstation Modal */}
      <BloombergTerminalModal
        isOpen={isBloombergTerminalOpen}
        onClose={handleCloseBloombergTerminal}
        stocks={stocks}
        selectedStock={selectedStock}
      />

      {/* Brokerage Referral Affiliate Network Modal */}
      <BrokerageAffiliateModal
        stock={brokerageStock}
        isOpen={isBrokerageModalOpen}
        onClose={() => setIsBrokerageModalOpen(false)}
      />

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={handleSelectTab}
        onSelectStock={(stk) => {
          setSelectedStock(stk);
          setActiveTab("watchlist");
        }}
        stocks={stocks}
      />

      {/* Data Status Audit Panel Modal */}
      <DataStatusPanel
        isOpen={isDataStatusOpen}
        onClose={() => setIsDataStatusOpen(false)}
        lastSyncTime={lastSyncTime}
      />

      {/* Guided 2-Step First-Time User Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onNavigateTab={handleSelectTab}
      />

      </Suspense>

      {/* App Launch Splash Overlay with Official Stock Bloc Emblem */}
      <LaunchSplashModal />

      {/* Floating Bottom Navigation */}

      <GlobalDisclaimerBar onOpenDisclaimerModal={() => setIsDisclaimerOpen(true)} />
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenTerminal={handleOpenBloombergTerminal}
        isTerminalOpen={isBloombergTerminalOpen}
      />
    </div>
  );
}

export default App;
