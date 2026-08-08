import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import { TwitterTimelineEmbed } from "react-twitter-embed";

export const TwitterTimelineWidget: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-3">
      <div className="w-full min-h-[500px] flex items-center justify-center rounded-xl bg-black/80 border border-cyan-500/30 p-2 overflow-hidden relative">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-500/70 z-10 pointer-events-none">
            <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
            <span className="text-xs font-mono font-bold animate-pulse uppercase tracking-wider">Loading Live Intel...</span>
          </div>
        )}
        <div className="w-full h-full relative z-20 opacity-0 transition-opacity duration-500" style={{ opacity: isLoaded ? 1 : 0.01 }}>
          <TwitterTimelineEmbed
            sourceType="profile"
            screenName="thestockbloc"
            options={{ height: 500, theme: "dark" }}
            onLoad={() => setIsLoaded(true)}
            noHeader
            noFooter
            noBorders
            transparent
          />
        </div>
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
