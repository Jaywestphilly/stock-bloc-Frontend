import React, { useState, useEffect, useCallback } from "react";
import { StockTicker } from "../types";
import { getTickerSentiment, TickerNewsSentiment } from "../utils/sentiment";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Newspaper,
  RefreshCw,
  ChevronRight,
  Gauge,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GeminiSentimentResult {
  symbol: string;
  score: number; // 0 to 100
  label: "Bullish" | "Bearish" | "Neutral";
  bullishPercent: number;
  bearishPercent: number;
  summary: string;
  keyDrivers: string[];
  analyzedAt: number;
}

// In-memory cache for analyzed stock sentiment to avoid duplicate calls
const geminiSentimentCache: Record<string, GeminiSentimentResult> = {};

interface SentimentGaugeProps {
  stock: StockTicker;
  compact?: boolean;
  onOpenNewsFeed?: () => void;
  className?: string;
}

export const SentimentGauge: React.FC<SentimentGaugeProps> = ({
  stock,
  compact = true,
  onOpenNewsFeed,
  className = "",
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<GeminiSentimentResult | null>(
    geminiSentimentCache[stock.symbol] || null,
  );

  // Local headline sentiment fallback
  const localSentiment: TickerNewsSentiment = getTickerSentiment(
    stock.symbol,
    stock,
  );

  // Active metrics: prefer Gemini result if available, otherwise local headline calculation
  const score = aiResult ? aiResult.score : localSentiment.bullishPercent;
  const label = aiResult ? aiResult.label : localSentiment.overall;
  const bullishPct = aiResult
    ? aiResult.bullishPercent
    : localSentiment.bullishPercent;
  const bearishPct = aiResult
    ? aiResult.bearishPercent
    : localSentiment.bearishPercent;
  const neutralPct = aiResult
    ? 100 - bullishPct - bearishPct
    : localSentiment.neutralPercent;

  const fetchGeminiSentiment = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh && geminiSentimentCache[stock.symbol]) {
        setAiResult(geminiSentimentCache[stock.symbol]);
        return;
      }

      setIsAnalyzing(true);
      try {
        const res = await fetch("/api/ai/sentiment-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbol: stock.symbol,
            name: stock.name,
            headlines: localSentiment.headlines,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const result: GeminiSentimentResult = {
            symbol: stock.symbol,
            score: typeof data.score === "number" ? data.score : 70,
            label: data.label || "Bullish",
            bullishPercent:
              typeof data.bullishPercent === "number"
                ? data.bullishPercent
                : 70,
            bearishPercent:
              typeof data.bearishPercent === "number"
                ? data.bearishPercent
                : 30,
            summary: data.summary || "Headlines parsed by Gemini .",
            keyDrivers: Array.isArray(data.keyDrivers) ? data.keyDrivers : [],
            analyzedAt: Date.now(),
          };
          geminiSentimentCache[stock.symbol] = result;
          setAiResult(result);
        }
      } catch (err) {
        console.error("Failed to fetch Gemini sentiment:", err);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [stock.symbol, stock.name, localSentiment.headlines],
  );

  // Fetch headline sentiment on mount / symbol change
  useEffect(() => {
    if (!geminiSentimentCache[stock.symbol]) {
      fetchGeminiSentiment();
    } else {
      setAiResult(geminiSentimentCache[stock.symbol]);
    }
  }, [stock.symbol, fetchGeminiSentiment]);

  // Styling helpers
  const isBullish = label === "Bullish";
  const isBearish = label === "Bearish";

  const gaugeBg = isBullish
    ? "bg-emerald-950/40"
    : isBearish
      ? "bg-rose-950/40"
      : "bg-amber-950/40";

  if (compact) {
    return (
      <div className={`relative inline-block ${className}`}>
        {/* Compact Sentiment Gauge Button on StockCard */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsPopoverOpen(!isPopoverOpen);
          }}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${gaugeBg} ${
            isBullish
              ? "border-emerald-500/30 hover:border-emerald-400/60 shadow-sm shadow-emerald-950"
              : isBearish
                ? "border-rose-500/30 hover:border-rose-400/60 shadow-sm shadow-rose-950"
                : "border-neutral-700 hover:border-neutral-600"
          }`}
          title={`Gemini News Sentiment Gauge: ${score}% ${label}`}
        >
          {/* Mini Arc Gauge Icon */}
          <div className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 36 36"
              className="w-full h-full transform -rotate-90 overflow-visible"
            >
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#262626"
                strokeWidth="4"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={
                  isBullish ? "#00ff88" : isBearish ? "#ff3b3b" : "#f59e0b"
                }
                strokeWidth="4"
                strokeDasharray={`${score}, 100`}
                className="transition-all duration-700"
              />
            </svg>
          </div>

          {/* Label + Score */}
          <div className="flex items-center gap-1 text-[10px] font-mono font-black tracking-tight">
            <span
              className={
                isBullish
                  ? "text-emerald-400"
                  : isBearish
                    ? "text-rose-400"
                    : "text-amber-300"
              }
            >
              {label.toUpperCase()}
            </span>
            <span className="text-[9px] text-neutral-400 font-bold">
              {score}%
            </span>
            <Sparkles className="w-2.5 h-2.5 text-cyan-400 animate-pulse ml-0.5" />
          </div>
        </button>

        {/* Detailed Sentiment Popover / Dial Gauge */}
        <AnimatePresence>
          {isPopoverOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPopoverOpen(false);
                }}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-8 z-50 w-80 p-4 rounded-2xl bg-neutral-900/95 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl shadow-black/90 space-y-3 text-left text-white"
              >
                {/* Popover Header */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black tracking-wide text-cyan-100">
                      ${stock.symbol} Gemini Sentiment Gauge
                    </span>
                  </div>
                  <button
                    onClick={() => fetchGeminiSentiment(true)}
                    disabled={isAnalyzing}
                    className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-all active:scale-95 disabled:opacity-50"
                    title="Re-analyze with Gemini"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${isAnalyzing ? "animate-spin text-cyan-400" : ""}`}
                    />
                  </button>
                </div>

                {/* Main Visual Dial Meter Component */}
                <div className="relative flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
                  {/* Semi-circle Gauge Meter */}
                  <div className="relative w-40 h-20 overflow-hidden flex items-end justify-center">
                    <svg
                      viewBox="0 0 100 50"
                      className="w-full h-full overflow-visible"
                    >
                      {/* Background Arc Track */}
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#1f2937"
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                      {/* Colored Active Arc Segment */}
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke={
                          isBullish
                            ? "#00ff88"
                            : isBearish
                              ? "#ff3b3b"
                              : "#f59e0b"
                        }
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(score / 100) * 126}, 126`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    {/* Indicator Center Value */}
                    <div className="absolute bottom-0 flex flex-col items-center">
                      <span className="text-xl font-black font-mono tracking-tight text-white">
                        {score}%
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isBullish
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : isBearish
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  </div>

                  {/* Meter Min/Max Labels */}
                  <div className="w-full flex justify-between px-3 text-[9px] font-mono font-bold text-neutral-400 mt-1">
                    <span className="text-rose-400">BEARISH (0%)</span>
                    <span className="text-neutral-500">NEUTRAL (50%)</span>
                    <span className="text-emerald-400">BULLISH (100%)</span>
                  </div>
                </div>

                {/* Gemini Headline Brief Summary */}
                <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Gemini Headline Brief</span>
                  </div>
                  <p className="text-xs text-cyan-100/90 leading-relaxed font-medium">
                    {aiResult?.summary ||
                      `Analyzed ${localSentiment.totalHeadlines} recent market news items for $${stock.symbol}.`}
                  </p>
                </div>

                {/* Key Drivers parsed by Gemini */}
                {aiResult?.keyDrivers && aiResult.keyDrivers.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-neutral-400">
                      Key News Drivers
                    </span>
                    <ul className="space-y-1 text-xs text-neutral-300 font-medium">
                      {aiResult.keyDrivers.map((driver, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-1.5 bg-neutral-950/60 p-1.5 rounded-lg border border-neutral-800/60"
                        >
                          <span className="text-cyan-400 font-black">•</span>
                          <span>{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sample Headlines Parsed */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-neutral-400">
                    Parsed News Headlines ({localSentiment.headlines.length})
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                    {localSentiment.headlines.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-neutral-400 font-medium truncate max-w-[150px]">
                            {item.source}
                          </span>
                          <span
                            className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                              item.sentiment === "Bullish"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : item.sentiment === "Bearish"
                                  ? "bg-rose-500/15 text-rose-400"
                                  : "bg-neutral-500/15 text-neutral-300"
                            }`}
                          >
                            {item.sentiment}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-200 font-medium leading-snug line-clamp-2">
                          {item.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {onOpenNewsFeed && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPopoverOpen(false);
                      onOpenNewsFeed();
                    }}
                    className="w-full py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-98"
                  >
                    <span>View Full News Feed</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Expanded View (For detail modals)
  return (
    <div
      className={`p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-white">
            Gemini Headline Sentiment Gauge
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchGeminiSentiment(true)}
            disabled={isAnalyzing}
            className="p-1 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-bold flex items-center gap-1 transition-all"
          >
            <RefreshCw
              className={`w-3 h-3 ${isAnalyzing ? "animate-spin text-cyan-400" : ""}`}
            />
            <span> Refresh</span>
          </button>
          <span
            className={`font-black text-xs px-2.5 py-0.5 rounded-full border ${
              isBullish
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : isBearish
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
            }`}
          >
            {label} ({score}%)
          </span>
        </div>
      </div>

      {/* Visual Semi-circle Dial & Score */}
      <div className="flex flex-col md:flex-row items-center gap-4 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
        <div className="relative w-36 h-18 overflow-hidden flex items-end justify-center shrink-0">
          <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#262626"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke={isBullish ? "#00ff88" : isBearish ? "#ff3b3b" : "#f59e0b"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 126}, 126`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute bottom-0 flex flex-col items-center">
            <span className="text-lg font-black font-mono text-white">
              {score}%
            </span>
            <span className="text-[9px] font-bold uppercase text-neutral-400">
              {label}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-1.5 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span> News Headline Analysis</span>
          </div>
          <p className="text-xs text-neutral-200 font-medium leading-relaxed">
            {aiResult?.summary ||
              `Calculated from ${localSentiment.totalHeadlines} news headlines in the Stock Bloc intelligence feed.`}
          </p>
        </div>
      </div>

      {/* Breakdown Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden flex items-center">
          <div
            style={{ width: `${bullishPct}%` }}
            className="h-full bg-[#00ff88]"
          />
          <div
            style={{ width: `${neutralPct}%` }}
            className="h-full bg-amber-500"
          />
          <div
            style={{ width: `${bearishPct}%` }}
            className="h-full bg-[#ff3b3b]"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono font-bold">
          <span className="text-emerald-400">Bullish {bullishPct}%</span>
          <span className="text-amber-300">Neutral {neutralPct}%</span>
          <span className="text-rose-400">Bearish {bearishPct}%</span>
        </div>
      </div>
    </div>
  );
};
