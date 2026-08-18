import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Youtube,
  Bookmark,
  Play,
  Sparkles,
  Search,
  ExternalLink,
  Filter,
  X,
  Volume2,
  ChevronRight,
  Radio,
  AlertTriangle,
  Users,
  Landmark,
  Rocket,
  Zap,
  List,
  LayoutGrid,
  TrendingUp,
  Cpu,
  BookmarkCheck,
  RotateCcw,
} from "lucide-react";
import { YouTubeVideo } from "../../types";
import { triggerHaptic } from "../../utils/haptics";
import { getStoredYouTubeVideos, syncYouTubeFeeds, formatTimeSinceSync } from "../../utils/youtubeSync";
import { useMarketStore } from "../../stores/marketStore";

export type CombinedFeedItem =
  | (Omit<YouTubeVideo, "timestamp"> & { itemCategory: "youtube" | "news_video"; type: "youtube_video"; timestamp: string });

export type CatalystType = "BREAKING" | "MACRO_FOMC" | "WHALE_13F" | "ORBITAL_TECH";

export interface CatalystBadgeConfig {
  id: CatalystType;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
}

// 1. SMART TICKER TAGGER REGEX & COMPONENT
export const renderTextWithTickers = (text: string, onTickerClick: (symbol: string) => void): React.ReactNode => {
  if (!text) return null;
  const tickerRegex = /\$([A-Z]{1,6})\b/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tickerRegex.exec(text)) !== null) {
    const preText = text.substring(lastIndex, match.index);
    if (preText) {
      parts.push(preText);
    }
    const symbol = match[1];
    parts.push(
      <button
        key={`ticker-${match.index}-${symbol}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTickerClick(symbol);
        }}
        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded bg-cyan-950/90 hover:bg-cyan-400 text-cyan-300 hover:text-black border border-cyan-500/40 hover:border-cyan-400 font-mono font-black text-[10px] tracking-tight transition-all cursor-pointer shadow-[0_0_8px_rgba(6,182,212,0.2)] align-baseline active:scale-95 z-10"
        title={`Inspect $${symbol} fundamentals & technical metrics`}
      >
        <span>${symbol}</span>
      </button>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};

// 2. CATALYST & URGENCY CLASSIFIER
export const getCatalystBadges = (item: {
  title?: string;
  description?: string;
  summary?: string;
  channel_name?: string;
  channelName?: string;
  keyTakeaways?: string[];
}): CatalystBadgeConfig[] => {
  const text = `${item.title || ""} ${item.description || ""} ${item.summary || ""} ${
    item.keyTakeaways ? item.keyTakeaways.join(" ") : ""
  }`.toLowerCase();
  const badges: CatalystBadgeConfig[] = [];

  // BREAKING CATALYST
  if (
    text.includes("breaking") ||
    text.includes("urgent") ||
    text.includes("alert") ||
    text.includes("surprise") ||
    text.includes("fda") ||
    text.includes("earnings") ||
    text.includes("unveiled") ||
    text.includes("halts") ||
    text.includes("guidance") ||
    text.includes("catalyst") ||
    text.includes("disclosed")
  ) {
    badges.push({
      id: "BREAKING",
      label: "BREAKING CATALYST",
      shortLabel: "BREAKING",
      icon: Zap,
      colorClass: "text-amber-300",
      bgClass: "bg-amber-950/70",
      borderClass: "border-amber-500/50",
      dotClass: "bg-amber-400 animate-ping",
    });
  }

  // MACRO / FOMC
  if (
    text.includes("fed ") ||
    text.includes("fomc") ||
    text.includes("powell") ||
    text.includes("rate cut") ||
    text.includes("rate hike") ||
    text.includes("interest rate") ||
    text.includes("cpi") ||
    text.includes("pce") ||
    text.includes("inflation") ||
    text.includes("treasury") ||
    text.includes("yield") ||
    text.includes("liquidity") ||
    text.includes("macro") ||
    text.includes("gdp") ||
    text.includes("recession") ||
    text.includes("debt ceiling")
  ) {
    badges.push({
      id: "MACRO_FOMC",
      label: "MACRO / FOMC",
      shortLabel: "MACRO",
      icon: Landmark,
      colorClass: "text-indigo-300",
      bgClass: "bg-indigo-950/70",
      borderClass: "border-indigo-500/50",
      dotClass: "bg-indigo-400 animate-pulse",
    });
  }

  // 13F / INSIDER FLOW
  if (
    text.includes("13f") ||
    text.includes("hedge fund") ||
    text.includes("berkshire") ||
    text.includes("buffett") ||
    text.includes("tepper") ||
    text.includes("appaloosa") ||
    text.includes("insider") ||
    text.includes("form 4") ||
    text.includes("whale") ||
    text.includes("accumulation") ||
    text.includes("institutional") ||
    text.includes("portfolio") ||
    text.includes("druckenmiller") ||
    text.includes("pershing")
  ) {
    badges.push({
      id: "WHALE_13F",
      label: "13F / INSIDER FLOW",
      shortLabel: "13F WHALE",
      icon: Users,
      colorClass: "text-emerald-300",
      bgClass: "bg-emerald-950/70",
      borderClass: "border-emerald-500/50",
      dotClass: "bg-emerald-400",
    });
  }

  // ORBITAL / DEEP TECH
  if (
    text.includes("spacex") ||
    text.includes("starlink") ||
    text.includes("orbital") ||
    text.includes("satellite") ||
    text.includes("asts") ||
    text.includes("rocket") ||
    text.includes("launch") ||
    text.includes("quantum") ||
    text.includes("computronium") ||
    text.includes("dyson") ||
    text.includes("supercomputer") ||
    text.includes("physics")
  ) {
    badges.push({
      id: "ORBITAL_TECH",
      label: "ORBITAL / DEEP TECH",
      shortLabel: "ORBITAL",
      icon: Rocket,
      colorClass: "text-purple-300",
      bgClass: "bg-purple-950/70",
      borderClass: "border-purple-500/50",
      dotClass: "bg-purple-400 animate-pulse",
    });
  }

  return badges;
};

// 4. CROSS-MODULE CONTEXT JUMPERS INSPECTOR
export const getContextJumpers = (item: {
  title?: string;
  description?: string;
  summary?: string;
}): Array<{ label: string; tab: string; icon: React.ComponentType<{ className?: string }>; colorClass: string }> => {
  const text = `${item.title || ""} ${item.description || ""} ${item.summary || ""}`.toLowerCase();
  const jumpers: Array<{ label: string; tab: string; icon: React.ComponentType<{ className?: string }>; colorClass: string }> = [];

  if (text.includes("13f") || text.includes("buffett") || text.includes("berkshire") || text.includes("whale") || text.includes("hedge fund")) {
    jumpers.push({
      label: "Whale Consensus Matrix",
      tab: "intelligence",
      icon: Users,
      colorClass: "bg-emerald-950/50 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500 hover:text-black",
    });
  }

  if (text.includes("fed") || text.includes("fomc") || text.includes("inflation") || text.includes("yield") || text.includes("cpi") || text.includes("liquidity")) {
    jumpers.push({
      label: "Macro Economic Briefing",
      tab: "macro",
      icon: Landmark,
      colorClass: "bg-indigo-950/50 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500 hover:text-white",
    });
  }

  if (text.includes("spacex") || text.includes("starlink") || text.includes("orbital") || text.includes("satellite") || text.includes("dyson") || text.includes("computronium")) {
    jumpers.push({
      label: "SpaceX Orbital & Dyson Dossier",
      tab: "dyson_swarm",
      icon: Rocket,
      colorClass: "bg-purple-950/50 text-purple-300 border-purple-500/40 hover:bg-purple-500 hover:text-white",
    });
  }

  if (text.includes("blackwell") || text.includes("gpu") || text.includes("datacenter") || text.includes("semiconductor") || text.includes("foundry") || text.includes("ai infra")) {
    jumpers.push({
      label: "AI Revolution Infrastructure",
      tab: "ai_revolution",
      icon: Cpu,
      colorClass: "bg-cyan-950/50 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500 hover:text-black",
    });
  }

  return jumpers;
};

// Sector Categorizer Helper
const getItemTags = (item: { title?: string; description?: string; summary?: string; keyTakeaways?: string[] }): string[] => {
  const tags: string[] = [];
  const text = `${item.title || ""} ${item.description || ""} ${item.summary || ""} ${
    item.keyTakeaways ? item.keyTakeaways.join(" ") : ""
  }`.toLowerCase();

  if (
    text.includes("ai ") ||
    text.includes(" ai") ||
    text.includes("artificial intelligence") ||
    text.includes("computronium") ||
    text.includes("gpu") ||
    text.includes("semiconductor") ||
    text.includes("foundries") ||
    text.includes("foundry") ||
    text.includes("hbm") ||
    text.includes("blackwell") ||
    text.includes("neural") ||
    text.includes("agents") ||
    text.includes("agentic")
  ) {
    tags.push("AI");
  }

  if (
    text.includes("biotech") ||
    text.includes("biology") ||
    text.includes("longevity") ||
    text.includes("gene") ||
    text.includes("crispr") ||
    text.includes("addiction") ||
    text.includes("drug") ||
    text.includes("medicine") ||
    text.includes("clinical") ||
    text.includes("health")
  ) {
    tags.push("Biotech");
  }

  if (
    text.includes("robot") ||
    text.includes("robotics") ||
    text.includes("optimus") ||
    text.includes("humanoid") ||
    text.includes("automation") ||
    text.includes("drone")
  ) {
    tags.push("Robotics");
  }

  if (
    text.includes("self-driving") ||
    text.includes("autonomous") ||
    text.includes("robotaxi") ||
    text.includes("driving") ||
    text.includes("fleet") ||
    text.includes("fsd") ||
    text.includes("uber") ||
    text.includes("vehicle")
  ) {
    tags.push("Self-Driving");
  }

  if (text.includes("space") || text.includes("orbital") || text.includes("satellite") || text.includes("starlink") || text.includes("rocket")) {
    tags.push("Space");
  }

  if (text.includes("quantum") || text.includes("qubit") || text.includes("annealing") || text.includes("d-wave")) {
    tags.push("Quantum");
  }

  return tags;
};

interface NewsHubProps {
  onNavigateTab?: (tab: string) => void;
}

export const NewsHub: React.FC<NewsHubProps> = ({ onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "YOUTUBE" | "NEWS_VIDEOS" | "BOOKMARKS">("ALL");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeCatalystFilter, setActiveCatalystFilter] = useState<CatalystType | null>(null);
  const [viewMode, setViewMode] = useState<"FULL" | "COMPACT">("FULL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideoModal, setActiveVideoModal] = useState<YouTubeVideo | null>(null);
  const [feedVideos, setFeedVideos] = useState<YouTubeVideo[]>(() => getStoredYouTubeVideos());
  const [lastSyncedAt, setLastSyncedAt] = useState<number>(0);
  const [intelFeed, setIntelFeed] = useState<any[]>([]);

  // 6. AUDIO BRIEFING (TTS) STATE
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speechStatus, setSpeechStatus] = useState<"idle" | "playing" | "paused">("idle");
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleToggleAudioBriefing = (
    id: string,
    title: string,
    takeaways?: string[],
    description?: string,
    channelName?: string
  ) => {
    triggerHaptic("selection");
    if (!synthRef.current) return;

    if (speakingId === id && speechStatus === "playing") {
      synthRef.current.pause();
      setSpeechStatus("paused");
      return;
    }

    if (speakingId === id && speechStatus === "paused") {
      synthRef.current.resume();
      setSpeechStatus("playing");
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Prepare speech text
    let script = `Intelligence briefing from ${channelName || "Stock Bloc"}. ${title}. `;
    if (takeaways && takeaways.length > 0) {
      script += `Key market takeaways: ${takeaways.join(". ")}. `;
    } else if (description) {
      script += `Summary: ${description.slice(0, 300)}. `;
    }

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    // Pick an English voice if available
    const voices = synthRef.current.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
    ) || voices.find((v) => v.lang.startsWith("en"));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => {
      setSpeakingId(null);
      setSpeechStatus("idle");
    };

    utterance.onerror = () => {
      setSpeakingId(null);
      setSpeechStatus("idle");
    };

    synthRef.current.speak(utterance);
    setSpeakingId(id);
    setSpeechStatus("playing");
  };

  // 5. BOOKMARKS VAULT STATE
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("stock_bloc_bookmarked_news");
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id: string) => {
    triggerHaptic("selection");
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("stock_bloc_bookmarked_news", JSON.stringify(next));
        }
      } catch (err) {
        console.warn("Could not save bookmarks:", err);
      }
      return next;
    });
  };

  const clearAllBookmarks = () => {
    triggerHaptic("medium");
    setBookmarkedIds([]);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("stock_bloc_bookmarked_news");
      }
    } catch (err) {
      console.warn("Could not clear bookmarks:", err);
    }
  };

  const stocks = useMarketStore((s) => s.stocks);
  const setSelectedStock = useMarketStore((s) => s.setSelectedStock);

  // Deep Link Ticker Click Handler
  const handleTickerClick = (tickerSymbol: string) => {
    triggerHaptic("selection");
    const raw = tickerSymbol.replace("$", "").toUpperCase();
    const found = stocks.find((s) => s.symbol.toUpperCase() === raw);
    if (found) {
      setSelectedStock(found);
    }
    if (onNavigateTab) {
      onNavigateTab("watchlist");
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  // Initial feed loading
  useEffect(() => {
    if (typeof window === "undefined") return;

    const parseFeedDate = (dateStr?: string): number => {
      if (!dateStr) return 0;
      const parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) return parsed;
      // Handle custom formatted strings like "@alexwg • Aug 12, 2026"
      const datePart = dateStr.includes("•") ? dateStr.split("•")[1].trim() : dateStr;
      const p2 = Date.parse(datePart);
      return !isNaN(p2) ? p2 : 0;
    };

    const sortFeedByDateDesc = (items: any[]): any[] => {
      return [...items].sort((a, b) => {
        const timeA = parseFeedDate(a.published_date || a.published || a.timestamp);
        const timeB = parseFeedDate(b.published_date || b.published || b.timestamp);
        return timeB - timeA;
      });
    };

    fetch("/api/data/news")
      .then((res) => {
        if (!res.ok) return fetch("/intel_news_feed.json");
        return res;
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.intel_feed && Array.isArray(data.intel_feed)) {
          const sorted = sortFeedByDateDesc(data.intel_feed);
          setIntelFeed(sorted);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch intel news feed, using fallback:", err);
        fetch("/intel_news_feed.json")
          .then((res) => res.json())
          .then((data) => {
            if (data.intel_feed && Array.isArray(data.intel_feed)) {
              setIntelFeed(sortFeedByDateDesc(data.intel_feed));
            }
          })
          .catch(console.error);
      });
  }, []);

  // Sync background feed
  useEffect(() => {
    if (typeof window === "undefined") return;

    const parseFeedDate = (dateStr?: string): number => {
      if (!dateStr) return 0;
      const parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) return parsed;
      const datePart = dateStr.includes("•") ? dateStr.split("•")[1].trim() : dateStr;
      const p2 = Date.parse(datePart);
      return !isNaN(p2) ? p2 : 0;
    };

    const sortFeedByDateDesc = (items: any[]): any[] => {
      return [...items].sort((a, b) => {
        const timeA = parseFeedDate(a.published_date || a.published || a.timestamp);
        const timeB = parseFeedDate(b.published_date || b.published || b.timestamp);
        return timeB - timeA;
      });
    };

    syncYouTubeFeeds(false).then((res) => {
      if (res.videos && res.videos.length > 0) {
        setFeedVideos(res.videos);

        const latestStockBloc = res.videos.find((v) => (v.channelName || "").toLowerCase().includes("stock bloc"));
        const latestAlexWg = res.videos.find((v) => (v.channelName || "").toLowerCase().includes("alexwg") || (v.channelName || "").toLowerCase().includes("wissner-gross"));
        const latestAllIn = res.videos.find((v) => (v.channelName || "").toLowerCase().includes("all-in"));
        const latestDiamandis = res.videos.find((v) => (v.channelName || "").toLowerCase().includes("diamandis"));

        setIntelFeed((prevFeed) => {
          const updatedFeed = [...prevFeed];

          if (latestStockBloc && latestStockBloc.youtubeId) {
            const sbIdx = updatedFeed.findIndex((item) => (item.channel_name || "").toLowerCase().includes("stock bloc"));
            const sbItem = {
              id: latestStockBloc.id || "sb_official_live",
              title: latestStockBloc.title,
              channel_name: "Stock Bloc",
              published_date: latestStockBloc.publishedDate,
              video_id: latestStockBloc.youtubeId,
              video_url: latestStockBloc.videoUrl || `https://www.youtube.com/watch?v=${latestStockBloc.youtubeId}`,
              embed_url: `https://www.youtube.com/embed/${latestStockBloc.youtubeId}`,
              watch_url: latestStockBloc.videoUrl || `https://www.youtube.com/watch?v=${latestStockBloc.youtubeId}`,
              thumbnail: latestStockBloc.thumbnailUrl || `https://img.youtube.com/vi/${latestStockBloc.youtubeId}/hqdefault.jpg`,
              category: latestStockBloc.category || "Market Intelligence",
              summary: latestStockBloc.description || "Official video from Stock Bloc (@stockbloc).",
              keyTakeaways: latestStockBloc.keyTakeaways,
            };
            if (sbIdx >= 0) {
              updatedFeed[sbIdx] = sbItem;
            } else {
              updatedFeed.unshift(sbItem);
            }
          }

          if (latestAlexWg && latestAlexWg.youtubeId) {
            const alexIdx = updatedFeed.findIndex(
              (item) => (item.channel_name || "").toLowerCase().includes("alexwg") || (item.channel_name || "").toLowerCase().includes("wissner-gross")
            );
            const alexItem = {
              id: latestAlexWg.id || "alexwg_live",
              title: latestAlexWg.title,
              channel_name: "Alexander Wissner-Gross",
              published_date: latestAlexWg.publishedDate,
              video_id: latestAlexWg.youtubeId,
              video_url: latestAlexWg.videoUrl || `https://www.youtube.com/watch?v=${latestAlexWg.youtubeId}`,
              embed_url: `https://www.youtube.com/embed/${latestAlexWg.youtubeId}`,
              watch_url: latestAlexWg.videoUrl || `https://www.youtube.com/watch?v=${latestAlexWg.youtubeId}`,
              thumbnail: latestAlexWg.thumbnailUrl || `https://img.youtube.com/vi/${latestAlexWg.youtubeId}/hqdefault.jpg`,
              category: latestAlexWg.category || "Frontier Science",
              summary: latestAlexWg.description || "Latest dispatch from Dr. Alexander Wissner-Gross.",
              keyTakeaways: latestAlexWg.keyTakeaways,
            };
            if (alexIdx >= 0) {
              updatedFeed[alexIdx] = alexItem;
            } else {
              updatedFeed.splice(1, 0, alexItem);
            }
          }

          if (latestAllIn && latestAllIn.youtubeId) {
            const allInIdx = updatedFeed.findIndex((item) => (item.channel_name || "").toLowerCase().includes("all-in"));
            if (allInIdx >= 0) {
              updatedFeed[allInIdx] = {
                ...updatedFeed[allInIdx],
                title: latestAllIn.title,
                video_id: latestAllIn.youtubeId,
                video_url: latestAllIn.videoUrl || `https://www.youtube.com/watch?v=${latestAllIn.youtubeId}`,
                embed_url: `https://www.youtube.com/embed/${latestAllIn.youtubeId}`,
                watch_url: latestAllIn.videoUrl || `https://www.youtube.com/watch?v=${latestAllIn.youtubeId}`,
                thumbnail: latestAllIn.thumbnailUrl || `https://img.youtube.com/vi/${latestAllIn.youtubeId}/hqdefault.jpg`,
                keyTakeaways: latestAllIn.keyTakeaways,
              };
            }
          }

          if (latestDiamandis && latestDiamandis.youtubeId) {
            const dIdx = updatedFeed.findIndex((item) => (item.channel_name || "").toLowerCase().includes("diamandis"));
            if (dIdx >= 0) {
              updatedFeed[dIdx] = {
                ...updatedFeed[dIdx],
                title: latestDiamandis.title,
                video_id: latestDiamandis.youtubeId,
                video_url: latestDiamandis.videoUrl || `https://www.youtube.com/watch?v=${latestDiamandis.youtubeId}`,
                embed_url: `https://www.youtube.com/embed/${latestDiamandis.youtubeId}`,
                watch_url: latestDiamandis.videoUrl || `https://www.youtube.com/watch?v=${latestDiamandis.youtubeId}`,
                thumbnail: latestDiamandis.thumbnailUrl || `https://img.youtube.com/vi/${latestDiamandis.youtubeId}/hqdefault.jpg`,
                keyTakeaways: latestDiamandis.keyTakeaways,
              };
            }
          }

          return sortFeedByDateDesc(updatedFeed);
        });
      }
      if (res.syncedAt) {
        setLastSyncedAt(res.syncedAt);
      }
    });
  }, []);

  // Build combined items stream
  const combinedStream: CombinedFeedItem[] = useMemo(() => {
    return feedVideos.map((v, index) => {
      const pubDate = v.publishedDate && v.publishedDate.includes("-") ? v.publishedDate : new Date(Date.now() - index * 86400000).toISOString();
      return {
        ...v,
        type: "youtube_video" as const,
        itemCategory: (v.channelName || "").toLowerCase().includes("stock bloc") ? ("youtube" as const) : ("news_video" as const),
        timestamp: pubDate,
      };
    });
  }, [feedVideos]);

  // Counts
  const stockBlocVideosCount = feedVideos.filter((v) => (v.channelName || "").toLowerCase().includes("stock bloc")).length;
  const newsVideosCount =
    feedVideos.filter((v) => !(v.channelName || "").toLowerCase().includes("stock bloc")).length +
    intelFeed.filter((v) => !(v.channel_name || "").toLowerCase().includes("stock bloc")).length;

  // Filter Intel Feed
  const filteredIntelFeed = useMemo(() => {
    const seenVideoIds = new Set<string>();

    return intelFeed.filter((video) => {
      const vId = video.video_id || video.embed_url || video.title || video.id;
      if (seenVideoIds.has(vId)) return false;
      seenVideoIds.add(vId);

      const itemId = video.video_id || video.id || `intel-${video.title}`;

      // Bookmark filter
      if (activeTab === "BOOKMARKS" && !bookmarkedIds.includes(itemId)) {
        return false;
      }

      // Catalyst filter
      if (activeCatalystFilter) {
        const catalysts = getCatalystBadges(video);
        if (!catalysts.some((c) => c.id === activeCatalystFilter)) return false;
      }

      // Sector filter
      if (activeTags.length > 0) {
        const tags = getItemTags(video);
        const hasMatch = activeTags.some((t) => tags.includes(t));
        if (!hasMatch) return false;
      }

      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (video.title || "").toLowerCase().includes(q) ||
          (video.channel_name || "").toLowerCase().includes(q) ||
          (video.summary || "").toLowerCase().includes(q);
        if (!match) return false;
      }

      if (activeTab === "YOUTUBE") return (video.channel_name || "").toLowerCase().includes("stock bloc");
      if (activeTab === "NEWS_VIDEOS") return !(video.channel_name || "").toLowerCase().includes("stock bloc");
      return true; // ALL or BOOKMARKS
    });
  }, [intelFeed, activeTab, bookmarkedIds, activeCatalystFilter, activeTags, searchQuery]);

  // Filter Stream with deduplication against seen IDs
  const filteredStream = useMemo(() => {
    const seenVideoIds = new Set<string>();

    return combinedStream.filter((item) => {
      const sId = item.youtubeId || item.id || item.title;
      if (seenVideoIds.has(sId)) return false;
      seenVideoIds.add(sId);

      const itemId = item.youtubeId || item.id;

      // Bookmark filter
      if (activeTab === "BOOKMARKS" && !bookmarkedIds.includes(itemId)) {
        return false;
      }

      // Catalyst filter
      if (activeCatalystFilter) {
        const catalysts = getCatalystBadges(item);
        if (!catalysts.some((c) => c.id === activeCatalystFilter)) return false;
      }

      // Sector filter
      if (activeTags.length > 0) {
        const tags = getItemTags(item);
        const hasMatch = activeTags.some((t) => tags.includes(t));
        if (!hasMatch) return false;
      }

      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.channelName || "").toLowerCase().includes(q);
        if (!match) return false;
      }

      if (activeTab === "YOUTUBE") return item.itemCategory === "youtube";
      if (activeTab === "NEWS_VIDEOS") return item.itemCategory === "news_video";
      return true; // ALL or BOOKMARKS
    });
  }, [combinedStream, activeTab, bookmarkedIds, activeCatalystFilter, activeTags, searchQuery]);

  const totalResultsCount = filteredIntelFeed.length + filteredStream.length;

  return (
    <div className="w-full flex flex-col gap-5 font-mono text-neutral-300 p-3 sm:p-5 pb-32 max-w-4xl mx-auto relative z-10 select-none">
      {/* HEADER BANNER */}
      <div className="bg-[#020b14]/95 border-2 border-cyan-500/50 p-5 rounded-2xl alien-block-cut shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
        {/* Ambient glow backdrop */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 bg-black border border-cyan-400 text-cyan-300 text-[10px] font-black rounded tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                LIVE UNIFIED STREAM
              </span>
              <a
                href="https://www.youtube.com/@stockbloc"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[10px] font-black rounded tracking-widest flex items-center gap-1 hover:border-rose-400 transition-colors"
              >
                <Youtube className="w-3 h-3 text-rose-400" />
                @stockbloc
              </a>
              <a
                href="https://x.com/TheStockBloc"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-black rounded tracking-widest flex items-center gap-1 hover:border-cyan-400 transition-colors"
              >
                <span className="font-bold">𝕏</span>
                @TheStockBloc
              </a>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 uppercase">
              <span className="text-rose-400 flex items-center gap-1">YouTube</span>
              <span className="text-cyan-400">&</span>
              <span className="text-white">Intel Feed</span>
            </h1>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl relative z-10">
          Real-time institutional intelligence dispatches, Stock Bloc YouTube video breakdowns, frontier science dispatches, and deep-linked ticker catalysts.
        </p>

        {/* CHANNEL STATS BAR */}
        <div className="mt-4 pt-3 border-t border-cyan-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-neutral-400">
          <a
            href="https://www.youtube.com/@stockbloc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-black/60 rounded-lg border border-neutral-800 hover:border-rose-500/40 transition-colors group"
          >
            <Youtube className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-white block leading-none">Stock Bloc YT</span>
              <span className="text-[9px] text-neutral-500">Official Channel</span>
            </div>
          </a>

          <a
            href="https://x.com/TheStockBloc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-black/60 rounded-lg border border-neutral-800 hover:border-cyan-500/40 transition-colors group"
          >
            <span className="font-black text-white text-sm group-hover:scale-110 transition-transform">𝕏</span>
            <div>
              <span className="text-white block leading-none">@TheStockBloc</span>
              <span className="text-[9px] text-neutral-500">Official 𝕏 Feed</span>
            </div>
          </a>

          <div className="flex items-center gap-2 p-2 bg-black/60 rounded-lg border border-neutral-800">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <span className="text-emerald-300 block leading-none">{formatTimeSinceSync(lastSyncedAt)}</span>
              <span className="text-[9px] text-neutral-500">Auto-Synced 5 AM</span>
            </div>
          </div>

          <a
            href="https://x.com/JayWestPhilly"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-black/60 rounded-lg border border-neutral-800 hover:border-amber-500/40 transition-colors group"
          >
            <TrendingUp className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-amber-300 block leading-none">@JayWestPhilly</span>
              <span className="text-[9px] text-neutral-500">Macro Analyst</span>
            </div>
          </a>
        </div>
      </div>

      {/* FILTER TABS, VIEW MODE & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#020912]/90 border border-neutral-800 p-2.5 rounded-xl">
        {/* Feed Source Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => {
              triggerHaptic("selection");
              setActiveTab("ALL");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "ALL"
                ? "bg-cyan-400 text-black shadow-md shadow-cyan-400/30"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ALL FEEDS</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic("selection");
              setActiveTab("YOUTUBE");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "YOUTUBE"
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                : "text-neutral-400 hover:text-rose-400 hover:bg-neutral-900"
            }`}
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>YOUTUBE ({stockBlocVideosCount})</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic("selection");
              setActiveTab("NEWS_VIDEOS");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "NEWS_VIDEOS"
                ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
                : "text-neutral-400 hover:text-purple-300 hover:bg-neutral-900"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>LATEST DISPATCHES ({newsVideosCount})</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic("selection");
              setActiveTab("BOOKMARKS");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "BOOKMARKS"
                ? "bg-amber-400 text-black shadow-md shadow-amber-400/30"
                : "text-neutral-400 hover:text-amber-300 hover:bg-neutral-900"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>SAVED ({bookmarkedIds.length})</span>
          </button>
        </div>

        {/* View Mode Toggle & Search */}
        <div className="flex items-center gap-2 justify-between md:justify-end">
          {/* 3. VIEW MODE TOGGLE (FULL DOSSIER vs TERMINAL WIRE) */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => {
                triggerHaptic("selection");
                setViewMode("FULL");
              }}
              className={`px-2 py-1 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "FULL" ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow" : "text-neutral-500 hover:text-white"
              }`}
              title="Full Dossier Mode: Rich cards with video players and takeaways"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dossier</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic("selection");
                setViewMode("COMPACT");
              }}
              className={`px-2 py-1 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "COMPACT" ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow" : "text-neutral-500 hover:text-white"
              }`}
              title="Terminal Wire Mode: Compact high-density feed"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wire</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[180px] sm:min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feed, $NVDA, fed..."
              className="w-full bg-black/80 border border-neutral-800 focus:border-cyan-400 rounded-lg pl-8 pr-7 py-1.5 text-xs text-cyan-200 placeholder-neutral-600 focus:outline-none font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 7. MULTI-TAG MATRIX (SECTOR FILTERS & CATALYST BADGES) */}
      <div className="bg-[#020912]/60 border border-neutral-900 p-3 rounded-xl flex flex-col gap-2.5">
        {/* Sector Tag Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-neutral-600" />
            Sectors:
          </span>
          {[
            { name: "AI", colorClass: "border-cyan-500/20 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 hover:border-cyan-500/40", activeClass: "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]" },
            { name: "Biotech", colorClass: "border-emerald-500/20 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 hover:border-emerald-500/40", activeClass: "bg-emerald-400 text-black border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]" },
            { name: "Robotics", colorClass: "border-purple-500/20 text-purple-400 bg-purple-950/20 hover:bg-purple-950/40 hover:border-purple-500/40", activeClass: "bg-purple-400 text-white border-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.3)]" },
            { name: "Self-Driving", colorClass: "border-amber-500/20 text-amber-400 bg-amber-950/20 hover:bg-amber-950/40 hover:border-amber-500/40", activeClass: "bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]" },
            { name: "Space", colorClass: "border-fuchsia-500/20 text-fuchsia-400 bg-fuchsia-950/20 hover:bg-fuchsia-950/40 hover:border-fuchsia-500/40", activeClass: "bg-fuchsia-400 text-black border-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.3)]" },
            { name: "Quantum", colorClass: "border-blue-500/20 text-blue-400 bg-blue-950/20 hover:bg-blue-950/40 hover:border-blue-500/40", activeClass: "bg-blue-400 text-white border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]" },
          ].map((sec) => {
            const isActive = activeTags.includes(sec.name);
            return (
              <button
                key={sec.name}
                onClick={() => {
                  triggerHaptic("selection");
                  setActiveTags((prev) => (prev.includes(sec.name) ? prev.filter((t) => t !== sec.name) : [...prev, sec.name]));
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 ${
                  isActive ? sec.activeClass : sec.colorClass
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-current animate-pulse" : "bg-neutral-600"}`} />
                {sec.name}
              </button>
            );
          })}
        </div>

        {/* 2. CATALYST / EVENT TYPE BADGE SELECTOR */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-900/80">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1 mr-1">
            <Zap className="w-3 h-3 text-amber-500" />
            Catalysts:
          </span>
          {[
            { id: "BREAKING" as CatalystType, label: "⚡ Breaking Catalyst", activeClass: "bg-amber-400 text-black border-amber-400", defaultClass: "bg-amber-950/20 border-amber-500/20 text-amber-400 hover:border-amber-500/40" },
            { id: "MACRO_FOMC" as CatalystType, label: "🏛️ Macro / FOMC", activeClass: "bg-indigo-400 text-black border-indigo-400", defaultClass: "bg-indigo-950/20 border-indigo-500/20 text-indigo-400 hover:border-indigo-500/40" },
            { id: "WHALE_13F" as CatalystType, label: "🐋 13F / Whale Flow", activeClass: "bg-emerald-400 text-black border-emerald-400", defaultClass: "bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:border-emerald-500/40" },
            { id: "ORBITAL_TECH" as CatalystType, label: "🚀 Orbital / Deep Tech", activeClass: "bg-purple-400 text-white border-purple-400", defaultClass: "bg-purple-950/20 border-purple-500/20 text-purple-400 hover:border-purple-500/40" },
          ].map((cat) => {
            const isActive = activeCatalystFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  triggerHaptic("selection");
                  setActiveCatalystFilter(isActive ? null : cat.id);
                }}
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 ${
                  isActive ? cat.activeClass : cat.defaultClass
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          {(activeTags.length > 0 || activeCatalystFilter || searchQuery) && (
            <button
              onClick={() => {
                triggerHaptic("medium");
                setActiveTags([]);
                setActiveCatalystFilter(null);
                setSearchQuery("");
              }}
              className="text-[9px] font-black tracking-wider uppercase text-cyan-400 hover:text-cyan-300 ml-auto px-2 py-0.5 hover:bg-neutral-900 rounded transition-colors flex items-center gap-1"
            >
              <span>Reset all</span>
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* FEED STREAM CONTAINER */}
      <div className="space-y-4">
        {/* BOOKMARKS EMPTY STATE */}
        {activeTab === "BOOKMARKS" && totalResultsCount === 0 && (
          <div className="p-10 text-center border border-amber-500/20 bg-[#0a0802]/90 rounded-2xl space-y-3 shadow-xl">
            <Bookmark className="w-10 h-10 text-amber-400 mx-auto opacity-70" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">No Saved Dispatches Yet</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              Click the bookmark icon on any dispatch card or wire row to save items offline into your personal reading vault.
            </p>
            <button
              onClick={() => setActiveTab("ALL")}
              className="px-4 py-2 bg-amber-400 text-black font-black text-xs rounded-lg hover:bg-amber-300 transition-colors shadow-md cursor-pointer"
            >
              Explore Live Feed
            </button>
          </div>
        )}

        {/* BOOKMARKS ACTION HEADER */}
        {activeTab === "BOOKMARKS" && totalResultsCount > 0 && (
          <div className="flex items-center justify-between p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-amber-400" />
              <span className="font-black uppercase tracking-wider">
                Saved Bookmarks Vault ({bookmarkedIds.length} items)
              </span>
            </div>
            <button
              onClick={clearAllBookmarks}
              className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
            >
              Clear All Saved
            </button>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* COMPACT TERMINAL WIRE MODE                           */}
        {/* ---------------------------------------------------- */}
        {viewMode === "COMPACT" ? (
          <div className="bg-[#020912]/90 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800/80 shadow-2xl">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 p-3 bg-black/60 text-[10px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-800">
              <div className="col-span-3 sm:col-span-2">Source / Cat</div>
              <div className="col-span-7 sm:col-span-8">Dispatch & Tickers</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Intel Feed Items in Wire Mode */}
            {filteredIntelFeed.map((video) => {
              const itemId = video.video_id || video.id || `intel-${video.title}`;
              const isStockBloc = (video.channel_name || "").toLowerCase().includes("stock bloc");
              const isAlexWg = (video.channel_name || "").toLowerCase().includes("alexwg") || (video.channel_name || "").toLowerCase().includes("wissner-gross");
              const catalystBadges = getCatalystBadges(video);
              const isBookmarked = bookmarkedIds.includes(itemId);
              const isSpeaking = speakingId === itemId && speechStatus === "playing";

              return (
                <div
                  key={itemId}
                  className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-neutral-900/60 transition-colors group text-xs font-mono"
                >
                  {/* Source & Catalyst */}
                  <div className="col-span-3 sm:col-span-2 flex flex-col gap-1">
                    <span className={`text-[11px] font-black line-clamp-1 ${isStockBloc ? "text-rose-400" : isAlexWg ? "text-amber-400" : "text-cyan-400"}`}>
                      {video.channel_name}
                    </span>
                    {catalystBadges.length > 0 && (
                      <span className={`px-1.5 py-0.2 text-[8px] font-black rounded border w-fit ${catalystBadges[0].bgClass} ${catalystBadges[0].colorClass} ${catalystBadges[0].borderClass}`}>
                        {catalystBadges[0].shortLabel}
                      </span>
                    )}
                  </div>

                  {/* Headline with Tickers */}
                  <div className="col-span-7 sm:col-span-8 space-y-1">
                    <h4
                      onClick={() => {
                        triggerHaptic("medium");
                        setActiveVideoModal({
                          id: itemId,
                          youtubeId: video.video_id,
                          title: video.title,
                          channelName: video.channel_name,
                          thumbnailUrl: video.thumbnail || `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`,
                          duration: "LIVE",
                          views: "Verified",
                          publishedDate: video.published_date || "Live",
                          description: video.summary || video.description || "",
                          keyTakeaways: video.keyTakeaways || [],
                          category: video.category || "Intel",
                          videoUrl: video.watch_url,
                        });
                      }}
                      className="text-white font-bold text-xs sm:text-sm hover:text-cyan-300 cursor-pointer leading-snug"
                    >
                      {renderTextWithTickers(video.title, handleTickerClick)}
                    </h4>

                    {/* Context Jumpers Mini */}
                    {getContextJumpers(video).length > 0 && (
                      <div className="flex items-center gap-1 pt-0.5">
                        {getContextJumpers(video).slice(0, 1).map((jumper) => {
                          const Icon = jumper.icon;
                          return (
                            <button
                              key={jumper.tab}
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic("selection");
                                if (onNavigateTab) onNavigateTab(jumper.tab);
                              }}
                              className={`px-1.5 py-0.5 text-[9px] font-black rounded border flex items-center gap-1 transition-all cursor-pointer ${jumper.colorClass}`}
                            >
                              <Icon className="w-2.5 h-2.5" />
                              <span>{jumper.label}</span>
                              <ChevronRight className="w-2.5 h-2.5" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    {/* Audio Briefing Button */}
                    <button
                      onClick={() =>
                        handleToggleAudioBriefing(
                          itemId,
                          video.title,
                          video.keyTakeaways,
                          video.summary || video.description,
                          video.channel_name
                        )
                      }
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSpeaking
                          ? "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                          : "bg-black/60 border-neutral-800 text-neutral-400 hover:text-cyan-300 hover:border-cyan-500/40"
                      }`}
                      title={isSpeaking ? "Pause Spoken Briefing" : "Listen to Audio Briefing"}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "animate-pulse" : ""}`} />
                    </button>

                    {/* Watch Modal Button */}
                    <button
                      onClick={() => {
                        triggerHaptic("medium");
                        setActiveVideoModal({
                          id: itemId,
                          youtubeId: video.video_id,
                          title: video.title,
                          channelName: video.channel_name,
                          thumbnailUrl: video.thumbnail || `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`,
                          duration: "LIVE",
                          views: "Verified",
                          publishedDate: video.published_date || "Live",
                          description: video.summary || video.description || "",
                          keyTakeaways: video.keyTakeaways || [],
                          category: video.category || "Intel",
                          videoUrl: video.watch_url,
                        });
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                      title="Watch Embedded Video"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => toggleBookmark(itemId)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isBookmarked
                          ? "bg-amber-400 text-black border-amber-400"
                          : "bg-black/60 border-neutral-800 text-neutral-500 hover:text-amber-400 hover:border-amber-500/40"
                      }`}
                      title={isBookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Stream items in wire mode */}
            {filteredStream.map((item) => {
              const video = item as unknown as YouTubeVideo;
              const itemId = video.youtubeId || video.id;
              const isNews = item.itemCategory === "news_video";
              const catalystBadges = getCatalystBadges(item);
              const isBookmarked = bookmarkedIds.includes(itemId);
              const isSpeaking = speakingId === itemId && speechStatus === "playing";

              return (
                <div
                  key={itemId}
                  className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-neutral-900/60 transition-colors group text-xs font-mono"
                >
                  {/* Source & Catalyst */}
                  <div className="col-span-3 sm:col-span-2 flex flex-col gap-1">
                    <span className={`text-[11px] font-black line-clamp-1 ${isNews ? "text-cyan-400" : "text-rose-400"}`}>
                      {video.channelName || "Stock Bloc"}
                    </span>
                    {catalystBadges.length > 0 && (
                      <span className={`px-1.5 py-0.2 text-[8px] font-black rounded border w-fit ${catalystBadges[0].bgClass} ${catalystBadges[0].colorClass} ${catalystBadges[0].borderClass}`}>
                        {catalystBadges[0].shortLabel}
                      </span>
                    )}
                  </div>

                  {/* Headline with Tickers */}
                  <div className="col-span-7 sm:col-span-8 space-y-1">
                    <h4
                      onClick={() => {
                        triggerHaptic("medium");
                        setActiveVideoModal(video);
                      }}
                      className="text-white font-bold text-xs sm:text-sm hover:text-cyan-300 cursor-pointer leading-snug"
                    >
                      {renderTextWithTickers(video.title, handleTickerClick)}
                    </h4>

                    {/* Context Jumpers */}
                    {getContextJumpers(item).length > 0 && (
                      <div className="flex items-center gap-1 pt-0.5">
                        {getContextJumpers(item).slice(0, 1).map((jumper) => {
                          const Icon = jumper.icon;
                          return (
                            <button
                              key={jumper.tab}
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic("selection");
                                if (onNavigateTab) onNavigateTab(jumper.tab);
                              }}
                              className={`px-1.5 py-0.5 text-[9px] font-black rounded border flex items-center gap-1 transition-all cursor-pointer ${jumper.colorClass}`}
                            >
                              <Icon className="w-2.5 h-2.5" />
                              <span>{jumper.label}</span>
                              <ChevronRight className="w-2.5 h-2.5" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    {/* Audio Briefing */}
                    <button
                      onClick={() =>
                        handleToggleAudioBriefing(
                          itemId,
                          video.title,
                          video.keyTakeaways,
                          video.description,
                          video.channelName
                        )
                      }
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSpeaking
                          ? "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                          : "bg-black/60 border-neutral-800 text-neutral-400 hover:text-cyan-300 hover:border-cyan-500/40"
                      }`}
                      title={isSpeaking ? "Pause Spoken Briefing" : "Listen to Audio Briefing"}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "animate-pulse" : ""}`} />
                    </button>

                    {/* Watch Modal Button */}
                    <button
                      onClick={() => {
                        triggerHaptic("medium");
                        setActiveVideoModal(video);
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                      title="Watch Embedded Video"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => toggleBookmark(itemId)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isBookmarked
                          ? "bg-amber-400 text-black border-amber-400"
                          : "bg-black/60 border-neutral-800 text-neutral-500 hover:text-amber-400 hover:border-amber-500/40"
                      }`}
                      title={isBookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ---------------------------------------------------- */
          /* FULL DOSSIER MODE                                    */
          /* ---------------------------------------------------- */
          <>
            {/* Live Intel Feed Cards (with embedded responsive players) */}
            {filteredIntelFeed.map((video) => {
              const itemId = video.video_id || video.id || `intel-${video.title}`;
              const isStockBloc = (video.channel_name || "").toLowerCase().includes("stock bloc");
              const isAlexWg = (video.channel_name || "").toLowerCase().includes("alexwg") || (video.channel_name || "").toLowerCase().includes("wissner-gross");
              const borderColor = isStockBloc ? "border-rose-500/40" : isAlexWg ? "border-amber-500/40" : "border-cyan-500/30";
              const bgColor = isStockBloc ? "bg-[#0b0306]/90" : isAlexWg ? "bg-[#0c0902]/90" : "bg-[#050b14]/90";
              const iconColor = isStockBloc ? "text-rose-500" : isAlexWg ? "text-amber-400" : "text-cyan-400";
              const shadowColor = isStockBloc ? "shadow-[0_0_20px_rgba(244,63,94,0.1)]" : isAlexWg ? "shadow-[0_0_20px_rgba(245,158,11,0.1)]" : "shadow-[0_0_20px_rgba(6,182,212,0.08)]";

              const catalystBadges = getCatalystBadges(video);
              const contextJumpers = getContextJumpers(video);
              const isBookmarked = bookmarkedIds.includes(itemId);
              const isSpeaking = speakingId === itemId && speechStatus === "playing";

              return (
                <article
                  key={itemId}
                  className={`${bgColor} border ${borderColor} rounded-2xl p-4 sm:p-5 transition-all space-y-3 relative overflow-hidden ${shadowColor}`}
                >
                  {/* Top Bar */}
                  <div className={`flex items-center justify-between gap-2 border-b ${isStockBloc ? "border-rose-500/20" : isAlexWg ? "border-amber-500/20" : "border-cyan-500/20"} pb-2`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Youtube className={`w-5 h-5 ${iconColor}`} />
                      <span className="text-white font-black text-xs uppercase tracking-wider">
                        {video.channel_name}
                      </span>

                      {/* Catalyst Badges */}
                      {catalystBadges.map((badge) => {
                        const Icon = badge.icon;
                        return (
                          <span
                            key={badge.id}
                            className={`px-2 py-0.5 text-[9px] font-black rounded-md border flex items-center gap-1 uppercase tracking-wider ${badge.bgClass} ${badge.colorClass} ${badge.borderClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                            <Icon className="w-2.5 h-2.5" />
                            <span>{badge.label}</span>
                          </span>
                        );
                      })}

                      {isStockBloc && (
                        <span className="px-2 py-0.5 bg-rose-950/80 text-rose-300 border border-rose-500/50 text-[9px] font-black rounded uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping" />
                          FEATURED #1
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 text-[10px] font-bold">
                        {video.published_date || video.published || "Live"}
                      </span>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => toggleBookmark(itemId)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isBookmarked
                            ? "bg-amber-400 text-black border-amber-400"
                            : "bg-black/60 border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-amber-500/40"
                        }`}
                        title={isBookmarked ? "Remove from bookmarks" : "Save dispatch offline"}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-neutral-800 shadow-2xl">
                      <iframe
                        src={video.embed_url}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full absolute inset-0 border-0"
                      />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {renderTextWithTickers(video.title, handleTickerClick)}
                      </h3>

                      {video.summary && (
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          {renderTextWithTickers(video.summary, handleTickerClick)}
                        </p>
                      )}

                      {/* Key Takeaways if available */}
                      {video.keyTakeaways && video.keyTakeaways.length > 0 && (
                        <div className="bg-black/40 border border-neutral-800/80 p-2.5 rounded-xl space-y-1">
                          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">
                            Key Market Takeaways
                          </span>
                          <div className="flex flex-col gap-1">
                            {video.keyTakeaways.map((takeaway: string, tIdx: number) => (
                              <div key={tIdx} className="text-xs text-neutral-300 flex items-start gap-1.5">
                                <span className="text-cyan-400 font-bold">•</span>
                                <div>{renderTextWithTickers(takeaway, handleTickerClick)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. CROSS-MODULE CONTEXT JUMPERS */}
                      {contextJumpers.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {contextJumpers.map((jumper) => {
                            const Icon = jumper.icon;
                            return (
                              <button
                                key={jumper.tab}
                                onClick={() => {
                                  triggerHaptic("selection");
                                  if (onNavigateTab) onNavigateTab(jumper.tab);
                                }}
                                className={`px-2.5 py-1 text-[10px] font-black rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${jumper.colorClass}`}
                              >
                                <Icon className="w-3 h-3" />
                                <span>{jumper.label}</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center gap-2 pt-2 flex-wrap">
                        {/* 6. QUICK AUDIO BRIEFING BUTTON */}
                        <button
                          onClick={() =>
                            handleToggleAudioBriefing(
                              itemId,
                              video.title,
                              video.keyTakeaways,
                              video.summary || video.description,
                              video.channel_name
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSpeaking
                              ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                              : "bg-neutral-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/60"
                          }`}
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "animate-pulse" : ""}`} />
                          <span>{isSpeaking ? "Playing Audio Brief..." : "Audio Brief"}</span>
                        </button>

                        <a
                          href={video.watch_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-1.5 ${
                            isStockBloc ? "bg-rose-600 hover:bg-rose-500" : isAlexWg ? "bg-amber-600 hover:bg-amber-500" : "bg-cyan-600 hover:bg-cyan-500"
                          } text-white font-black text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-md`}
                        >
                          <span>Watch on YouTube</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* Standard Stream Cards */}
            {filteredStream.map((item) => {
              const video = item as unknown as YouTubeVideo;
              const itemId = video.youtubeId || video.id;
              const isNews = item.itemCategory === "news_video";
              const borderColor = isNews ? "border-cyan-500/30 hover:border-cyan-500/60" : "border-rose-500/30 hover:border-rose-500/60";
              const bgColor = isNews ? "bg-[#050b14]/90" : "bg-[#0b0306]/90";
              const iconColor = isNews ? "text-cyan-400" : "text-rose-500";
              const labelText = isNews ? video.channelName : video.channelName || "Stock Bloc Official";
              const shadowColor = isNews ? "shadow-[0_0_20px_rgba(6,182,212,0.08)]" : "shadow-[0_0_20px_rgba(244,63,94,0.08)]";
              const accentColor = isNews ? "bg-cyan-600 hover:bg-cyan-500" : "bg-rose-600 hover:bg-rose-500";
              const badgeColors = isNews ? "bg-cyan-950/40 border-cyan-500/30 text-cyan-300" : "bg-rose-950/40 border-rose-500/30 text-rose-300";

              const catalystBadges = getCatalystBadges(item);
              const contextJumpers = getContextJumpers(item);
              const isBookmarked = bookmarkedIds.includes(itemId);
              const isSpeaking = speakingId === itemId && speechStatus === "playing";

              return (
                <article
                  key={itemId}
                  className={`${bgColor} border ${borderColor} rounded-2xl p-4 sm:p-5 transition-all space-y-3 relative overflow-hidden group ${shadowColor}`}
                >
                  <div className={`flex items-center justify-between gap-2 border-b ${isNews ? "border-cyan-500/20" : "border-rose-500/20"} pb-2`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Youtube className={`w-5 h-5 ${iconColor}`} />
                      <span className="text-white font-bold text-xs uppercase tracking-wider">
                        {labelText}
                      </span>

                      {/* Catalyst Badges */}
                      {catalystBadges.map((badge) => {
                        const Icon = badge.icon;
                        return (
                          <span
                            key={badge.id}
                            className={`px-2 py-0.5 text-[9px] font-black rounded-md border flex items-center gap-1 uppercase tracking-wider ${badge.bgClass} ${badge.colorClass} ${badge.borderClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                            <Icon className="w-2.5 h-2.5" />
                            <span>{badge.label}</span>
                          </span>
                        );
                      })}

                      {video.isShort && (
                        <span className={`px-2 py-0.5 ${badgeColors} text-[9px] font-black rounded uppercase`}>
                          Short
                        </span>
                      )}
                      {isNews && (
                        <span className="px-2 py-0.5 bg-cyan-950/80 text-cyan-400 border border-cyan-500/50 text-[9px] font-black rounded uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                          Live News
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 text-[10px] font-bold">
                        {video.views}
                      </span>
                      {/* Bookmark button */}
                      <button
                        onClick={() => toggleBookmark(itemId)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isBookmarked
                            ? "bg-amber-400 text-black border-amber-400"
                            : "bg-black/60 border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-amber-500/40"
                        }`}
                        title={isBookmarked ? "Remove from bookmarks" : "Save dispatch offline"}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                    {/* Thumbnail Card with Play Overlay */}
                    <div
                      onClick={() => {
                        triggerHaptic("medium");
                        setActiveVideoModal(video);
                      }}
                      className={`relative rounded-xl overflow-hidden border ${isNews ? "border-cyan-500/30" : "border-rose-500/30"} aspect-video cursor-pointer group/thumb bg-black`}
                    >
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300 opacity-90"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/20 transition-colors flex items-center justify-center">
                        <div className={`w-12 h-12 rounded-full ${accentColor} text-white flex items-center justify-center shadow-2xl group-hover/thumb:scale-110 transition-transform`}>
                          <Play className="w-6 h-6 fill-white translate-x-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white font-mono text-[10px] font-black rounded border border-white/20">
                        {video.duration}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="sm:col-span-2 space-y-2">
                      {/* Sector Badges */}
                      {getItemTags(item).length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-1 animate-in fade-in duration-200">
                          {getItemTags(item).map((tag) => {
                            const colors =
                              tag === "AI"
                                ? "bg-cyan-950/40 border-cyan-500/30 text-cyan-400"
                                : tag === "Biotech"
                                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                                : tag === "Robotics"
                                ? "bg-purple-950/40 border-purple-500/30 text-purple-400"
                                : tag === "Space"
                                ? "bg-fuchsia-950/40 border-fuchsia-500/30 text-fuchsia-400"
                                : tag === "Quantum"
                                ? "bg-blue-950/40 border-blue-500/30 text-blue-400"
                                : "bg-amber-950/40 border-amber-500/30 text-amber-400";
                            return (
                              <span
                                key={tag}
                                className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${colors}`}
                              >
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <h3
                        onClick={() => {
                          triggerHaptic("medium");
                          setActiveVideoModal(video);
                        }}
                        className={`text-sm sm:text-base font-bold text-white ${isNews ? "group-hover:text-cyan-300" : "group-hover:text-rose-300"} transition-colors cursor-pointer leading-snug`}
                      >
                        {renderTextWithTickers(video.title, handleTickerClick)}
                      </h3>

                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {renderTextWithTickers(video.description, handleTickerClick)}
                      </p>

                      {video.keyTakeaways && video.keyTakeaways.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {video.keyTakeaways.map((takeaway, tIdx) => (
                            <span
                              key={tIdx}
                              className={`px-2 py-0.5 ${badgeColors} text-[9px] font-bold rounded`}
                            >
                              • {renderTextWithTickers(takeaway, handleTickerClick)}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 4. CROSS-MODULE CONTEXT JUMPERS */}
                      {contextJumpers.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {contextJumpers.map((jumper) => {
                            const Icon = jumper.icon;
                            return (
                              <button
                                key={jumper.tab}
                                onClick={() => {
                                  triggerHaptic("selection");
                                  if (onNavigateTab) onNavigateTab(jumper.tab);
                                }}
                                className={`px-2.5 py-1 text-[10px] font-black rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${jumper.colorClass}`}
                              >
                                <Icon className="w-3 h-3" />
                                <span>{jumper.label}</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2 flex-wrap">
                        <button
                          onClick={() => {
                            triggerHaptic("medium");
                            setActiveVideoModal(video);
                          }}
                          className={`px-3 py-1.5 ${accentColor} text-white font-black text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer`}
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Watch Video</span>
                        </button>

                        {/* 6. AUDIO BRIEFING BUTTON */}
                        <button
                          onClick={() =>
                            handleToggleAudioBriefing(
                              itemId,
                              video.title,
                              video.keyTakeaways,
                              video.description,
                              video.channelName
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSpeaking
                              ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                              : "bg-neutral-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/60"
                          }`}
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "animate-pulse" : ""}`} />
                          <span>{isSpeaking ? "Playing Brief..." : "Audio Brief"}</span>
                        </button>

                        <a
                          href={video.videoUrl || `https://youtube.com/watch?v=${video.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-1.5 bg-neutral-900 border ${borderColor} ${iconColor} text-xs font-bold rounded-lg flex items-center gap-1 transition-all hover:bg-neutral-800`}
                        >
                          <span>YouTube</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </>
        )}

        {/* Empty state for search / filters */}
        {totalResultsCount === 0 && activeTab !== "BOOKMARKS" && (
          <div className="p-12 text-center border border-neutral-800 bg-[#020912]/80 rounded-xl space-y-3">
            <Search className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-sm font-bold text-neutral-400">
              No feed items match your active filters {searchQuery ? `("${searchQuery}")` : ""}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveTags([]);
                setActiveCatalystFilter(null);
                setActiveTab("ALL");
              }}
              className="px-4 py-1.5 bg-neutral-900 border border-neutral-700 text-cyan-300 rounded text-xs hover:bg-cyan-950 cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* EDUCATIONAL DISCLAIMER NOTICE */}
      <div className="p-4 border border-cyan-500/20 bg-[#020912]/90 rounded-xl text-[11px] text-neutral-400 leading-relaxed flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block mb-0.5">Educational Intelligence Notice</span>
          Content provided across YouTube, 𝕏, and live dispatches is for informational, quantitative research, and educational purposes only. Stock Bloc does not provide individualized financial or investment advice.
        </div>
      </div>

      {/* EMBEDDED YOUTUBE VIDEO PLAYER MODAL */}
      {activeVideoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveVideoModal(null)}
        >
          <div
            className="w-full max-w-3xl bg-neutral-950 border-2 border-rose-500/80 rounded-2xl p-4 sm:p-6 alien-block-cut shadow-2xl space-y-4 relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider line-clamp-1">
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 bg-neutral-900 border border-rose-500/40 rounded-lg text-rose-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Responsive iFrame Player */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-neutral-800 shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoModal.youtubeId}?autoplay=1&rel=0`}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full absolute inset-0 border-0"
              />
            </div>

            {/* Takeaways & Info */}
            <div className="space-y-2">
              <div className="text-xs text-neutral-300 leading-relaxed">
                {renderTextWithTickers(activeVideoModal.description, handleTickerClick)}
              </div>

              {activeVideoModal.keyTakeaways && activeVideoModal.keyTakeaways.length > 0 && (
                <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-lg space-y-1">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block">
                    Key Market Takeaways
                  </span>
                  <div className="flex flex-col gap-1 text-xs text-rose-200">
                    {activeVideoModal.keyTakeaways.map((t, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <div>{renderTextWithTickers(t, handleTickerClick)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">
                  {activeVideoModal.channelName || "Stock Bloc"}
                </span>

                <button
                  onClick={() =>
                    handleToggleAudioBriefing(
                      activeVideoModal.id || activeVideoModal.youtubeId,
                      activeVideoModal.title,
                      activeVideoModal.keyTakeaways,
                      activeVideoModal.description,
                      activeVideoModal.channelName
                    )
                  }
                  className="px-2.5 py-1 rounded bg-neutral-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Audio Brief</span>
                </button>
              </div>

              <a
                href={activeVideoModal.videoUrl || `https://youtube.com/watch?v=${activeVideoModal.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsHub;
