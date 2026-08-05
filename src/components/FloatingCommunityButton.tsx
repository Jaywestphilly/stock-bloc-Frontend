import React, { useState, useEffect } from "react";
import { MessageSquare, X, Youtube, Share2, ExternalLink, Twitter } from "lucide-react";
import { appendUTM } from "../utils/utm";
import { trackEvent } from "../utils/analytics";
import { triggerHaptic } from "../utils/haptics";

export const FloatingCommunityButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("stockbloc_community_btn_dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Timer to reveal button after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    // Scroll trigger fallback
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("selection");
    sessionStorage.setItem("stockbloc_community_btn_dismissed", "true");
    setIsDismissed(true);
    setIsOpen(false);
  };

  const handleLinkClick = (platform: string, url: string) => {
    triggerHaptic("selection");
    trackEvent("community_joined", { platform, href: url });
    window.open(appendUTM(url, "floating_widget"), "_blank", "noopener,noreferrer");
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 font-mono animate-fadeIn pointer-events-none flex flex-col items-end gap-2">
      {/* Popover options menu */}
      {isOpen && (
        <div className="mb-1 w-64 bg-[#030c16]/95 backdrop-blur-2xl border-2 border-amber-500/50 alien-block-cut p-3 shadow-2xl shadow-amber-950/60 animate-fadeIn space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
            <span className="text-xs font-black font-tech text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              JOIN THE BLOC
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => handleLinkClick("x_twitter", "https://x.com/thestockbloc?s=21")}
              className="w-full py-2 px-3 bg-cyan-950/40 hover:bg-cyan-500/20 border border-cyan-500/40 rounded alien-block-cut-sm flex items-center justify-between text-xs font-bold text-cyan-300 transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-cyan-400" />
                Follow on X (@thestockbloc)
              </span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => handleLinkClick("youtube", "https://youtube.com/@stockbloc")}
              className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-500/20 border border-rose-500/40 rounded alien-block-cut-sm flex items-center justify-between text-xs font-bold text-rose-300 transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-rose-400" />
                Subscribe on YouTube
              </span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => handleLinkClick("linktree", "https://linktr.ee/stockbloc")}
              className="w-full py-2 px-3 bg-emerald-950/40 hover:bg-emerald-500/20 border border-emerald-500/40 rounded alien-block-cut-sm flex items-center justify-between text-xs font-bold text-emerald-300 transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                Follow on Linktree
              </span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}

      
      {/* Trigger Button */}
      <div className="relative group pointer-events-auto">
        <button
          onClick={() => {
            triggerHaptic("selection");
            setIsOpen(!isOpen);
          }}
          className="px-4 h-12 rounded-full bg-amber-400 text-black shadow-xl shadow-amber-500/40 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse border-2 border-amber-200"
          title="Join the Stock Bloc Community"
        >
          <MessageSquare className="w-5 h-5 text-black fill-black/20" />
          <span className="font-black font-tech tracking-wider uppercase text-xs">JOIN THE BLOC</span>
        </button>


        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-black/80 text-amber-300 border border-amber-500/50 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-black transition-colors cursor-pointer shadow-lg"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
