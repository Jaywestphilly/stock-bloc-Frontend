import React, { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

export const TwitterTimelineWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const renderWidget = () => {
      if ((window as any).twttr && (window as any).twttr.widgets) {
        try {
          (window as any).twttr.widgets.load(containerRef.current);
          setIsLoaded(true);
        } catch (err) {
          console.warn("Twitter widget load error:", err);
        }
      }
    };

    // Load Twitter widgets.js script dynamically if not present
    const scriptId = "twitter-wjs";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      script.onload = () => {
        renderWidget();
      };
      document.head.appendChild(script);
    } else {
      renderWidget();
    }

    // Poll a few times in case twttr object takes a moment to initialize asynchronously
    let attempts = 0;
    timer = setInterval(() => {
      attempts++;
      if ((window as any).twttr && (window as any).twttr.widgets) {
        renderWidget();
        if (timer) clearInterval(timer);
      } else if (attempts > 12) {
        if (timer) clearInterval(timer);
      }
    }, 400);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-3">
      <div
        ref={containerRef}
        className="w-full min-h-[500px] flex items-center justify-center rounded-xl bg-black/80 border border-cyan-500/30 p-2 overflow-hidden"
      >
        <a
          className="twitter-timeline"
          data-height="500"
          data-theme="dark"
          href="https://twitter.com/stockbloc?ref_src=twsrc%5Etfw"
        >
          Tweets by stockbloc
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 w-full text-xs font-mono px-1 text-neutral-400">
        <span>Official Live @stockbloc 𝕏 Timeline</span>
        <a
          href="https://twitter.com/stockbloc"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold rounded-lg inline-flex items-center gap-1.5 transition-colors"
        >
          <span>Open @stockbloc on 𝕏</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
