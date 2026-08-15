import React, { useState, useEffect } from "react";
import {
  Globe,
  Youtube,
  MessageSquare,
  Repeat2,
  Heart,
  Bookmark,
  Share2,
  Play,
  Send,
  Sparkles,
  CheckCircle2,
  Search,
  ExternalLink,
  Clock,
  TrendingUp,
  Filter,
  X,
  Volume2,
  ChevronRight,
  PlusCircle,
  Eye,
  Radio,
  BarChart2,
  Cpu,
  Layers,
  Sparkle,
  AlertTriangle,
  Users,
  Landmark,
  Rocket,
  Zap,
  List,
  LayoutGrid,
} from "lucide-react";
import { FEATURED_YOUTUBE_CHANNEL, INITIAL_YOUTUBE_VIDEOS } from "../../data/youtube";
import { PODCAST_NEWS_ARTICLES } from "../../data/podcasts";
import { YouTubeVideo, IntelFeedItem } from "../../types";
import { triggerHaptic } from "../../utils/haptics";
import { getStoredYouTubeVideos, syncYouTubeFeeds, formatTimeSinceSync } from "../../utils/youtubeSync";
import { useMarketStore } from "../../stores/marketStore";

export type CombinedFeedItem =
  | (Omit<YouTubeVideo, "timestamp"> & { itemCategory: "youtube" | "news_video"; type: "youtube_video"; timestamp: string });

const getItemTags = (item: CombinedFeedItem): string[] => {
  const tags: string[] = [];
  const text = `${item.title || ""} ${item.description || ""} ${
    item.keyTakeaways ? item.keyTakeaways.join(" ") : ""
  }`.toLowerCase();

  // Check AI
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

  // Check Biotech
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

  // Check Robotics
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

  // Check Self-Driving
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

  return tags;
};

interface NewsHubProps {
  onNavigateTab?: (tab: string) => void;
}

export const NewsHub: React.FC<NewsHubProps> = ({ onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "YOUTUBE" | "NEWS_VIDEOS" | "BOOKMARKS">("ALL");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"FULL" | "COMPACT">("FULL");
  
  const stocks = useMarketStore(s => s.stocks);
  const setSelectedStock = useMarketStore(s => s.setSelectedStock);

  const handleTickerClick = (tickerSymbol: string) => {
    const raw = tickerSymbol.replace('$', '');
    const found = stocks.find(s => s.symbol === raw);
    if (found) setSelectedStock(found);
    if (onNavigateTab) {
      onNavigateTab("MARKET");
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideoModal, setActiveVideoModal] = useState<YouTubeVideo | null>(null);
  const [feedVideos, setFeedVideos] = useState<YouTubeVideo[]>(() => getStoredYouTubeVideos());
  const [lastSyncedAt, setLastSyncedAt] = useState<number>(0);
  const [intelFeed, setIntelFeed] = useState<any[]>([]);

  // State for saved/bookmarked news item IDs
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("stock_bloc_bookmarked_news");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id: string) => {
    triggerHaptic("selection");
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem("stock_bloc_bookmarked_news", JSON.stringify(next));
      } catch (err) {
        console.warn("Could not save bookmarks:", err);
      }
      return next;
    });
  };

  useEffect(() => {
    const getChannelRank = (channelName: string): number => {
      const c = (channelName || "").toLowerCase();
      if (c.includes("stock bloc")) return 1;
      if (c.includes("alexwg") || c.includes("wissner-gross")) return 2;
      if (c.includes("all-in")) return 3;
      if (c.includes("diamandis") || c.includes("moonshots")) return 4;
      if (c.includes("limitless")) return 5;
      return 6;
    };

    // Load initial feed
    fetch("/api/data/news")
      .then((res) => {
        if (!res.ok) return fetch("/intel_news_feed.json");
        return res;
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.intel_feed && Array.isArray(data.intel_feed)) {
          const sorted = [...data.intel_feed].sort((a: { channel_name?: string }, b: { channel_name?: string }) => {
            const rankA = getChannelRank(a.channel_name || "");
            const rankB = getChannelRank(b.channel_name || "");
            return rankA - rankB;
          });
          setIntelFeed(sorted);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch intel news feed, using fallback:", err);
        fetch("/intel_news_feed.json")
          .then((res) => res.json())
          .then((data) => {
            if (data.intel_feed && Array.isArray(data.intel_feed)) {
              setIntelFeed(data.intel_feed);
            }
          })
          .catch(console.error);
      });
  }, []);

  useEffect(() => {
    syncYouTubeFeeds(false).then((res) => {
      if (res.videos && res.videos.length > 0) {
        setFeedVideos(res.videos);

        // Dynamically update the top 2 featured positions (Stock Bloc #1 and Alex Wissner-Gross #2)
        // using the latest live-synced videos so they never remain frozen!
        const latestStockBloc = res.videos.find((v) => (v.channelName || "").toLowerCase().includes("stock bloc"));
        const latestAlexWg = res.videos.find((v) => (v.channelName || "").toLowerCase().includes("alexwg") || (v.channelName || "").toLowerCase().includes("wissner-gross"));
        const latestAllIn = res.videos.find((v) => (v.channelName || "").toLowerCase().includes("all-in"));
        const latestDiamandis = res.videos.find((v) => (v.channelName || "").toLowerCase().includes("diamandis"));

        setIntelFeed((prevFeed) => {
          const updatedFeed = [...prevFeed];

          if (latestStockBloc && latestStockBloc.youtubeId) {
            const sbIdx = updatedFeed.findIndex(item => (item.channel_name || "").toLowerCase().includes("stock bloc"));
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
              summary: latestStockBloc.description || "Official video from Stock Bloc (@stockbloc)."
            };
            if (sbIdx >= 0) {
              updatedFeed[sbIdx] = sbItem;
            } else {
              updatedFeed.unshift(sbItem);
            }
          }

          if (latestAlexWg && latestAlexWg.youtubeId) {
            const alexIdx = updatedFeed.findIndex(item => (item.channel_name || "").toLowerCase().includes("alexwg") || (item.channel_name || "").toLowerCase().includes("wissner-gross"));
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
              summary: latestAlexWg.description || "Latest dispatch from Dr. Alexander Wissner-Gross."
            };
            if (alexIdx >= 0) {
              updatedFeed[alexIdx] = alexItem;
            } else {
              updatedFeed.splice(1, 0, alexItem);
            }
          }

          if (latestAllIn && latestAllIn.youtubeId) {
            const allInIdx = updatedFeed.findIndex(item => (item.channel_name || "").toLowerCase().includes("all-in"));
            if (allInIdx >= 0) {
              updatedFeed[allInIdx] = {
                ...updatedFeed[allInIdx],
                title: latestAllIn.title,
                video_id: latestAllIn.youtubeId,
                video_url: latestAllIn.videoUrl || `https://www.youtube.com/watch?v=${latestAllIn.youtubeId}`,
                embed_url: `https://www.youtube.com/embed/${latestAllIn.youtubeId}`,
                watch_url: latestAllIn.videoUrl || `https://www.youtube.com/watch?v=${latestAllIn.youtubeId}`,
                thumbnail: latestAllIn.thumbnailUrl || `https://img.youtube.com/vi/${latestAllIn.youtubeId}/hqdefault.jpg`
              };
            }
          }

          if (latestDiamandis && latestDiamandis.youtubeId) {
            const dIdx = updatedFeed.findIndex(item => (item.channel_name || "").toLowerCase().includes("diamandis"));
            if (dIdx >= 0) {
              updatedFeed[dIdx] = {
                ...updatedFeed[dIdx],
                title: latestDiamandis.title,
                video_id: latestDiamandis.youtubeId,
                video_url: latestDiamandis.videoUrl || `https://www.youtube.com/watch?v=${latestDiamandis.youtubeId}`,
                embed_url: `https://www.youtube.com/embed/${latestDiamandis.youtubeId}`,
                watch_url: latestDiamandis.videoUrl || `https://www.youtube.com/watch?v=${latestDiamandis.youtubeId}`,
                thumbnail: latestDiamandis.thumbnailUrl || `https://img.youtube.com/vi/${latestDiamandis.youtubeId}/hqdefault.jpg`
              };
            }
          }

          return updatedFeed;
        });
      }
      if (res.syncedAt) {
        setLastSyncedAt(res.syncedAt);
      }
    });
  }, []);

  // Build combined items stream with deduplication and derived dates
  const combinedStream: CombinedFeedItem[] = feedVideos.map((v, index) => {
    const pubDate = v.publishedDate && v.publishedDate.includes("-") ? v.publishedDate : new Date(Date.now() - index * 86400000).toISOString();
    return {
      ...v,
      type: "youtube_video" as const,
      itemCategory: (v.channelName || "").toLowerCase().includes("stock bloc") ? ("youtube" as const) : ("news_video" as const),
      timestamp: pubDate,
    };
  });

  // Track already rendered video IDs to prevent duplicate rendering
  const seenVideoIds = new Set<string>();

  // Count YouTube (Stock Bloc) vs Other News Videos
  const stockBlocVideosCount = feedVideos.filter((v) => (v.channelName || "").toLowerCase().includes("stock bloc")).length;
  const newsVideosCount =
    feedVideos.filter((v) => !(v.channelName || "").toLowerCase().includes("stock bloc")).length +
    intelFeed.filter((v) => !(v.channel_name || "").toLowerCase().includes("stock bloc")).length;

  // Filter Intel Feed
  const filteredIntelFeed = intelFeed.filter((video) => {
    const vId = video.video_id || video.embed_url || video.title;
    if (seenVideoIds.has(vId)) return false;
    seenVideoIds.add(vId);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (video.title || "").toLowerCase().includes(q) ||
        (video.channel_name || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    if (activeTab === "YOUTUBE") return (video.channel_name || "").toLowerCase().includes("stock bloc");
    if (activeTab === "NEWS_VIDEOS") return !(video.channel_name || "").toLowerCase().includes("stock bloc");
    return true; // ALL
  });

  // Filter Stream with deduplication against seen IDs
  const filteredStream = combinedStream.filter((item) => {
    const sId = item.youtubeId || item.id || item.title;
    if (seenVideoIds.has(sId)) return false;
    seenVideoIds.add(sId);

    // Sector filter
    if (activeTags.length > 0) {
      const tags = getItemTags(item);
      const hasMatch = activeTags.some(t => tags.includes(t));
      if (!hasMatch) return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (activeTab === "YOUTUBE") return item.itemCategory === "youtube";
    if (activeTab === "NEWS_VIDEOS") return item.itemCategory === "news_video";
    return true; // ALL
  });

  return (
    <div className="w-full flex flex-col gap-6 font-mono text-neutral-300 p-3 sm:p-5 pb-32 max-w-4xl mx-auto relative z-10 select-none">
      {/* HEADER BANNER */}
      <div className="bg-[#020b14]/95 border-2 border-cyan-500/50 p-5 rounded-2xl alien-block-cut shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
        {/* Ambient glow backdrop */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
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
              <span className="text-rose-400 flex items-center gap-1">
                YouTube
              </span>
              <span className="text-cyan-400">&</span>
              <span className="text-white">Intel Feed</span>
            </h1>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl relative z-10">
          Combined live intelligence feed blending verified institutional alerts, official Stock Bloc YouTube video breakdowns, and macro briefings.
        </p>

        {/* CHANNEL STATS BAR */}
        <div className="mt-4 pt-4 border-t border-cyan-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-neutral-400">
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
              <span className="text-[9px] text-neutral-500">Official 𝕏 Account</span>
            </div>
          </a>

          <div className="flex items-center gap-2 p-2 bg-black/60 rounded-lg border border-neutral-800">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <span className="text-emerald-300 block leading-none">{formatTimeSinceSync(lastSyncedAt)}</span>
              <span className="text-[9px] text-neutral-500">Auto-Synced Stream</span>
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
              <span className="text-[9px] text-neutral-500">Founder & Macro Analyst</span>
            </div>
          </a>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#020912]/80 border border-neutral-800 p-2 rounded-xl">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
            <span>LATEST NEWS VIDEOS ({newsVideosCount})</span>
          </button>
        </div>
        
        {/* View Mode Toggle */}
        <div className="hidden md:flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setViewMode("FULL")}
            className={`p-1.5 rounded-md transition-colors ${viewMode === "FULL" ? "bg-cyan-900/40 text-cyan-400" : "text-neutral-500 hover:text-white"}`}
            title="Full Dossier Mode"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("COMPACT")}
            className={`p-1.5 rounded-md transition-colors ${viewMode === "COMPACT" ? "bg-cyan-900/40 text-cyan-400" : "text-neutral-500 hover:text-white"}`}
            title="Compact Wire Mode"
          >
            <List className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-neutral-800 mx-1"></div>
          <button
            onClick={() => setActiveTab("BOOKMARKS")}
            className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${activeTab === "BOOKMARKS" ? "bg-cyan-900/40 text-cyan-400" : "text-neutral-500 hover:text-white"}`}
            title="Saved Dispatches"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feed, $NVDA, author..."
            className="w-full bg-black/80 border border-neutral-800 focus:border-cyan-400 rounded-lg pl-8 pr-3 py-1.5 text-xs text-cyan-200 placeholder-neutral-600 focus:outline-none font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SECTOR PILL FILTERS */}
      <div className="flex flex-wrap items-center gap-2 bg-[#020912]/40 border border-neutral-900/60 p-2.5 rounded-xl px-3 animate-in fade-in slide-in-from-top-1 duration-200">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1.5 mr-1 select-none">
          <Filter className="w-3 h-3 text-neutral-600" />
          Sectors:
        </span>
        {[
          { name: "AI", colorClass: "border-cyan-500/20 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 hover:border-cyan-500/40", activeClass: "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)] hover:bg-cyan-300" },
          { name: "Biotech", colorClass: "border-emerald-500/20 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 hover:border-emerald-500/40", activeClass: "bg-emerald-400 text-black border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)] hover:bg-emerald-300" },
          { name: "Robotics", colorClass: "border-purple-500/20 text-purple-400 bg-purple-950/20 hover:bg-purple-950/40 hover:border-purple-500/40", activeClass: "bg-purple-400 text-white border-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.3)] hover:bg-purple-300" },
          { name: "Self-Driving", colorClass: "border-amber-500/20 text-amber-400 bg-amber-950/20 hover:bg-amber-950/40 hover:border-amber-500/40", activeClass: "bg-amber-400 text-black border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)] hover:bg-amber-300" }
        ].map((sec) => {
          const isActive = activeTags.includes(sec.name);
          return (
            <button
              key={sec.name}
              onClick={() => {
                triggerHaptic("selection");
                setActiveTags(prev => prev.includes(sec.name) ? prev.filter(t => t !== sec.name) : [...prev, sec.name]);
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? sec.activeClass
                  : `${sec.colorClass}`
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-current animate-pulse" : "bg-neutral-600"}`} />
              {sec.name}
            </button>
          );
        })}
        {activeTags.length > 0 && (
          <button
            onClick={() => {
              triggerHaptic("medium");
              setActiveTags([]);
            }}
            className="text-[9px] font-black tracking-wider uppercase text-cyan-400/80 hover:text-cyan-300 ml-auto px-2 py-1 hover:bg-neutral-900 rounded transition-colors flex items-center gap-1"
          >
            <span>Reset filter</span>
            <X className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* FEED STREAM CONTAINER */}
      <div className="space-y-4">
        {/* Render Live Intel Feed */}
        {filteredIntelFeed.map((video, idx) => {
          const isStockBloc = (video.channel_name || "").toLowerCase().includes("stock bloc");
          const isAlexWg = (video.channel_name || "").toLowerCase().includes("alexwg") || (video.channel_name || "").toLowerCase().includes("wissner-gross");
          const borderColor = isStockBloc ? "border-rose-500/40" : isAlexWg ? "border-amber-500/40" : "border-cyan-500/30";
          const bgColor = isStockBloc ? "bg-[#0b0306]/90" : isAlexWg ? "bg-[#0c0902]/90" : "bg-[#050b14]/90";
          const iconColor = isStockBloc ? "text-rose-500" : isAlexWg ? "text-amber-400" : "text-cyan-400";
          const shadowColor = isStockBloc ? "shadow-[0_0_20px_rgba(244,63,94,0.1)]" : isAlexWg ? "shadow-[0_0_20px_rgba(245,158,11,0.1)]" : "shadow-[0_0_20px_rgba(6,182,212,0.08)]";

          return (
            <article
              key={video.video_id || idx}
              className={`${bgColor} border ${borderColor} rounded-2xl p-4 sm:p-5 transition-all space-y-3 relative overflow-hidden ${shadowColor}`}
            >
              <div className={`flex items-center justify-between gap-2 border-b ${isStockBloc ? "border-rose-500/20" : isAlexWg ? "border-amber-500/20" : "border-cyan-500/20"} pb-2`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <Youtube className={`w-5 h-5 ${iconColor}`} />
                  <span className="text-white font-black text-xs uppercase tracking-wider">
                    {video.channel_name}
                  </span>
                  {isStockBloc && (
                    <span className="px-2 py-0.5 bg-rose-950/80 text-rose-300 border border-rose-500/50 text-[9px] font-black rounded uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping" />
                      POSITION #1
                    </span>
                  )}
                  {isAlexWg && (
                    <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-500/50 text-[9px] font-black rounded uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                      POSITION #2
                    </span>
                  )}
                </div>
                <span className="text-neutral-500 text-[10px] font-bold">
                  {video.published}
                </span>
              </div>
              
              <div className="flex flex-col gap-4">
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
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-3 pt-2">
                    <a
                      href={video.watch_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 ${isStockBloc ? "bg-rose-600 hover:bg-rose-500" : isAlexWg ? "bg-amber-600 hover:bg-amber-500" : "bg-cyan-600 hover:bg-cyan-500"} text-white font-black text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-md`}
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

        {/* Render the stream of items */}
        {filteredStream.length === 0 ? (
          <div className="p-12 text-center border border-neutral-800 bg-[#020912]/80 rounded-xl space-y-3">
            <Search className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-sm font-bold text-neutral-400">
              No feed items match "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-1.5 bg-neutral-900 border border-neutral-700 text-cyan-300 rounded text-xs hover:bg-cyan-950"
            >
              Clear Search Filter
            </button>
          </div>
        ) : (
          filteredStream.map((item) => {
            // RENDER YOUTUBE OR NEWS VIDEO ITEM
            if (item.itemCategory === "youtube" || item.itemCategory === "news_video") {
              const video = item as unknown as YouTubeVideo;
              const isNews = item.itemCategory === "news_video";
              const borderColor = isNews ? "border-cyan-500/30 hover:border-cyan-500/60" : "border-rose-500/30 hover:border-rose-500/60";
              const bgColor = isNews ? "bg-[#050b14]/90" : "bg-[#0b0306]/90";
              const iconColor = isNews ? "text-cyan-400" : "text-rose-500";
              const labelText = isNews ? video.channelName : (video.channelName || "Stock Bloc Official");
              const shadowColor = isNews ? "shadow-[0_0_20px_rgba(6,182,212,0.08)]" : "shadow-[0_0_20px_rgba(244,63,94,0.08)]";
              const accentColor = isNews ? "bg-cyan-600 hover:bg-cyan-500" : "bg-rose-600 hover:bg-rose-500";
              const badgeColors = isNews ? "bg-cyan-950/40 border-cyan-500/30 text-cyan-300" : "bg-rose-950/40 border-rose-500/30 text-rose-300";

              return (
                <article
                  key={video.id}
                  className={`${bgColor} border ${borderColor} rounded-2xl p-4 sm:p-5 transition-all space-y-3 relative overflow-hidden group ${shadowColor}`}
                >
                  <div className={`flex items-center justify-between gap-2 border-b ${isNews ? "border-cyan-500/20" : "border-rose-500/20"} pb-2`}>
                    <div className="flex items-center gap-2">
                      <Youtube className={`w-5 h-5 ${iconColor}`} />
                      <span className="text-white font-bold text-xs uppercase tracking-wider">
                        {labelText}
                      </span>
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
                    <span className="text-neutral-500 text-[10px] font-bold">
                      {video.views}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
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
                        {video.title}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>

                      {video.keyTakeaways && video.keyTakeaways.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {video.keyTakeaways.map((takeaway, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 ${badgeColors} text-[9px] font-bold rounded`}
                            >
                              • {takeaway}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
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

                        <a
                          href={video.videoUrl || `https://youtube.com/watch?v=${video.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-1.5 bg-neutral-900 border ${borderColor} ${iconColor} text-xs font-bold rounded-lg flex items-center gap-1 transition-all hover:bg-neutral-800`}
                        >
                          <span>Open on YouTube</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }


          })
        )}
      </div>

      {/* EDUCATIONAL DISCLAIMER NOTICE */}
      <div className="p-4 border border-cyan-500/20 bg-[#020912]/90 rounded-xl text-[11px] text-neutral-400 leading-relaxed flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block mb-0.5">Educational Intelligence Notice</span>
          Content provided across YouTube, 𝕏, and RSS feeds is for informational, quantitative research, and educational purposes only. Stock Bloc does not provide individualized financial or investment advice.
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
              <p className="text-xs text-neutral-300 leading-relaxed">
                {activeVideoModal.description}
              </p>

              {activeVideoModal.keyTakeaways && (
                <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-lg space-y-1">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block">
                    Key Market Takeaways
                  </span>
                  <ul className="list-disc list-inside text-xs text-rose-200 space-y-0.5">
                    {activeVideoModal.keyTakeaways.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <span className="text-xs text-neutral-500">
                Official Video • Stock Bloc
              </span>
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
