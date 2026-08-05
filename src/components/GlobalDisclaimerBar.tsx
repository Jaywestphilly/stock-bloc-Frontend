import React, { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { triggerHaptic } from "../utils/haptics";
import { trackEvent } from "../utils/analytics";

interface GlobalDisclaimerBarProps {
  onOpenDisclaimerModal: () => void;
}

export const GlobalDisclaimerBar: React.FC<GlobalDisclaimerBarProps> = ({ onOpenDisclaimerModal }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("sb_disclaimer_dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleDismiss = () => {
    triggerHaptic("light");
    setIsVisible(false);
    sessionStorage.setItem("sb_disclaimer_dismissed", "true");
  };

  const handleViewDisclaimer = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic("selection");
    trackEvent("disclaimer_viewed");
    onOpenDisclaimerModal();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t-2 border-amber-500/80 p-2 sm:p-3 shadow-[0_-4px_20px_rgba(245,158,11,0.15)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 px-2">
        <div className="flex items-start sm:items-center gap-2 flex-1">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-[10px] sm:text-[11px] font-mono text-amber-100 uppercase tracking-wider leading-relaxed">
            STOCK BLOC is an educational intelligence platform. Nothing on this site is financial advice. Always do your own research.{" "}
            <button 
              type="button"
              onClick={handleViewDisclaimer}
              className="text-amber-400 font-bold hover:text-amber-300 underline underline-offset-2 ml-1"
            >
              See full disclaimer.
            </button>
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded shrink-0 transition-colors"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
