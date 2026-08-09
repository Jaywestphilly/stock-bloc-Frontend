import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import { StockTicker, PricePoint } from "../../types";
import { INITIAL_STOCKS } from "../../data/stocks";
import { getTickerSentiment } from "../../utils/sentiment";
import { formatChartTimestamp, formatYAxisTick, calculateCleanYAxisTicks } from "../../utils/chartFormatters";
import {
  Pin,
  Share2,
  Sparkles,
  Zap,
  Trash2,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Maximize2,
  Star,
  Newspaper,
  ExternalLink,
  Loader2,
  DollarSign,
} from "lucide-react";
import { SentimentGauge } from "../../components/SentimentGauge";
import { TrendSentimentVisualizer } from "../../components/TrendSentimentVisualizer";
import { StockAiBriefSection } from "../../components/StockAiBriefSection";
import { computeDeterministicSignal, getStockDataFreshness } from "../../utils/signalCalculator";
import { triggerHaptic } from "../../utils/haptics";
import { useUserStore } from "../../stores/userStore";
import { useMarketStore } from "../../stores/marketStore";
import { getDataAgeText } from "../../utils/timeUtils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface StockCardProps {
  stock: StockTicker;
  index?: number;
  onSelect: (stock: StockTicker) => void;
  onTogglePin: (symbol: string) => void;
  onShare: (stock: StockTicker) => void;
  onAiAnalyze: (stock: StockTicker) => void;
  onOpenNewsFeed?: () => void;
  onOpenBrokerages?: (stock: StockTicker) => void;
  onRemove?: (symbol: string) => void;
  isSyncing?: boolean;
}

// Custom Chart Tooltip for Stock Card Area Chart
const CustomCandleTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PricePoint & { open?: number; close?: number; high?: number; low?: number } }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isUp = (data.close ?? data.price) >= (data.open ?? data.price);
    const displayPrice = data.close ?? data.price;
    return (
      <div className="bg-[#031322]/95 border border-cyan-500/50 rounded-xl p-2.5 text-xs font-mono shadow-xl backdrop-blur-md z-50 text-white space-y-1">
        <div className="flex items-center justify-between gap-3 text-[10px] text-cyan-400 border-b border-cyan-900/60 pb-1 font-bold">
          <span>{data.time}</span>
          <span
            className={
              isUp
                ? "text-emerald-400 font-extrabold"
                : "text-rose-400 font-extrabold"
            }
          >
            {isUp ? "▲ UP" : "▼ DOWN"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
          <span className="text-neutral-400">
            Price:{" "}
            <strong className="text-white">${typeof displayPrice === 'number' ? displayPrice.toFixed(2) : displayPrice}</strong>
          </span>
          {data.volume && (
            <span className="text-neutral-400">
              Vol:{" "}
              <strong className="text-cyan-200">{data.volume.toLocaleString()}</strong>
            </span>
          )}
          {data.high && (
            <span className="text-neutral-400">
              High:{" "}
              <strong className="text-emerald-300">
                ${data.high.toFixed(2)}
              </strong>
            </span>
          )}
          {data.low && (
            <span className="text-neutral-400">
              Low:{" "}
              <strong className="text-rose-300">${data.low.toFixed(2)}</strong>
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Generate OHLC Candlestick data points for inline chart
const generateCandlestickData = (
  stock: StockTicker,
  timeframe: "1D" | "1W" = "1D",
) => {
  const points = stock.history?.[timeframe] || [];
  const targetBars = 24;
  const candles: {
    time: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    isUp: boolean;
  }[] = [];

  if (!points || points.length === 0) {
    const spark =
      stock.sparkline && stock.sparkline.length > 0
        ? stock.sparkline
        : [stock.price * 0.98, stock.price * 1.02];
    for (let i = 0; i < spark.length; i++) {
      const p = spark[i];
      const prev = i > 0 ? spark[i - 1] : p * 0.995;
      const open = prev;
      const close = p;
      const variance = Math.max(0.05, open * 0.003);
      const high = Math.max(open, close) + variance;
      const low = Math.min(open, close) - variance;
      candles.push({
        time: `T${i + 1}`,
        open,
        close,
        high,
        low,
        volume: Math.floor(1000 + ((i * 350) % 5000)),
        isUp: close >= open,
      });
    }
    return candles;
  }

  const chunkSize = Math.max(1, Math.floor(points.length / targetBars));
  for (let i = 0; i < points.length; i += chunkSize) {
    const chunk = points.slice(i, i + chunkSize);
    if (chunk.length === 0) continue;
    let open = chunk[0].price;
    let close = chunk[chunk.length - 1].price;
    const prices = chunk.map((p) => p.price);
    const maxP = Math.max(...prices);
    const minP = Math.min(...prices);

    if (Math.abs(close - open) < open * 0.001) {
      const prevClose =
        candles.length > 0 ? candles[candles.length - 1].close : open * 0.998;
      open = prevClose;
      const delta =
        open * 0.003 * ((i % 2 === 0 ? 1 : -1) + Math.sin(i * 1.3) * 0.4);
      close = open + delta;
    }

    const variance = Math.max(0.08, open * 0.0025);
    const high = Math.max(maxP, open, close) + variance;
    const low = Math.min(minP, open, close) - variance;
    const timeLabel = formatChartTimestamp(chunk[chunk.length - 1].time) || `T-${i + 1}`;

    candles.push({
      time: timeLabel,
      open,
      close,
      high,
      low,
      volume: chunk.reduce((sum, p) => sum + (p.volume || 100), 0),
      isUp: close >= open,
    });
  }

  return candles;
};

interface StockHeadline {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: "bullish" | "bearish" | "neutral";
  url?: string;
}

const fetchHeadlines = async (
  stock: StockTicker,
): Promise<StockHeadline[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (stock.headlines && stock.headlines.length > 0) {
    return stock.headlines.map((item, idx) => ({
      id: `hl-live-${idx}`,
      title: item.title,
      source: item.source || "SB Terminal",
      time: item.time || "Today",
      sentiment: (item.sentiment?.toLowerCase() === "positive" || item.sentiment?.toLowerCase() === "bullish" ? "bullish" : item.sentiment?.toLowerCase() === "negative" || item.sentiment?.toLowerCase() === "bearish" ? "bearish" : "neutral"),
      url: item.url,
    }));
  }

  if (stock.news && stock.news.length > 0) {
    return stock.news.slice(0, 3).map((item, idx) => ({
      id: `news-${idx}`,
      title: item.title,
      source: item.source || "SB Terminal",
      time: item.time || "Today",
      sentiment: (item.sentiment?.toLowerCase() === "positive" || item.sentiment?.toLowerCase() === "bullish" ? "bullish" : item.sentiment?.toLowerCase() === "negative" || item.sentiment?.toLowerCase() === "bearish" ? "bearish" : "neutral"),
      url: item.url,
    }));
  }

  const sentiment = getTickerSentiment(stock.symbol, stock);
  if (sentiment.headlines && sentiment.headlines.length > 0) {
    return sentiment.headlines.slice(0, 3).map((h) => ({
      id: h.id,
      title: h.title,
      source: h.source,
      time: h.timeAgo,
      sentiment: h.sentiment.toLowerCase() as "bullish" | "bearish" | "neutral",
      url: h.url,
    }));
  }

  return [];
};

// Volatility helper
const getStockVolatility = (stk: StockTicker): number => {
  const weekPrices = stk.history?.["1W"]?.map((p) => p.price);
  const prices =
    weekPrices && weekPrices.length >= 2
      ? weekPrices
      : stk.sparkline && stk.sparkline.length >= 2
        ? stk.sparkline
        : [stk.price * 0.98, stk.price * 1.02];

  const min7d = Math.min(...prices, stk.price);
  const max7d = Math.max(...prices, stk.price);
  return ((max7d - min7d) / (min7d || 1)) * 100;
};

// Calculate sector averages statically using INITIAL_STOCKS
const SECTOR_VOLATILITY_AVERAGES = (() => {
  const sectors: Record<string, { total: number; count: number }> = {};
  if (typeof INITIAL_STOCKS !== "undefined" && Array.isArray(INITIAL_STOCKS)) {
    INITIAL_STOCKS.forEach((stk) => {
      const vol = getStockVolatility(stk);
      const cat = stk.category;
      if (!sectors[cat]) {
        sectors[cat] = { total: 0, count: 0 };
      }
      sectors[cat].total += vol;
      sectors[cat].count += 1;
    });
  }

  const averages: Record<string, number> = {};
  Object.keys(sectors).forEach((cat) => {
    averages[cat] = sectors[cat].total / (sectors[cat].count || 1);
  });
  return averages;
})();

export const StockCard: React.FC<StockCardProps> = React.memo(({
  stock,
  index = 0,
  onSelect,
  onTogglePin,
  onShare,
  onAiAnalyze,
  onOpenNewsFeed,
  onOpenBrokerages,
  onRemove,
  isSyncing,
}) => {
  const { marketDataUpdatedAt, marketDataIsStale } = useMarketStore();
  const [dragOffset, setDragOffset] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [priceFlashState, setPriceFlashState] = useState<"up" | "down" | null>(
    null,
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<"1D" | "1W">("1D");
  const [headlines, setHeadlines] = useState<StockHeadline[]>([]);
  const [isLoadingHeadlines, setIsLoadingHeadlines] = useState(false);
  const prevPriceRef = useRef<number>(stock?.price || 0);
  const { starredTickers, toggleStarredTicker } = useUserStore();
  const isStarred = starredTickers.includes(stock.symbol);

  const ROBINHOOD_REFERRAL_URL = "https://join.robinhood.com/jumannc3";

  const handleQuickTradeRobinhood = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("success");
    window.open(ROBINHOOD_REFERRAL_URL, "_blank");
  };

  useEffect(() => {
    if (isExpanded) {
      setIsLoadingHeadlines(true);
      let isMounted = true;
      fetchHeadlines(stock).then((data) => {
        if (isMounted) {
          setHeadlines(data);
          setIsLoadingHeadlines(false);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [isExpanded, stock.symbol]);

  const isPositive = stock.changePercent >= 0;
  const isHighVolatility = Math.abs(stock.changePercent) >= 3;

  // Dynamic Volatility Overlay styling based on stock 7D volatility vs sector average
  const volatilityOverlay = useMemo(() => {
    const stockVol = getStockVolatility(stock);
    const cat = stock.category;
    const sectorAvgVol = SECTOR_VOLATILITY_AVERAGES[cat] || 5;
    const relVol = stockVol / (sectorAvgVol || 1);
    
    let color = "0, 242, 255"; // Default Cyan
    let opacity = 0.05;
    let text = "1.0x (Avg)";
    let textColor = "text-cyan-400/80";
    let glow = "shadow-cyan-500/5";

    if (relVol > 1.3) {
      // Highly Volatile relative to sector (Red/Amber)
      color = "239, 68, 68"; // Rose-red
      opacity = Math.min(0.28, 0.08 + (relVol - 1) * 0.12);
      text = `${relVol.toFixed(1)}x (High)`;
      textColor = "text-rose-400";
      glow = "shadow-rose-500/10";
    } else if (relVol > 1.05) {
      // Slightly Volatile (Amber)
      color = "245, 158, 11"; // Amber
      opacity = Math.min(0.18, 0.06 + (relVol - 1) * 0.1);
      text = `${relVol.toFixed(1)}x (Elevated)`;
      textColor = "text-amber-400";
      glow = "shadow-amber-500/5";
    } else if (relVol < 0.75) {
      // Ultra Stable relative to sector (Emerald)
      color = "16, 185, 129"; // Emerald
      opacity = Math.min(0.25, 0.05 + (1 - relVol) * 0.12);
      text = `${relVol.toFixed(1)}x (Stable)`;
      textColor = "text-emerald-400";
      glow = "shadow-emerald-500/5";
    } else {
      // Normal range
      color = "0, 242, 255"; // Cyan
      opacity = 0.05;
      text = `${relVol.toFixed(1)}x (Normal)`;
      textColor = "text-cyan-400/80";
      glow = "shadow-cyan-500/5";
    }

    return {
      overlayColor: color,
      overlayOpacity: opacity,
      overlayGlow: glow,
      relVolText: text,
      relVolColor: textColor,
      relVolValue: relVol,
    };
  }, [stock]);

  // Compute inline candlestick data for Recharts
  const candleData = useMemo(() => {
    return generateCandlestickData(stock, chartTimeframe);
  }, [stock, chartTimeframe]);

  const { minPrice, maxPrice } = useMemo(() => {
    if (!candleData || candleData.length === 0)
      return { minPrice: 0, maxPrice: 100 };
    const lows = candleData.map((d) => d.low);
    const highs = candleData.map((d) => d.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const pad = (max - min) * 0.08 || 1;
    return {
      minPrice: Math.max(0, min - pad),
      maxPrice: max + pad,
    };
  }, [candleData]);

  const cleanTicks = useMemo(() => {
    return calculateCleanYAxisTicks({
      minVal: minPrice,
      maxVal: maxPrice,
      plotBottom: 150,
      plotHeight: 150,
      targetCount: 4
    }).map(t => t.val);
  }, [minPrice, maxPrice]);

  // Trigger green/red border flash animation and subtle shake on live price updates
  useEffect(() => {
    if (prevPriceRef.current !== stock.price) {
      const isUp = stock.price > prevPriceRef.current;
      const priceDiffPercent =
        Math.abs((stock.price - prevPriceRef.current) / prevPriceRef.current) *
        100;

      setPriceFlashState(isUp ? "up" : "down");
      const flashTimer = setTimeout(() => {
        setPriceFlashState(null);
      }, 1000);

      if (priceDiffPercent >= 3 || isHighVolatility) {
        setIsShaking(true);
        triggerHaptic("warning");
        const shakeTimer = setTimeout(() => setIsShaking(false), 800);
        prevPriceRef.current = stock.price;
        return () => {
          clearTimeout(shakeTimer);
          clearTimeout(flashTimer);
        };
      }

      prevPriceRef.current = stock.price;
      return () => clearTimeout(flashTimer);
    }
  }, [stock.price, stock.changePercent, isHighVolatility]);

  // Lightweight SVG Price Line Chart for 24-hour price trend
  const renderSparkline = () => {
    // Prefer 24h intraday history ('1D'), or fallback to stock.sparkline
    const dayHistoryPrices = stock.history?.["1D"]?.map((p) => p.price);
    const rawData =
      dayHistoryPrices && dayHistoryPrices.length >= 2
        ? dayHistoryPrices
        : stock.sparkline && stock.sparkline.length >= 2
          ? stock.sparkline
          : [];

    if (!rawData || rawData.length < 2) return null;

    const width = 95;
    const height = 32;
    const padY = 4;
    const padX = 4;

    const trendIsPositive = stock.changePercent >= 0;
    const minVal = Math.min(...rawData);
    const maxVal = Math.max(...rawData);
    const range = maxVal - minVal || 1;

    const linePoints = rawData.map((val, idx) => {
      const x =
        padX + (idx / Math.max(1, rawData.length - 1)) * (width - 2 * padX);
      const y =
        height - padY - ((val - minVal) / range) * (height - 2 * padY);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const lineD = `M ${linePoints.join(" L ")}`;
    const areaD = `${lineD} L ${width - padX} ${height - padY} L ${padX} ${height - padY} Z`;
    const lineColor = trendIsPositive ? "#00C805" : "#FF5000";

    return (
      <div
        className="relative w-[95px] h-[32px] flex items-center justify-center overflow-visible shrink-0 group/sparkline cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          triggerHaptic("selection");
          setIsExpanded(!isExpanded);
        }}
        title="24H Price Trend • Tap to expand live chart"
      >
        {/* Dotted 24h Price Baseline */}
        <div className="absolute w-full border-t border-dashed border-cyan-900/60 top-1/2 pointer-events-none z-0" />

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible z-10"
        >
          <defs>
            <linearGradient
              id={`sparkGrad-${stock.symbol}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#sparkGrad-${stock.symbol})`} />
          <path
            d={lineD}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx={padX + (width - 2 * padX)}
            cy={
              height -
              padY -
              ((rawData[rawData.length - 1] - minVal) / range) *
                (height - 2 * padY)
            }
            r="2.5"
            fill={lineColor}
          />
        </svg>
      </div>
    );
  };

  // 7-Day Market Variance & Volatility Range Bar Indicator
  const render7DVariance = () => {
    const weekPrices = stock.history?.["1W"]?.map((p) => p.price);
    const prices =
      weekPrices && weekPrices.length >= 2
        ? weekPrices
        : stock.sparkline && stock.sparkline.length >= 2
          ? stock.sparkline
          : [stock.price * 0.98, stock.price * 1.02];

    const min7d = Math.min(...prices, stock.price);
    const max7d = Math.max(...prices, stock.price);
    const range = max7d - min7d || 1;

    // Position of current price within 7D range (0% to 100%)
    const currentPosPct = Math.min(
      100,
      Math.max(0, ((stock.price - min7d) / range) * 100),
    );

    // 7-day variance spread %
    const variancePct = ((max7d - min7d) / min7d) * 100;

    // Color gradient based on volatility severity
    let barGradient = "from-emerald-500 via-teal-400 to-cyan-400";
    let badgeColor = "text-emerald-300 border-emerald-500/40 bg-emerald-950/70";

    if (variancePct >= 8) {
      barGradient = "from-amber-500 via-rose-500 to-red-500";
      badgeColor = "text-rose-300 border-rose-500/50 bg-rose-950/80";
    } else if (variancePct >= 4) {
      barGradient = "from-emerald-400 via-amber-400 to-amber-500";
      badgeColor = "text-amber-300 border-amber-500/50 bg-amber-950/70";
    }

    return (
      <div
        className="hidden sm:flex flex-col items-center justify-center shrink-0 group/var"
        title={`7-Day Volatility Range: $${min7d.toFixed(2)} $${max7d.toFixed(2)} (±${variancePct.toFixed(1)}% variance spread)`}
      >
        <div className="flex items-center justify-between w-[80px] text-[8px] font-mono font-bold leading-none mb-0.5">
          <span className="text-cyan-400/80 tracking-tighter">7D VAR</span>
          <span
            className={`px-2 py-0.5 border alien-block-cut-sm font-black text-[8px] ${badgeColor}`}
          >
            ±{variancePct.toFixed(1)}%
          </span>
        </div>

        {/* Color-coded 7-Day Variance Range Bar */}
        <div className="relative w-[80px] h-1.5 rounded-full bg-neutral-900 border border-neutral-800 overflow-visible my-0.5">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${barGradient} opacity-85`}
          />

          {/* Position Indicator Pin for current price */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white border border-neutral-900 shadow-md shadow-black transition-all duration-300 z-10"
            style={{ left: `${currentPosPct}%` }}
          />
        </div>

        <div className="flex justify-between w-[80px] text-[7.5px] font-mono text-cyan-500/70 leading-none">
          <span>${min7d < 100 ? min7d.toFixed(1) : Math.round(min7d)}</span>
          <span>${max7d < 100 ? max7d.toFixed(1) : Math.round(max7d)}</span>
        </div>
        <div
          className={`mt-1 text-[7px] font-mono font-bold leading-none tracking-tighter ${volatilityOverlay.relVolColor}`}
          title="Stock volatility multiplier relative to its sector average"
        >
          RelVol: {volatilityOverlay.relVolText}
        </div>
      </div>
    );
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -160 && onRemove) {
      if (stock.isPinned) {
        setIsShaking(true);
        triggerHaptic("warning");
        setTimeout(() => setIsShaking(false), 500);
        setDragOffset(0);
        return;
      }
      // Full swipe-to-delete threshold reached
      triggerHaptic("warning");
      onRemove(stock.symbol);
    } else if (info.offset.x < -40) {
      // Reveal action buttons including red Remove button
      setDragOffset(onRemove ? -210 : -130);
      triggerHaptic("medium");
    } else if (info.offset.x > 50) {
      triggerHaptic("selection");
      onTogglePin(stock.symbol);
      setDragOffset(0);
    } else {
      setDragOffset(0);
    }
  };

  // Determine performance category for dynamic holographic border glow
  const getPerformanceHoloClass = (changePct: number, category?: string) => {
    if (changePct >= 3.0 || category === "tsunami") {
      return "holo-card-surge";
    }
    if (changePct >= 0) {
      return "holo-card-bullish";
    }
    if (changePct >= -1.5) {
      return "holo-card-neutral";
    }
    return "holo-card-bearish";
  };

  const holoGlowClass = getPerformanceHoloClass(
    stock.changePercent,
    stock.category,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, x: -10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.96, x: -20, filter: "blur(4px)" }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.035, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="StockCard relative w-full overflow-hidden my-0.5 select-none group/card-wrapper"
    >
      {/* Sleek Data Stream Edge Accent Beam */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-400 via-teal-400 to-cyan-600/0 opacity-0 group-hover/card-wrapper:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />

      {/* Hidden Swipe Actions Background */}
      <div className="absolute inset-y-0 right-0 flex items-center gap-1.5 pr-2 z-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic("selection");
            onShare(stock);
            setDragOffset(0);
          }}
          className="w-9 h-9 rounded-xl bg-neutral-800 text-neutral-200 flex items-center justify-center hover:bg-neutral-700 active:scale-95 transition-all"
          title="Share Card"
        >
          <Share2 className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic("selection");
            onAiAnalyze(stock);
            setDragOffset(0);
          }}
          className="w-9 h-9 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-900 active:scale-95 transition-all"
          title=" Breakdown"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic("selection");
            onTogglePin(stock.symbol);
            setDragOffset(0);
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all ${
            stock.isPinned
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-neutral-800 text-neutral-300"
          }`}
          title="Pin Stock"
        >
          <Pin className="w-4 h-4" />
        </button>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (stock.isPinned) {
                setIsShaking(true);
                triggerHaptic("warning");
                setTimeout(() => setIsShaking(false), 500);
                return;
              }
              triggerHaptic("warning");
              onRemove(stock.symbol);
              setDragOffset(0);
            }}
            className="h-9 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs border border-rose-400/40 flex items-center gap-1.5 active:scale-95 transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
            title="Remove from Watchlist"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {/* Main Draggable iOS Glass Stock Card Row */}
      <motion.div
        drag="x"
        dragConstraints={{ left: onRemove ? -220 : -130, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        whileHover={{
          scale: 1.01,
          y: -1,
          transition: { type: "spring", stiffness: 500, damping: 18 },
        }}
        whileTap={{
          scale: 0.98,
          transition: { type: "spring", stiffness: 600, damping: 14 },
        }}
        animate={{ x: dragOffset }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        onClick={() => {
          triggerHaptic("light");
          if (stock.isPinned) {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
          }
          if (dragOffset !== 0) {
            setDragOffset(0);
          } else {
            setIsExpanded(!isExpanded);
          }
        }}
        className={`relative z-10 w-full px-4 py-3 alien-block-cut alien-card my-1 transition-all duration-200 cursor-pointer ${holoGlowClass} ${
          stock.isPinned ? "alien-card-active" : ""
        } ${isExpanded ? "border-cyan-400/60 shadow-xl shadow-cyan-950/50" : ""} ${
          isShaking ? "ring-2 ring-amber-400 bg-amber-950/20 animate-shake-card" : ""
        } ${
          priceFlashState === "up"
            ? "price-flash-up"
            : priceFlashState === "down"
              ? "price-flash-down"
              : ""
        } ${isSyncing ? "glitch-border-refresh terminal-refresh-flash" : ""}`}
        style={{
          background: `radial-gradient(circle at 35% 50%, rgba(${volatilityOverlay.overlayColor}, ${volatilityOverlay.overlayOpacity * 1.3}) 0%, rgba(${volatilityOverlay.overlayColor}, 0) 90%), rgba(4, 15, 24, ${0.85 - Math.min(0.4, volatilityOverlay.overlayOpacity * 1.6)})`,
          boxShadow: stock.isPinned
            ? `0 0 25px rgba(${volatilityOverlay.overlayColor}, 0.25), inset 0 0 20px rgba(${volatilityOverlay.overlayColor}, 0.1)`
            : isExpanded
            ? `0 10px 25px -5px rgba(${volatilityOverlay.overlayColor}, 0.15), inset 0 0 15px rgba(${volatilityOverlay.overlayColor}, 0.05)`
            : `0 0 20px rgba(${volatilityOverlay.overlayColor}, 0.08), inset 0 0 15px rgba(${volatilityOverlay.overlayColor}, 0.05)`,
        }}
      >
        {/* Corner HUD Ticks */}
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        <div
          className="flex items-center justify-between w-full font-mono"
        >
          {/* Left Ticker & Subtitle/Shares & News Sentiment */}
          <div className="flex flex-col min-w-[120px] max-w-[160px] pr-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic("selection");
                  toggleStarredTicker(stock.symbol);
                }}
                className={`flex items-center justify-center transition-all ${isStarred ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "text-neutral-600 hover:text-cyan-400"}`}
                title={isStarred ? "Remove from My Bloc" : "Add to My Bloc"}
              >
                <Star className={`w-4 h-4 ${isStarred ? "fill-amber-400" : ""}`} />
              </button>
              <span
                className={`font-black text-base tracking-wider ${isSyncing ? "glitch-text-refresh text-cyan-300" : "text-cyan-100"}`}
              >
                ${stock.symbol}
              </span>
              <TrendSentimentVisualizer stock={stock} />
              {stock.symbol.toUpperCase() === "SPCX" && (
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase alien-block-cut-sm flex items-center gap-1 shadow-md shadow-amber-500/10">
                  <Star className="w-3 h-3 fill-amber-300" />
                  TOP CONVICTION
                </span>
              )}
              {stock.isPinned && stock.symbol.toUpperCase() !== "SPCX" && (
                <span className="w-1.5 h-1.5 bg-cyan-400 animate-ping" />
              )}
              {isHighVolatility && (
                <span
                  title="High Volatility (>3% movement)"
                  className="text-[9px] text-amber-200 font-black bg-amber-950/80 px-2 py-1 border border-amber-400 alien-block-cut-sm glow-amber flex items-center justify-center min-w-[20px]"
                >
                  <Zap className="w-3 h-3 text-amber-300 fill-current" />
                </span>
              )}
              {stock.asymmetryPotentialStars !== undefined && (
                <span
                  title={`Asymmetry Rating: ${stock.asymmetryPotentialStars} Stars (${stock.probabilityOfSuccess || ""} prob)`}
                  className="text-[9px] text-amber-300 font-black bg-amber-950/90 px-2 py-1 border border-amber-500/50 alien-block-cut-sm flex items-center gap-0.5"
                >
                  ★ {stock.asymmetryPotentialStars}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-cyan-400/80 truncate">
              {stock.name}
            </span>
            <div className="mt-1">
              <SentimentGauge stock={stock} onOpenNewsFeed={onOpenNewsFeed} />
            </div>
          </div>

          {/* Center Sparkline Chart & 7-Day Variance Bar */}
          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 px-1">
            {renderSparkline()}
            {render7DVariance()}
          </div>

          {/* Right Price, % Pill & Tap-to-Expand Indicator */}
          <div className="flex flex-col items-end justify-center pl-2 min-w-[95px]">
            <span
              className={`font-mono font-black text-sm tracking-tight ${isSyncing ? "glitch-text-refresh text-cyan-200" : "text-white"}`}
            >
              $
              {stock.price >= 1000
                ? stock.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : stock.price.toFixed(2)}
            </span>
            <div
              className={`min-w-[76px] text-center px-2 py-0.5 mt-1 alien-block-cut-sm font-black text-xs tracking-wider transition-all flex items-center justify-center gap-1 ${
                isPositive
                  ? "bg-emerald-950/90 text-emerald-300 border-2 border-emerald-400 glow-emerald"
                  : "bg-rose-950/90 text-rose-300 border-2 border-rose-500 glow-rose"
              } ${isSyncing ? "glitch-text-refresh" : ""}`}
            >
              <span>
                {isPositive ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[9px] font-mono text-cyan-400/80 font-bold">
              <span>{isExpanded ? "Hide Chart" : "Tap Chart"}</span>
              {isExpanded ? (
                <ChevronUp className="w-3 h-3 text-cyan-300 animate-bounce" />
              ) : (
                <ChevronDown className="w-3 h-3 text-cyan-400" />
              )}
            </div>
          </div>
        </div>

        {/* Tap-to-Expand Inline Recharts Candlestick Chart Preview */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -12 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -12 }}
              transition={{
                height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.25 },
              }}
              className="overflow-hidden border-t border-cyan-500/30 bg-[#020d18]/95 p-3 sm:p-4 space-y-3 rounded-b-xl mt-3 origin-top transform-gpu"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Controls of Inline Live Price Chart Preview */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-900/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {marketDataIsStale ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                          STALE
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                          LIVE
                        </span>
                      )}
                      <span className="text-xs font-black text-cyan-200 tracking-wider uppercase">
                        PRICE CHART
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {chartTimeframe} TREND
                      </span>
                    </div>
                    <p className="text-[10px] text-cyan-400/70 font-mono">
                      As of {getDataAgeText(marketDataUpdatedAt)} • Tap point to inspect price & volume
                    </p>
                  </div>
                </div>

                {/* Timeframe Selector & Full Detail Trigger */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-cyan-900/60">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setChartTimeframe("1D");
                      }}
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all ${
                        chartTimeframe === "1D"
                          ? "bg-cyan-500 text-black shadow"
                          : "text-cyan-400 hover:text-white"
                      }`}
                    >
                      1D
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setChartTimeframe("1W");
                      }}
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all ${
                        chartTimeframe === "1W"
                          ? "bg-cyan-500 text-black shadow"
                          : "text-cyan-400 hover:text-white"
                      }`}
                    >
                      1W
                    </button>
                  </div>

                  <button
                    onClick={handleQuickTradeRobinhood}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-[10px] font-mono flex items-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                    title="Sign up for Robinhood with my link and we'll both pick our own gift stock 🎁 https://join.robinhood.com/jumannc3"
                  >
                    <DollarSign className="w-3 h-3 text-black" />
                    <span>Quick Trade</span>
                    <ExternalLink className="w-2.5 h-2.5 text-black" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic("selection");
                      onSelect(stock);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[10px] font-mono font-black flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Full Analysis</span>
                  </button>
                </div>
              </div>

              {/* Quick Trade Brokerage Action Bar (Robinhood Integrated) */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/90 via-[#031c26] to-emerald-950/90 border border-emerald-500/50 shadow-lg shadow-emerald-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-300 font-black text-xs shrink-0 font-mono">
                    RH
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-emerald-200 uppercase tracking-wide font-mono">
                        QUICK TRADE ${stock.symbol}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-emerald-400 text-black uppercase">
                        ROBINHOOD
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-300/90 font-mono">
                      Sign up for Robinhood with my link and we'll both pick our
                      own gift stock 🎁
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                  <button
                    onClick={handleQuickTradeRobinhood}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                    title="Sign up for Robinhood with my link and we'll both pick our own gift stock 🎁 https://join.robinhood.com/jumannc3"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-black" />
                    <span>Get Gift Stock on Robinhood 🎁</span>
                    <ExternalLink className="w-3 h-3 text-black" />
                  </button>

                  {onOpenBrokerages && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic("selection");
                        onOpenBrokerages(stock);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                      title="View all Brokerage Referral Partners"
                    >
                      <span>More Brokers</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stock Bloc Signal Breakdown & Data Freshness Dashboard */}
              {(() => {
                const sig = computeDeterministicSignal(stock);
                const fresh = getStockDataFreshness(stock.lastUpdatedIso);
                const high52 = stock.high52 || stock.price * 1.15;
                const low52 = stock.low52 || stock.price * 0.85;
                const pct52 = high52 > low52 ? Math.min(100, Math.max(0, Math.round(((stock.price - low52) / (high52 - low52)) * 100))) : 50;

                return (
                  <div className="space-y-2.5 font-mono">
                    {/* Signal Header Pill & Freshness Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#031525] border border-cyan-500/30">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-black text-sm">
                          {sig.score}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-cyan-200 tracking-wider">
                              STOCK BLOC SIGNAL
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase border ${
                              sig.label === "BULLISH"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : sig.label === "BEARISH"
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                  : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            }`}>
                              {sig.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-cyan-400/80">
                            Quant Composite Score · Trend: {sig.trend.detail}
                          </p>
                        </div>
                      </div>

                      {/* Freshness Badge */}
                      <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 ${fresh.badgeClass}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        <span>DATA: {fresh.ageText}</span>
                      </div>
                    </div>

                    {/* 5 Quant Signal Component Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      <div className="p-2 rounded-lg bg-[#04192d] border border-cyan-900/50">
                        <div className="text-[9px] text-cyan-500/80 flex justify-between">
                          <span>MOMENTUM</span>
                          <span className="text-cyan-200 font-bold">+{sig.momentum.points}/25</span>
                        </div>
                        <div className="w-full bg-neutral-800 h-1 rounded mt-1 overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded" style={{ width: `${(sig.momentum.points / 25) * 100}%` }} />
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-[#04192d] border border-cyan-900/50">
                        <div className="text-[9px] text-cyan-500/80 flex justify-between">
                          <span>TREND</span>
                          <span className="text-cyan-200 font-bold">+{sig.trend.points}/25</span>
                        </div>
                        <div className="w-full bg-neutral-800 h-1 rounded mt-1 overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded" style={{ width: `${(sig.trend.points / 25) * 100}%` }} />
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-[#04192d] border border-cyan-900/50">
                        <div className="text-[9px] text-cyan-500/80 flex justify-between">
                          <span>VOLUME</span>
                          <span className="text-cyan-200 font-bold">+{sig.volume.points}/15</span>
                        </div>
                        <div className="w-full bg-neutral-800 h-1 rounded mt-1 overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded" style={{ width: `${(sig.volume.points / 15) * 100}%` }} />
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-[#04192d] border border-cyan-900/50">
                        <div className="text-[9px] text-cyan-500/80 flex justify-between">
                          <span>REL STRENGTH</span>
                          <span className="text-cyan-200 font-bold">+{sig.relativeStrength.points}/20</span>
                        </div>
                        <div className="w-full bg-neutral-800 h-1 rounded mt-1 overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded" style={{ width: `${(sig.relativeStrength.points / 20) * 100}%` }} />
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-[#04192d] border border-cyan-900/50 col-span-2 sm:col-span-1">
                        <div className="text-[9px] text-cyan-500/80 flex justify-between">
                          <span>VOLATILITY</span>
                          <span className="text-cyan-200 font-bold">+{sig.volatility.points}/15</span>
                        </div>
                        <div className="w-full bg-neutral-800 h-1 rounded mt-1 overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded" style={{ width: `${(sig.volatility.points / 15) * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* 52W Position Range & Market Metrics Bar */}
                    <div className="p-2.5 rounded-xl bg-[#041628] border border-cyan-900/50 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-cyan-400/80 font-bold">52-WEEK POSITION ({pct52}th Percentile)</span>
                        <span className="text-neutral-300">Low: ${low52} — High: ${high52}</span>
                      </div>
                      <div className="relative w-full h-2 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 opacity-80" />
                        <div
                          className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-md shadow-black -translate-x-1/2"
                          style={{ left: `${pct52}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* On-Demand AI Intelligence Brief */}
              <StockAiBriefSection stock={stock} />

              {/* Quick Metrics Strip */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono bg-[#041628]/80 p-2 rounded-xl border border-cyan-900/50">
                <div>
                  <span className="text-cyan-500/80 block text-[9px]">
                    52W HIGH
                  </span>
                  <span className="text-emerald-300 font-bold">
                    ${stock.high52}
                  </span>
                </div>
                <div>
                  <span className="text-cyan-500/80 block text-[9px]">
                    52W LOW
                  </span>
                  <span className="text-rose-300 font-bold">
                    ${stock.low52}
                  </span>
                </div>
                <div>
                  <span className="text-cyan-500/80 block text-[9px]">
                    VOLUME
                  </span>
                  <span className="text-cyan-200 font-bold">
                    {stock.volume}
                  </span>
                </div>
                <div>
                  <span className="text-cyan-500/80 block text-[9px]">
                    MKT CAP
                  </span>
                  <span className="text-cyan-200 font-bold">
                    {stock.marketCap}
                  </span>
                </div>
              </div>

              {/* Recharts Area Chart Preview */}
              <div className="w-full h-[150px] pt-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={candleData}
                    margin={{ top: 8, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id={`cardGrad_${stock.symbol}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={isPositive ? "#10b981" : "#f43f5e"}
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor={isPositive ? "#10b981" : "#f43f5e"}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="2 2"
                      stroke="#083344"
                      opacity={0.4}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="#22d3ee"
                      fontSize={9}
                      tickLine={false}
                      axisLine={{ stroke: "#083344" }}
                      tickFormatter={(val) => formatChartTimestamp(val)}
                      interval="preserveStartEnd"
                      minTickGap={25}
                    />
                    <YAxis
                      domain={[minPrice, maxPrice]}
                      ticks={cleanTicks}
                      stroke="#22d3ee"
                      fontSize={9}
                      orientation="right"
                      axisLine={{ stroke: "#083344" }}
                      tickFormatter={(val) => formatYAxisTick(val)}
                    />
                    <Tooltip content={<CustomCandleTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke={isPositive ? "#10b981" : "#f43f5e"}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={`url(#cardGrad_${stock.symbol})`}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Latest Symbol Headlines Section */}
              <div className="pt-2.5 border-t border-cyan-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-cyan-200 uppercase tracking-wider">
                    <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
                    <span>LATEST {stock.symbol} HEADLINES</span>
                  </div>
                  {headlines.length > 0 && (
                    <span className="text-[9px] font-mono text-cyan-400/70 font-semibold uppercase">
                      {headlines.length} NEWS WIRE ALERTS
                    </span>
                  )}
                </div>

                {isLoadingHeadlines ? (
                  <div className="flex items-center justify-center gap-2 py-3 text-xs font-mono text-cyan-400/80 bg-[#041628]/60 rounded-xl border border-cyan-900/40">
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>Fetching live headlines for {stock.symbol}...</span>
                  </div>
                ) : headlines.length > 0 ? (
                  <div className="space-y-1.5">
                    {headlines.map((hl) => (
                      <div
                        key={hl.id}
                        className="p-2 rounded-xl bg-[#041628]/90 hover:bg-[#07213a] border border-cyan-900/40 hover:border-cyan-500/40 transition-all text-xs font-mono space-y-1 group/hl cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hl.url) {
                            window.open(hl.url, '_blank', 'noopener,noreferrer');
                          } else if (onOpenNewsFeed) {
                            onOpenNewsFeed();
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[11px] font-sans font-medium text-neutral-200 group-hover/hl:text-cyan-200 leading-snug line-clamp-2">
                            {hl.title}
                          </p>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0 border ${
                              hl.sentiment === "bullish"
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                                : hl.sentiment === "bearish"
                                  ? "bg-rose-950/80 text-rose-300 border-rose-500/40"
                                  : "bg-cyan-950/80 text-cyan-300 border-cyan-500/40"
                            }`}
                          >
                            {hl.sentiment}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-neutral-400 pt-0.5 border-t border-cyan-950/60">
                          <span className="text-cyan-400/80 font-bold">
                            {hl.source}
                          </span>
                          <div className="flex items-center gap-1 text-neutral-400">
                            <span>{hl.time}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-cyan-400/60 group-hover/hl:text-cyan-300" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-[10px] font-mono text-cyan-400/50 bg-[#041628]/60 rounded-xl border border-cyan-900/40">
                    No recent headlines available.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});
