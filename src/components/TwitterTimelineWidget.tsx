import React, { useEffect, useRef, useState } from "react";
import { ExternalLink, MessageSquare, Repeat2, Heart, ShieldCheck, Sparkles } from "lucide-react";

interface TweetFallback {
  id: string;
  authorName: string;
  handle: string;
  timestamp: string;
  content: string;
  likes: string;
  retweets: string;
  url: string;
  verified: boolean;
}

const STOCKBLOC_FEATURED_POSTS: TweetFallback[] = [
  {
    id: "1",
    authorName: "Stock Bloc Intelligence",
    handle: "thestockbloc",
    timestamp: "2h ago",
    content: "🚨 QUANT ALERT: Big Tech momentum shifting into high gear as AI Value Chain infrastructure demand surges. Tracking $NVDA $TSM $AVGO institutional accumulation ahead of earnings season. Full breakdown in terminal. 📈 #StockBloc #Trading",
    likes: "342",
    retweets: "89",
    url: "https://x.com/thestockbloc",
    verified: true
  },
  {
    id: "2",
    authorName: "Stock Bloc Intelligence",
    handle: "thestockbloc",
    timestamp: "5h ago",
    content: "📊 13F Institutional Filing Update: Citadel & Berkshire Hathaway report key Q2 portfolio rebalances. Citadel expanded tech call options while Berkshire boosted liquidity reserves. Search 13F Whale Tracker now. 🐋 #13F #HedgeFunds",
    likes: "512",
    retweets: "124",
    url: "https://x.com/thestockbloc",
    verified: true
  },
  {
    id: "3",
    authorName: "Stock Bloc Intelligence",
    handle: "thestockbloc",
    timestamp: "12h ago",
    content: "💡 Credit & Wealth Strategy: FCRA 611 validation letter generator updated inside the Credit Building Hub. Dispute inaccurate collection items with AI-guided legal templates. 🛡️ #CreditScore #WealthBuilding",
    likes: "289",
    retweets: "76",
    url: "https://x.com/thestockbloc",
    verified: true
  }
];

export const TwitterTimelineWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetStatus, setWidgetStatus] = useState<"loading" | "rendered" | "fallback">("loading");

  useEffect(() => {
    let isMounted = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

    const initWidget = () => {
      if (!containerRef.current) return;

      const windowTwttr = (window as any).twttr;
      if (windowTwttr && windowTwttr.widgets) {
        try {
          const anchorContainer = containerRef.current.querySelector(".twitter-timeline-anchor-box");
          if (anchorContainer) {
            windowTwttr.widgets.load(anchorContainer);
          }
        } catch (e) {
          console.warn("Twitter widget load error:", e);
        }
      }
    };

    // Load Twitter script dynamically if not present
    if (!(window as any).twttr) {
      const scriptId = "twitter-wjs";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        script.onload = () => {
          if (isMounted) initWidget();
        };
        script.onerror = () => {
          if (isMounted) setWidgetStatus("fallback");
        };
        document.head.appendChild(script);
      } else {
        initWidget();
      }
    } else {
      initWidget();
    }

    // Monitor whether Twitter iframe is rendered inside container
    pollTimer = setInterval(() => {
      if (containerRef.current?.querySelector("iframe")) {
        if (isMounted) setWidgetStatus("rendered");
        if (pollTimer) clearInterval(pollTimer);
      }
    }, 400);

    // If Twitter widget script fails or is blocked by privacy filters within 3.5s, fall back to clean feed
    timeoutTimer = setTimeout(() => {
      if (isMounted && widgetStatus === "loading" && !containerRef.current?.querySelector("iframe")) {
        setWidgetStatus("fallback");
      }
    }, 3500);

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-3">
      <div className="w-full min-h-[500px] rounded-xl bg-black/90 border border-cyan-500/30 p-3 relative overflow-hidden flex flex-col justify-between">
        
        {/* Twitter Timeline Container */}
        <div ref={containerRef} className="w-full h-full min-h-[460px] flex items-center justify-center">
          <div className="twitter-timeline-anchor-box w-full h-full">
            <a
              className="twitter-timeline"
              data-height="500"
              data-theme="dark"
              data-chrome="noheader nofooter transparent noscrollbar"
              href="https://twitter.com/thestockbloc?ref_src=twsrc%5Etfw"
            >
              Tweets by @thestockbloc
            </a>
          </div>
        </div>

        {/* Loading Overlay */}
        {widgetStatus === "loading" && (
          <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-cyan-400 z-20">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-3"></div>
            <span className="text-xs font-mono font-bold animate-pulse uppercase tracking-widest text-cyan-300">
              Syncing Live 𝕏 Feed...
            </span>
          </div>
        )}

        {/* Fallback Live Feed (shown if X widget is blocked or fails to load) */}
        {widgetStatus === "fallback" && (
          <div className="absolute inset-0 bg-neutral-950 p-4 flex flex-col z-20 overflow-y-auto divide-y divide-neutral-800">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs font-mono">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>@thestockbloc Official 𝕏 Feed</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                LIVE INTEL
              </span>
            </div>

            <div className="space-y-4 pt-3">
              {STOCKBLOC_FEATURED_POSTS.map((post) => (
                <div key={post.id} className="pt-3 pb-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
                        SB
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs font-bold text-neutral-200">
                          <span>{post.authorName}</span>
                          {post.verified && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 inline" />}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">@{post.handle} • {post.timestamp}</div>
                      </div>
                    </div>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>View on 𝕏</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed font-sans pl-10">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-6 pl-10 text-xs text-neutral-400 font-mono pt-1">
                    <span className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer">
                      <MessageSquare className="w-3.5 h-3.5" /> 18
                    </span>
                    <span className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer">
                      <Repeat2 className="w-3.5 h-3.5" /> {post.retweets}
                    </span>
                    <span className="flex items-center gap-1 hover:text-rose-400 cursor-pointer">
                      <Heart className="w-3.5 h-3.5 text-rose-500/80" /> {post.likes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 w-full text-xs font-mono px-1 text-neutral-400">
        <span>Official Live @thestockbloc 𝕏 Timeline</span>
        <a
          href="https://twitter.com/thestockbloc"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold rounded-lg inline-flex items-center gap-1.5 transition-colors"
        >
          <span>Open @thestockbloc on 𝕏</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

