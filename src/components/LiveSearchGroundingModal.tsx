import React, { useState } from "react";
import {
  Search,
  MapPin,
  ExternalLink,
  Sparkles,
  X,
  RefreshCw,
  Globe,
  Navigation,
  Building,
} from "lucide-react";

interface LiveSearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
  onSelectStockSymbol?: (symbol: string) => void;
}

export const LiveSearchGroundingModal: React.FC<
  LiveSearchGroundingModalProps
> = ({ isOpen, onClose, defaultTopic = "", onSelectStockSymbol }) => {
  const [activeMode, setActiveMode] = useState<"search" | "maps">("search");
  const [query, setQuery] = useState(defaultTopic || "");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [textResult, setTextResult] = useState<string | null>(null);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const [places, setPlaces] = useState<{ name: string; url: string }[]>([]);

  if (!isOpen) return null;

  const handleRunSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setTextResult(null);
    setSources([]);
    setPlaces([]);

    try {
      if (activeMode === "search") {
        const res = await fetch("/api/ai/search-grounded", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        setTextResult(data.text);
        setSources(data.sources || []);
      } else {
        const res = await fetch("/api/ai/maps-grounded", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, location }),
        });
        const data = await res.json();
        setTextResult(data.text);
        setPlaces(data.places || []);
      }
    } catch (err) {
      console.error("Grounding search failed:", err);
      setTextResult(
        "Search grounded query failed. Please check network connectivity.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-neutral-950 border border-white/20 rounded-3xl p-6 shadow-2xl relative text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {activeMode === "search" ? (
              <Globe className="w-5 h-5" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
              Grounding Intelligence Engine
            </span>
            <h3 className="text-lg font-black text-white leading-none mt-0.5">
              {activeMode === "search"
                ? "Google Search Real Time Market Intel"
                : "Google Maps Location Intelligence"}
            </h3>
          </div>
        </div>

        {/* Grounding Mode Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveMode("search")}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === "search"
                ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/20"
                : "text-neutral-300 hover:bg-white/5"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Google Search Data</span>
          </button>

          <button
            onClick={() => setActiveMode("maps")}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === "maps"
                ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/20"
                : "text-neutral-300 hover:bg-white/5"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Google Maps Data</span>
          </button>
        </div>

        {/* Search Inputs */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-300">
              {activeMode === "search"
                ? "Real Time Market / Tech Intelligence Topic"
                : "Real Estate / Data Center Search Topic"}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeMode === "search"
                    ? "e.g. SK Hynix HBM3e sales, Fed rate decisions, FICO updates"
                    : "e.g. Equinix data centers, Multifamily REITs, Industrial parks"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {activeMode === "maps" && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300">
                Target Metro / City / Region
              </label>
              <div className="relative">
                <Navigation className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Austin TX, Northern Virginia, Silicon Valley, Dallas"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleRunSearch}
            disabled={!query.trim() || loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20 active:scale-98 transition-all disabled:opacity-40 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Grounding Query with Gemini 3.6...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  Run{" "}
                  {activeMode === "search"
                    ? "Google Search Grounding"
                    : "Google Maps Grounding"}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Results Area */}
        {textResult && (
          <div className="p-4 rounded-2xl bg-white/5 border border-cyan-500/30 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Grounded Intelligence Output</span>
            </div>

            <div className="text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed">
              {textResult}
            </div>

            {/* Sources / Grounding Links */}
            {sources.length > 0 && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Google Search Grounding Sources:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-mono border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      <span className="truncate max-w-[200px]">
                        {src.title}
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Places / Map Links */}
            {places.length > 0 && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Google Maps Places Found:
                </span>
                <div className="flex flex-wrap gap-2">
                  {places.map((place, idx) => (
                    <a
                      key={idx}
                      href={place.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-[11px] font-mono border border-teal-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">
                        {place.name}
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
