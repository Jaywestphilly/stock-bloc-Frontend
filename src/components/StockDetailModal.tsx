import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { StockTicker, TimeFrame, PaperTrade } from "../types";
import { getTickerSentiment } from "../utils/sentiment";
import { formatChartTimestamp, calculateCleanYAxisTicks } from "../utils/chartFormatters";
import {
  X,
  Sparkles,
  Share2,
  Pin,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Zap,
  Briefcase,
  Calculator,
  Plus,
  Trash2,
  Check,
  DollarSign,
  PieChart as PieChartIcon,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Terminal,
  Activity,
  Building2,
  Landmark,
  Users,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  BarChart3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Calendar,
  Clock,
  Bell,
  BellRing,
  Target,
  ThumbsUp,
  Award,
  RotateCw,
  AlertTriangle,
  Loader2,
  Newspaper,
  PenTool,
  LineChart,
} from "lucide-react";
import { SentimentIndicator } from "./SentimentIndicator";
import { triggerHaptic } from "../utils/haptics";
import { getInstitutionalDataForStock } from "../utils/institutionalHelper";

const PIE_COLORS = [
  "#10b981",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#3b82f6",
  "#14b8a6",
  "#f43f5e",
  "#a855f7",
  "#84cc16",
];

// Relative Strength Index (RSI 14) Calculation Helper
const calculateRSI = (
  priceList: number[],
  period = 14,
): { rsi: number; status: "Oversold" | "Neutral" | "Overbought" } => {
  if (!priceList || priceList.length < 2) {
    return { rsi: 50, status: "Neutral" };
  }

  const effectivePeriod = Math.min(period, priceList.length - 1);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= effectivePeriod; i++) {
    const diff = priceList[i] - priceList[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / effectivePeriod;
  let avgLoss = losses / effectivePeriod;

  for (let i = effectivePeriod + 1; i < priceList.length; i++) {
    const diff = priceList[i] - priceList[i - 1];
    const currentGain = diff >= 0 ? diff : 0;
    const currentLoss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (effectivePeriod - 1) + currentGain) / effectivePeriod;
    avgLoss = (avgLoss * (effectivePeriod - 1) + currentLoss) / effectivePeriod;
  }

  let currentRSI = 50;
  if (avgGain === 0 && avgLoss === 0) {
    currentRSI = 50;
  } else if (avgLoss === 0) {
    currentRSI = 100;
  } else {
    const rs = avgGain / avgLoss;
    currentRSI = 100 - 100 / (1 + rs);
  }

  const finalRSI = Math.min(100, Math.max(0, Math.round(currentRSI * 10) / 10));
  let status: "Oversold" | "Neutral" | "Overbought" = "Neutral";
  if (finalRSI >= 70) status = "Overbought";
  else if (finalRSI <= 30) status = "Oversold";

  return { rsi: finalRSI, status };
};

interface StockDetailModalProps {
  stock: StockTicker | null;
  onClose: () => void;
  onTogglePin: (symbol: string) => void;
  onShare: (stock: StockTicker) => void;
  onOpenBloombergTerminal?: (stock: StockTicker) => void;
  onOpenBrokerages?: (stock: StockTicker) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  onClose,
  onTogglePin,
  onShare,
  onOpenBloombergTerminal,
  onOpenBrokerages,
}) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("1D");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Preserve stock during exit animation
  const [displayStock, setDisplayStock] = useState<StockTicker | null>(stock);

  useEffect(() => {
    if (stock) {
      setDisplayStock(stock);
    }
  }, [stock]);

  const activeStock = stock || displayStock;

  // Candlestick Pinch-to-Zoom & Pan & Engine State
  const [chartMode, setChartMode] = useState<"candle" | "line">("candle"); // 'candle' (TradingView) vs 'line' (Robinhood)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 1.0x to 5.0x
  const [panOffset, setPanOffset] = useState<number>(0.0); // 0.0 (left) to 1.0 (right)
  const [showSMA, setShowSMA] = useState<boolean>(true); // 50-Day SMA Line Overlay toggle
  const [showVWAP, setShowVWAP] = useState<boolean>(true); // Volume-Weighted Average Price (VWAP) Overlay toggle
  const [showRSI, setShowRSI] = useState<boolean>(true); // Relative Strength Index (RSI 14) toggle
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1.0);
  const isDraggingPanRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartPanRef = useRef<number>(0);

  // Interactive Trendline Drawing State
  const [isTrendlineActive, setIsTrendlineActive] = useState<boolean>(false);
  const [isDrawingTrendline, setIsDrawingTrendline] = useState<boolean>(false);
  const [trendline, setTrendline] = useState<{
    x1: number;
    y1: number;
    price1: number;
    time1: string;
    index1: number;
    x2: number;
    y2: number;
    price2: number;
    time2: string;
    index2: number;
  } | null>(null);

  // Reset zoom, pan, and trendline when stock or timeframe changes
  useEffect(() => {
    setZoomLevel(1.0);
    setPanOffset(0.0);
    setTrendline(null);
  }, [stock?.symbol, timeframe]);

  // Paper Trading & Portfolio Tracker State
  const [paperTrades, setPaperTrades] = useState<PaperTrade[]>([]);
  const [showPaperForm, setShowPaperForm] = useState(true);
  const [sharesInput, setSharesInput] = useState<number>(10);
  const [entryPriceInput, setEntryPriceInput] = useState<number>(
    stock?.price || 0,
  );
  const [tradeType, setTradeType] = useState<"BUY" | "SHORT">("BUY");
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState<string | null>(null);

  // Institutional Ownership & Smart Money State
  const [showAllInstitutionalHolders, setShowAllInstitutionalHolders] =
    useState(false);

  // Institutional Data Calculation
  const institutionalData = useMemo(() => {
    return stock ? getInstitutionalDataForStock(stock) : null;
  }, [stock]);

  // Earnings Countdown & Calendar Alert State
  const [earningsReminder, setEarningsReminder] = useState<boolean>(false);
  const [showEarningsHistory, setShowEarningsHistory] =
    useState<boolean>(false);
  const [showAnalystFirms, setShowAnalystFirms] = useState<boolean>(false);

  useEffect(() => {
    if (!stock) return;
    try {
      const saved = localStorage.getItem("stockbloc_earnings_reminders");
      if (saved) {
        const list = JSON.parse(saved);
        setEarningsReminder(Array.isArray(list) && list.includes(stock.symbol));
      }
    } catch (e) {
      console.error("Failed to load earnings reminders:", e);
    }
  }, [stock?.symbol]);

  const handleToggleEarningsReminder = () => {
    if (!stock) return;
    triggerHaptic("success");
    const nextState = !earningsReminder;
    setEarningsReminder(nextState);
    try {
      const saved = localStorage.getItem("stockbloc_earnings_reminders");
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (nextState) {
        if (!list.includes(stock.symbol)) list.push(stock.symbol);
      } else {
        list = list.filter((s) => s !== stock.symbol);
      }
      localStorage.setItem(
        "stockbloc_earnings_reminders",
        JSON.stringify(list),
      );
    } catch (e) {
      console.error("Failed to save earnings reminder:", e);
    }
  };

  // Determine if stock is a Private/Pre-IPO Vehicle (e.g., SpaceX / SPCX is treated as public)
  const isPrivateCompany = useMemo(() => {
    if (!stock) return false;
    const sym = stock.symbol.toUpperCase();
    if (sym === "SPCX") return false;
    const desc = (stock.description || "").toLowerCase();
    const name = (stock.name || "").toLowerCase();
    return (
      desc.includes("private") ||
      desc.includes("pre-ipo") ||
      name.includes("openai") ||
      name.includes("anthropic") ||
      name.includes("stripe") ||
      name.includes("databricks") ||
      name.includes("bytedance")
    );
  }, [stock]);

  // Retrieve news headlines using getTickerSentiment or stock payload
  const tickerHeadlines = useMemo(() => {
    if (!stock) return [];
    const sym = stock.symbol.toUpperCase();
    const isPrivate =
      sym === "OPENAI" ||
      sym === "STRIPE" ||
      sym === "ANTHROPIC" ||
      sym === "DATABRICKS" ||
      sym === "BYTEDANCE";

    const defaultUrl = isPrivate
      ? `https://techcrunch.com/tag/${sym.toLowerCase()}/`
      : `https://finance.yahoo.com/quote/${sym}`;

    if (stock.headlines && stock.headlines.length > 0) {
      return stock.headlines.map((h, i) => ({
        id: `h-${i}`,
        title: h.title,
        source: h.source || "Market Wire",
        timeAgo: h.time || "Recent",
        sentiment: h.sentiment || "Bullish",
        url: h.url || defaultUrl,
      }));
    }
    if (stock.news && stock.news.length > 0) {
      return stock.news.map((n, i) => ({
        id: `n-${i}`,
        title: n.title,
        source: n.source || "Market Wire",
        timeAgo: n.time || "Recent",
        sentiment: n.sentiment || "Bullish",
        url: n.url || defaultUrl,
      }));
    }
    const sentimentObj = getTickerSentiment(stock.symbol, stock);
    return (sentimentObj.headlines || []).map((hl) => ({
      ...hl,
      url: hl.url || defaultUrl,
    }));
  }, [stock]);



  // Calculate Analyst Consensus Rating distribution & Price Targets
  const analystConsensusData = useMemo(() => {
    if (!stock) return null;
    const symbol = stock.symbol;
    let charSum = 0;
    for (let i = 0; i < symbol.length; i++) {
      charSum += symbol.charCodeAt(i);
    }

    const currentPrice = stock.price || 100;
    const totalAnalysts = 18 + (charSum % 22); // e.g. 18 to 39 analysts

    // Bias rating based on changePercent or charSum
    const isBullish = (stock.changePercent || 0) >= -1;
    let strongBuyRatio = isBullish
      ? 0.38 + (charSum % 12) * 0.01
      : 0.22 + (charSum % 10) * 0.01;
    let buyRatio = isBullish
      ? 0.38 + (charSum % 10) * 0.01
      : 0.3 + (charSum % 12) * 0.01;
    let holdRatio = 0.16 + (charSum % 8) * 0.01;
    let sellRatio = 0.04 + (charSum % 4) * 0.01;
    let strongSellRatio = Math.max(
      0,
      1 - (strongBuyRatio + buyRatio + holdRatio + sellRatio),
    );

    // Normalize ratios
    const sumRatio =
      strongBuyRatio + buyRatio + holdRatio + sellRatio + strongSellRatio;
    strongBuyRatio /= sumRatio;
    buyRatio /= sumRatio;
    holdRatio /= sumRatio;
    sellRatio /= sumRatio;
    strongSellRatio /= sumRatio;

    const strongBuyCount = Math.round(totalAnalysts * strongBuyRatio);
    const buyCount = Math.round(totalAnalysts * buyRatio);
    const holdCount = Math.round(totalAnalysts * holdRatio);
    const sellCount = Math.round(totalAnalysts * sellRatio);
    const strongSellCount = Math.max(
      0,
      totalAnalysts - (strongBuyCount + buyCount + holdCount + sellCount),
    );

    // Score on 1.0 5.0 scale
    const scoreSum =
      strongBuyCount * 5 +
      buyCount * 4 +
      holdCount * 3 +
      sellCount * 2 +
      strongSellCount * 1;
    const consensusScore = scoreSum / totalAnalysts;

    let consensusLabel: string = stock.rating || "N/A";
    let labelBadgeColor =
      "text-emerald-300 bg-emerald-500/20 border-emerald-500/30";

    const normalizedLabel = consensusLabel.toLowerCase();
    if (normalizedLabel.includes("strong buy")) {
      labelBadgeColor =
        "text-emerald-300 bg-emerald-500/20 border-emerald-400/80 shadow-md shadow-emerald-500/20 font-black";
    } else if (normalizedLabel.includes("buy") || normalizedLabel.includes("outperform")) {
      labelBadgeColor =
        "text-emerald-300 bg-emerald-500/20 border-emerald-500/30 font-extrabold";
    } else if (normalizedLabel.includes("hold") || normalizedLabel.includes("neutral")) {
      labelBadgeColor =
        "text-amber-300 bg-amber-500/20 border-amber-500/30 font-extrabold";
    } else if (normalizedLabel.includes("moderate sell")) {
      labelBadgeColor =
        "text-orange-300 bg-orange-500/20 border-orange-500/30 font-extrabold";
    } else if (normalizedLabel.includes("sell")) {
      labelBadgeColor =
        "text-rose-300 bg-rose-500/20 border-rose-500/30 font-extrabold";
    } else {
      labelBadgeColor = "text-neutral-300 bg-neutral-500/20 border-neutral-500/30";
    }

    // Target Prices
    const avgPriceTarget = stock.targetPrice || currentPrice;
    const highPriceTarget = stock.targetPrice ? Math.round(stock.targetPrice * 1.15 * 100) / 100 : currentPrice;
    const lowPriceTarget = stock.targetPrice ? Math.round(stock.targetPrice * 0.85 * 100) / 100 : currentPrice;
    const upsidePercent = (
      ((avgPriceTarget - currentPrice) / currentPrice) *
      100
    ).toFixed(1);

    const strongBuyPct = Math.round((strongBuyCount / totalAnalysts) * 100);
    const buyPct = Math.round((buyCount / totalAnalysts) * 100);
    const holdPct = Math.round((holdCount / totalAnalysts) * 100);
    const sellPct = Math.round((sellCount / totalAnalysts) * 100);
    const strongSellPct = Math.round((strongSellCount / totalAnalysts) * 100);

    const firms = [
      {
        name: "Goldman Sachs",
        analyst: "Mark Delaney",
        rating: "Buy",
        target: (avgPriceTarget * 1.05).toFixed(2),
        action: "Maintains",
        date: "2d ago",
      },
      {
        name: "Morgan Stanley",
        analyst: "Adam Jonas",
        rating: "Overweight",
        target: (highPriceTarget * 0.98).toFixed(2),
        action: "Raises Target",
        date: "4d ago",
      },
      {
        name: "J.P. Morgan",
        analyst: "Doug Anmuth",
        rating: "Buy",
        target: (avgPriceTarget * 1.02).toFixed(2),
        action: "Reaffirms",
        date: "1w ago",
      },
      {
        name: "Bank of America",
        analyst: "Vivien Zhao",
        rating: "Neutral",
        target: (avgPriceTarget * 0.93).toFixed(2),
        action: "Maintains",
        date: "2w ago",
      },
      {
        name: "Evercore ISI",
        analyst: "Mark Mahaney",
        rating: "Outperform",
        target: highPriceTarget.toFixed(2),
        action: "Raises Target",
        date: "3w ago",
      },
    ];

    return {
      totalAnalysts,
      consensusLabel,
      consensusScore: consensusScore.toFixed(2),
      labelBadgeColor,
      strongBuyCount,
      buyCount,
      holdCount,
      sellCount,
      strongSellCount,
      strongBuyPct,
      buyPct,
      holdPct,
      sellPct,
      strongSellPct,
      avgPriceTarget,
      highPriceTarget,
      lowPriceTarget,
      upsidePercent,
      currentPrice,
      firms,
    };
  }, [stock]);

  // Load paper trades from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("stockbloc_paper_trades");
      if (stored) {
        setPaperTrades(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load paper trades:", e);
    }
  }, []);

  // Update entry price input when stock price changes or modal opens
  useEffect(() => {
    if (stock) {
      setEntryPriceInput(stock.price);
    }
  }, [stock?.price, stock?.symbol]);

  const symbolPaperTrades = stock
    ? paperTrades.filter((pt) => pt.symbol === stock.symbol)
    : [];

  // Calculate portfolio aggregates across all paper trades
  const portfolioAggregates = useMemo(() => {
    if (!paperTrades || paperTrades.length === 0) {
      return {
        totalEquity: 0,
        totalCost: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        totalPositions: 0,
        distribution: [],
      };
    }

    const symbolMap: Record<
      string,
      {
        symbol: string;
        name: string;
        shares: number;
        cost: number;
        currentValue: number;
      }
    > = {};

    paperTrades.forEach((pt) => {
      const curPrice =
        stock && pt.symbol === stock.symbol ? stock.price : pt.entryPrice;
      const cost = pt.shares * pt.entryPrice;
      const val = pt.shares * curPrice;

      if (!symbolMap[pt.symbol]) {
        symbolMap[pt.symbol] = {
          symbol: pt.symbol,
          name: pt.name || pt.symbol,
          shares: 0,
          cost: 0,
          currentValue: 0,
        };
      }

      symbolMap[pt.symbol].shares += pt.shares;
      symbolMap[pt.symbol].cost += cost;
      symbolMap[pt.symbol].currentValue += val;
    });

    const symbolList = Object.values(symbolMap);
    const totalEquity = symbolList.reduce(
      (acc, item) => acc + item.currentValue,
      0,
    );
    const totalCost = symbolList.reduce((acc, item) => acc + item.cost, 0);
    const totalGainLoss = totalEquity - totalCost;
    const totalGainLossPercent =
      totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    const distribution = symbolList.map((item, idx) => {
      const allocationPercent =
        totalEquity > 0 ? (item.currentValue / totalEquity) * 100 : 0;
      const gainLoss = item.currentValue - item.cost;
      return {
        name: item.symbol,
        fullName: item.name,
        value: item.currentValue,
        shares: item.shares,
        cost: item.cost,
        gainLoss,
        allocationPercent,
        color: PIE_COLORS[idx % PIE_COLORS.length],
      };
    });

    return {
      totalEquity,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      totalPositions: paperTrades.length,
      distribution,
    };
  }, [paperTrades, stock?.price, stock?.symbol]);

  const handleExecutePaperTrade = () => {
    if (!stock || sharesInput <= 0 || entryPriceInput <= 0) {
      triggerHaptic("error");
      return;
    }

    const newTrade: PaperTrade = {
      id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      symbol: stock.symbol,
      name: stock.name,
      shares: Number(sharesInput),
      entryPrice: Number(entryPriceInput),
      entryDate: new Date().toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      type: tradeType,
    };

    const updated = [newTrade, ...paperTrades];
    setPaperTrades(updated);
    try {
      localStorage.setItem("stockbloc_paper_trades", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save paper trade:", e);
    }

    triggerHaptic("success");
    setTradeSuccessMsg(
      `Virtual ${tradeType} position saved for ${sharesInput} shares of ${stock.symbol}!`,
    );
    setTimeout(() => {
      setTradeSuccessMsg(null);
      setShowPaperForm(false);
    }, 2000);
  };

  const handleClosePosition = (tradeId: string) => {
    triggerHaptic("heavy");
    const updated = paperTrades.filter((t) => t.id !== tradeId);
    setPaperTrades(updated);
    try {
      localStorage.setItem("stockbloc_paper_trades", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to update paper trades:", e);
    }
  };

  // Real Market Historical Chart State
  const [realHistory, setRealHistory] = useState<
    { time: string; price: number }[] | null
  >(null);

  useEffect(() => {
    if (!stock) return;
    let isMounted = true;
    fetch(`/api/stock-chart/${stock.symbol}?range=${timeframe}`)
      .then((res) => res.json())
      .then((data) => {
        if (
          isMounted &&
          data &&
          Array.isArray(data.points) &&
          data.points.length > 0
        ) {
          setRealHistory(data.points);
        }
      })
      .catch((err) => console.warn("Real chart fetch error:", err));

    return () => {
      isMounted = false;
    };
  }, [stock?.symbol, timeframe]);

  // Historical Benchmark Comparison Overlay State
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [benchmarkSymbol, setBenchmarkSymbol] = useState<"SPY" | "QQQ" | "DIA">(
    "SPY",
  );
  const [benchmarkHistory, setBenchmarkHistory] = useState<
    { time: string; price: number }[] | null
  >(null);

  useEffect(() => {
    if (!showOverlay || !stock) return;
    let isMounted = true;

    fetch(`/api/stock-chart/${benchmarkSymbol}?range=${timeframe}`)
      .then((res) => res.json())
      .then((data) => {
        if (
          isMounted &&
          data &&
          Array.isArray(data.points) &&
          data.points.length > 0
        ) {
          setBenchmarkHistory(data.points);
        } else if (isMounted) {
          const base =
            benchmarkSymbol === "SPY"
              ? 595
              : benchmarkSymbol === "QQQ"
                ? 518
                : 440;
          const hist = stock.history?.[timeframe] || [];
          const fallbackPts = hist.map((pt, i) => ({
            time: pt.time,
            price:
              base *
              (1 +
                (i / Math.max(1, hist.length - 1)) * 0.012 +
                Math.sin(i / 1.5) * 0.002),
          }));
          setBenchmarkHistory(fallbackPts);
        }
      })
      .catch((err) => {
        console.warn("Benchmark chart fetch error:", err);
        if (isMounted && stock) {
          const base =
            benchmarkSymbol === "SPY"
              ? 595
              : benchmarkSymbol === "QQQ"
                ? 518
                : 440;
          const hist = stock.history?.[timeframe] || [];
          const fallbackPts = hist.map((pt, i) => ({
            time: pt.time,
            price:
              base *
              (1 +
                (i / Math.max(1, hist.length - 1)) * 0.012 +
                Math.sin(i / 1.5) * 0.002),
          }));
          setBenchmarkHistory(fallbackPts);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [showOverlay, benchmarkSymbol, timeframe, stock?.symbol, stock?.history]);

  // Calculate Relative Strength Index (RSI 14)
  const rsiData = useMemo(() => {
    if (!stock) return [];
    const hist =
      realHistory && realHistory.length > 0
        ? realHistory
        : stock.history?.[timeframe] || [];
    let priceList = hist.map((p) => p.price);
    if (!priceList || priceList.length < 2) {
      if (stock.sparkline && stock.sparkline.length > 1) {
        priceList = stock.sparkline;
      } else {
        const base = stock.price;
        const delta = stock.change;
        priceList = [
          base - delta * 1.2,
          base - delta * 0.8,
          base - delta * 0.4,
          base,
        ];
      }
    }
    return calculateRSI(priceList, 14);
  }, [
    realHistory,
    stock?.history,
    stock?.price,
    stock?.change,
    stock?.sparkline,
    timeframe,
  ]);

  // Generate Full Candlestick OHLC Data from history points (Heikin Ashi)
  const fullCandleOHLCData = useMemo(() => {
    if (!stock) return [];
    const hist =
      realHistory && realHistory.length > 0
        ? realHistory
        : stock.history?.[timeframe] || [];
    if (!hist || hist.length === 0) return [];

    let standardCandles: any[] = [];

    // Check if hist items already contain full OHLC properties
    const hasFullOHLC = hist.every(
      (p: any) =>
        p.open !== undefined && p.high !== undefined && p.low !== undefined,
    );

    if (hasFullOHLC) {
      standardCandles = hist.map((p: any, i: number) => {
        const open = Number(p.open ?? p.price);
        const close = Number(p.close ?? p.price);
        const high = Math.max(Number(p.high ?? p.price), open, close);
        const low = Math.min(Number(p.low ?? p.price), open, close);
        return {
          open,
          high,
          low,
          close,
          volume: p.volume || 10000,
          time: p.time ? formatChartTimestamp(p.time) : `T-${i}`,
          isUp: close >= open,
          changePercent: open > 0 ? ((close - open) / open) * 100 : 0,
        };
      });
    } else {
      const targetCandles = 32;
      const chunkSize = Math.max(1, Math.floor(hist.length / targetCandles));

      for (let i = 0; i < hist.length; i += chunkSize) {
        const chunk = hist.slice(i, i + chunkSize);
        if (chunk.length === 0) continue;

        let open = chunk[0].price;
        let close = chunk[chunk.length - 1].price;
        const chunkPrices = chunk.map((p) => p.price);
        const maxP = Math.max(...chunkPrices, open, close);
        const minP = Math.min(...chunkPrices, open, close);

        if (Math.abs(close - open) < open * 0.0015) {
          const prevClose =
            standardCandles.length > 0
              ? standardCandles[standardCandles.length - 1].close
              : open * 0.998;
          open = prevClose;
          const delta =
            open * 0.003 * ((i % 2 === 0 ? 1 : -1) + Math.sin(i * 1.5) * 0.4);
          close = open + delta;
        }

        const bodyMax = Math.max(open, close);
        const bodyMin = Math.min(open, close);
        const bodyHeight = bodyMax - bodyMin;
        const wickPadding = Math.max(open * 0.001, bodyHeight * 0.25);

        const high = Math.max(
          maxP,
          bodyMax + wickPadding * (0.8 + Math.abs(Math.sin(i * 1.7)) * 0.4),
        );
        const low = Math.min(
          minP,
          bodyMin - wickPadding * (0.8 + Math.abs(Math.cos(i * 1.9)) * 0.4),
        );
        const time = formatChartTimestamp(chunk[chunk.length - 1].time) || `T-${i}`;
        const volume = chunk.reduce((sum, p) => sum + (p.volume || 10000), 0);

        standardCandles.push({
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume,
          time,
          isUp: close >= open,
          changePercent: open > 0 ? ((close - open) / open) * 100 : 0,
        });
      }
    }

    // Convert to Heikin Ashi
    let prevHAOpen = standardCandles[0]?.open ?? 0;
    let prevHAClose = standardCandles[0]?.close ?? 0;

    return standardCandles.map((c, idx) => {
      const haClose = (c.open + c.high + c.low + c.close) / 4;

      let haOpen;
      if (idx === 0) {
        haOpen = (c.open + c.close) / 2;
      } else {
        haOpen = (prevHAOpen + prevHAClose) / 2;
      }

      const haHigh = Math.max(c.high, haOpen, haClose);
      const haLow = Math.min(c.low, haOpen, haClose);

      prevHAOpen = haOpen;
      prevHAClose = haClose;

      return {
        ...c,
        open: Number(haOpen.toFixed(2)),
        high: Number(haHigh.toFixed(2)),
        low: Number(haLow.toFixed(2)),
        close: Number(haClose.toFixed(2)),
        isUp: haClose >= haOpen,
        changePercent: haOpen > 0 ? ((haClose - haOpen) / haOpen) * 100 : 0,
      };
    });
  }, [realHistory, stock?.history, timeframe]);

  // Compute visible zoomed subset of candles based on zoomLevel and panOffset
  const candleOHLCData = useMemo(() => {
    if (fullCandleOHLCData.length === 0) return [];
    if (zoomLevel <= 1.01) return fullCandleOHLCData;

    const visibleCount = Math.max(
      5,
      Math.round(fullCandleOHLCData.length / zoomLevel),
    );
    const maxStartIndex = fullCandleOHLCData.length - visibleCount;
    const startIndex = Math.min(
      maxStartIndex,
      Math.max(0, Math.round(panOffset * maxStartIndex)),
    );

    return fullCandleOHLCData.slice(startIndex, startIndex + visibleCount);
  }, [fullCandleOHLCData, zoomLevel, panOffset]);

  // Calculate 50-period Simple Moving Average (SMA) on full Candle OHLC series
  const fullSmaValues = useMemo(() => {
    if (fullCandleOHLCData.length === 0) return [];
    const smaPeriod = 50;
    return fullCandleOHLCData.map((_, idx) => {
      const windowSize = Math.min(idx + 1, smaPeriod);
      const slice = fullCandleOHLCData.slice(
        Math.max(0, idx - windowSize + 1),
        idx + 1,
      );
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / slice.length;
    });
  }, [fullCandleOHLCData]);

  // Compute visible zoomed subset of 50 SMA values
  const visibleSmaValues = useMemo(() => {
    if (fullCandleOHLCData.length === 0 || fullSmaValues.length === 0)
      return [];
    if (zoomLevel <= 1.01) return fullSmaValues;

    const visibleCount = Math.max(
      5,
      Math.round(fullCandleOHLCData.length / zoomLevel),
    );
    const maxStartIndex = fullCandleOHLCData.length - visibleCount;
    const startIndex = Math.min(
      maxStartIndex,
      Math.max(0, Math.round(panOffset * maxStartIndex)),
    );

    return fullSmaValues.slice(startIndex, startIndex + visibleCount);
  }, [fullCandleOHLCData, fullSmaValues, zoomLevel, panOffset]);

  // Calculate Volume-Weighted Average Price (VWAP) on full Candle OHLC series
  const fullVwapValues = useMemo(() => {
    if (fullCandleOHLCData.length === 0) return [];
    let cumTPV = 0;
    let cumVol = 0;
    return fullCandleOHLCData.map((c) => {
      const tp = (c.high + c.low + c.close) / 3;
      const vol =
        c.volume ||
        Math.max(
          1000,
          Math.round(((c.high - c.low) / (c.open || 1) + 0.001) * 1000000),
        );
      cumTPV += tp * vol;
      cumVol += vol;
      return cumTPV / (cumVol || 1);
    });
  }, [fullCandleOHLCData]);

  // Compute visible zoomed subset of VWAP values
  const visibleVwapValues = useMemo(() => {
    if (fullCandleOHLCData.length === 0 || fullVwapValues.length === 0)
      return [];
    if (zoomLevel <= 1.01) return fullVwapValues;

    const visibleCount = Math.max(
      5,
      Math.round(fullCandleOHLCData.length / zoomLevel),
    );
    const maxStartIndex = fullCandleOHLCData.length - visibleCount;
    const startIndex = Math.min(
      maxStartIndex,
      Math.max(0, Math.round(panOffset * maxStartIndex)),
    );

    return fullVwapValues.slice(startIndex, startIndex + visibleCount);
  }, [fullCandleOHLCData, fullVwapValues, zoomLevel, panOffset]);

  // Calculate MACD (12, 26, 9) on fullCandleOHLCData
  const fullMacdData = useMemo(() => {
    if (fullCandleOHLCData.length === 0) return [];
    const closes = fullCandleOHLCData.map((c) => c.close);

    const calcEMA = (data: number[], period: number) => {
      const k = 2 / (period + 1);
      const emaArr: number[] = [];
      let prevEma = data[0] || 0;
      emaArr.push(prevEma);
      for (let i = 1; i < data.length; i++) {
        const curEma = data[i] * k + prevEma * (1 - k);
        emaArr.push(curEma);
        prevEma = curEma;
      }
      return emaArr;
    };

    const ema12 = calcEMA(closes, 12);
    const ema26 = calcEMA(closes, 26);

    const macdLine = closes.map((_, i) => ema12[i] - ema26[i]);
    const signalLine = calcEMA(macdLine, 9);
    const histogram = macdLine.map((m, i) => m - signalLine[i]);

    return fullCandleOHLCData.map((c, i) => ({
      macd: macdLine[i],
      signal: signalLine[i],
      histogram: histogram[i],
      time: c.time,
    }));
  }, [fullCandleOHLCData]);

  // Compute visible zoomed subset of MACD values
  const macdData = useMemo(() => {
    if (fullCandleOHLCData.length === 0 || fullMacdData.length === 0) return [];
    if (zoomLevel <= 1.01) return fullMacdData;

    const visibleCount = Math.max(
      5,
      Math.round(fullCandleOHLCData.length / zoomLevel),
    );
    const maxStartIndex = fullCandleOHLCData.length - visibleCount;
    const startIndex = Math.min(
      maxStartIndex,
      Math.max(0, Math.round(panOffset * maxStartIndex)),
    );

    return fullMacdData.slice(startIndex, startIndex + visibleCount);
  }, [fullCandleOHLCData, fullMacdData, zoomLevel, panOffset]);

  // Calculate Relative Strength Index (RSI 14) series on fullCandleOHLCData
  const fullRsiValues = useMemo(() => {
    if (fullCandleOHLCData.length === 0) return [];
    const period = 14;
    const closes = fullCandleOHLCData.map((c) => c.close);
    if (closes.length < 2) return closes.map(() => 50);

    const rsiValues: number[] = new Array(closes.length).fill(50);

    let gainSum = 0;
    let lossSum = 0;

    const initialWindow = Math.min(period, closes.length - 1);
    for (let i = 1; i <= initialWindow; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gainSum += diff;
      else lossSum += Math.abs(diff);
    }

    let avgGain = gainSum / Math.max(1, initialWindow);
    let avgLoss = lossSum / Math.max(1, initialWindow);

    if (avgLoss === 0) {
      rsiValues[initialWindow] = avgGain === 0 ? 50 : 100;
    } else {
      const rs = avgGain / avgLoss;
      rsiValues[initialWindow] = Math.round((100 - 100 / (1 + rs)) * 10) / 10;
    }

    for (let i = initialWindow + 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      const gain = diff >= 0 ? diff : 0;
      const loss = diff < 0 ? Math.abs(diff) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      if (avgLoss === 0) {
        rsiValues[i] = avgGain === 0 ? 50 : 100;
      } else {
        const rs = avgGain / avgLoss;
        rsiValues[i] = Math.round((100 - 100 / (1 + rs)) * 10) / 10;
      }
    }

    // Backfill early points smoothly
    for (let i = 0; i < initialWindow; i++) {
      rsiValues[i] = rsiValues[initialWindow];
    }

    return rsiValues;
  }, [fullCandleOHLCData]);

  // Compute visible zoomed subset of RSI values
  const visibleRsiValues = useMemo(() => {
    if (fullCandleOHLCData.length === 0 || fullRsiValues.length === 0)
      return [];
    if (zoomLevel <= 1.01) return fullRsiValues;

    const visibleCount = Math.max(
      5,
      Math.round(fullCandleOHLCData.length / zoomLevel),
    );
    const maxStartIndex = fullCandleOHLCData.length - visibleCount;
    const startIndex = Math.min(
      maxStartIndex,
      Math.max(0, Math.round(panOffset * maxStartIndex)),
    );

    return fullRsiValues.slice(startIndex, startIndex + visibleCount);
  }, [fullCandleOHLCData, fullRsiValues, zoomLevel, panOffset]);

  // Helper to map pointer events to SVG stage & candle data for trendline drawing
  const getChartCoords = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    stageElem: HTMLDivElement,
  ) => {
    const rect = stageElem.getBoundingClientRect();
    const clientX =
      "touches" in e
        ? (e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0)
        : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e
        ? (e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY ?? 0)
        : (e as React.MouseEvent).clientY;

    const rawX = Math.max(
      0,
      Math.min(
        plotWidth,
        ((clientX - rect.left) / Math.max(1, rect.width)) * svgWidth,
      ),
    );
    const rawY = Math.max(
      0,
      Math.min(
        svgHeight,
        ((clientY - rect.top) / Math.max(1, rect.height)) * svgHeight,
      ),
    );

    const totalCandles = candleOHLCData.length;
    const idx =
      totalCandles > 0
        ? Math.min(
            totalCandles - 1,
            Math.max(0, Math.round((rawX / plotWidth) * (totalCandles - 1))),
          )
        : 0;
    const candle = candleOHLCData[idx];

    const calcPrice =
      minVal + ((plotBottom - rawY) / Math.max(1, plotHeight)) * valRange;
    const price = candle ? candle.close : calcPrice;
    const time = candle ? candle.time : `Bar ${idx + 1}`;

    const snappedX =
      totalCandles > 1 ? (idx / (totalCandles - 1)) * plotWidth : rawX;
    const snappedY =
      plotBottom - ((price - minVal) / Math.max(0.001, valRange)) * plotHeight;

    return { x: snappedX, y: snappedY, price, time, index: idx };
  };

  const startTrendline = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    stageElem: HTMLDivElement,
  ) => {
    const coords = getChartCoords(e, stageElem);
    setIsDrawingTrendline(true);
    setTrendline({
      x1: coords.x,
      y1: coords.y,
      price1: coords.price,
      time1: coords.time,
      index1: coords.index,
      x2: coords.x,
      y2: coords.y,
      price2: coords.price,
      time2: coords.time,
      index2: coords.index,
    });
    triggerHaptic("medium");
  };

  const updateTrendline = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    stageElem: HTMLDivElement,
  ) => {
    if (!isDrawingTrendline) return;
    const coords = getChartCoords(e, stageElem);
    setTrendline((prev) =>
      prev
        ? {
            ...prev,
            x2: coords.x,
            y2: coords.y,
            price2: coords.price,
            time2: coords.time,
            index2: coords.index,
          }
        : null,
    );
  };

  const finishTrendline = () => {
    if (isDrawingTrendline) {
      setIsDrawingTrendline(false);
      triggerHaptic("selection");
    }
  };

  // Trendline Slope & Metrics Calculation
  const trendlineMetrics = useMemo(() => {
    if (!trendline) return null;
    const priceDiff = trendline.price2 - trendline.price1;
    const percentChange =
      trendline.price1 !== 0
        ? (priceDiff / Math.abs(trendline.price1)) * 100
        : 0;
    const barDiff = trendline.index2 - trendline.index1;
    const absBars = Math.abs(barDiff);

    const priceSlopePerBar = barDiff !== 0 ? priceDiff / barDiff : priceDiff;
    const percentSlopePerBar =
      barDiff !== 0 ? percentChange / barDiff : percentChange;

    const dx = trendline.x2 - trendline.x1;
    const dy = trendline.y2 - trendline.y1;
    const angleRad = Math.atan2(-dy, dx);
    const angleDeg = angleRad * (180 / Math.PI);

    const isBullish = priceDiff >= 0;

    return {
      priceDiff,
      percentChange,
      barDiff,
      absBars,
      priceSlopePerBar,
      percentSlopePerBar,
      angleDeg,
      isBullish,
    };
  }, [trendline]);

  // Touch Pinch-to-Zoom & Pan & Trendline Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isTrendlineActive && e.touches.length === 1) {
      startTrendline(e, e.currentTarget);
      return;
    }
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoomLevel;
    } else if (e.touches.length === 1 && zoomLevel > 1.05) {
      isDraggingPanRef.current = true;
      dragStartXRef.current = e.touches[0].clientX;
      dragStartPanRef.current = panOffset;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isTrendlineActive && isDrawingTrendline && e.touches.length === 1) {
      updateTrendline(e, e.currentTarget);
      return;
    }
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(
        t1.clientX - t2.clientX,
        t1.clientY - t2.clientY,
      );
      if (touchStartDistRef.current > 0) {
        const scale = currentDist / touchStartDistRef.current;
        const rawZoom = touchStartZoomRef.current * scale;
        const newZoom = Math.min(
          5.0,
          Math.max(1.0, Number(rawZoom.toFixed(2))),
        );
        setZoomLevel(newZoom);
      }
    } else if (
      e.touches.length === 1 &&
      isDraggingPanRef.current &&
      zoomLevel > 1.05
    ) {
      const dx = e.touches[0].clientX - dragStartXRef.current;
      const panDelta = -dx / 250;
      const newPan = Math.min(
        1.0,
        Math.max(0.0, dragStartPanRef.current + panDelta),
      );
      setPanOffset(Number(newPan.toFixed(3)));
    }
  };

  const handleTouchEnd = () => {
    if (isTrendlineActive && isDrawingTrendline) {
      finishTrendline();
    }
    touchStartDistRef.current = null;
    isDraggingPanRef.current = false;
  };

  // Wheel / Scroll Zoom Handler
  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) > 5) {
      const zoomDelta = e.deltaY < 0 ? 0.25 : -0.25;
      const newZoom = Math.min(
        5.0,
        Math.max(1.0, Number((zoomLevel + zoomDelta).toFixed(2))),
      );
      setZoomLevel(newZoom);
      if (newZoom === 1.0) {
        setPanOffset(0.0);
      }
    }
  };

  // Mouse Drag to Pan or Draw Trendline
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTrendlineActive) {
      startTrendline(e, e.currentTarget);
      return;
    }
    if (zoomLevel > 1.05) {
      isDraggingPanRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartPanRef.current = panOffset;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTrendlineActive && isDrawingTrendline) {
      updateTrendline(e, e.currentTarget);
      return;
    }
    if (isDraggingPanRef.current && zoomLevel > 1.05) {
      const dx = e.clientX - dragStartXRef.current;
      const panDelta = -dx / 300;
      const newPan = Math.min(
        1.0,
        Math.max(0.0, dragStartPanRef.current + panDelta),
      );
      setPanOffset(Number(newPan.toFixed(3)));
    }
  };

  const handleMouseUp = () => {
    if (isTrendlineActive && isDrawingTrendline) {
      finishTrendline();
    }
    isDraggingPanRef.current = false;
  };

  useEffect(() => {
    setAiAnalysis(null);
  }, [stock?.symbol]);

  const history =
    realHistory && realHistory.length > 0
      ? realHistory
      : stock?.history?.[timeframe] || [];
  const isPositive = (stock?.changePercent || 0) >= 0;

  // Calculate high & low in selected timeframe
  const prices = history.map((p) => p.price);
  const minPrice =
    prices.length > 0 ? Math.min(...prices) : (stock?.price || 100) * 0.98;
  const maxPrice =
    prices.length > 0 ? Math.max(...prices) : (stock?.price || 100) * 1.02;
  const priceRange = maxPrice - minPrice || 1;

  // Benchmark details map
  const BENCHMARK_CONFIGS = {
    SPY: {
      name: "S&P 500 Index ETF",
      color: "#38bdf8",
      badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    },
    QQQ: {
      name: "Nasdaq-100 Tech ETF",
      color: "#c084fc",
      badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
    DIA: {
      name: "Dow Jones Industrial ETF",
      color: "#f59e0b",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
  };

  const activeBenchmark = BENCHMARK_CONFIGS[benchmarkSymbol];

  // Percentage returns for overlay mode
  const stockBasePrice = history[0]?.price || stock?.price || 100;
  const stockReturns = history.map(
    (pt) => ((pt.price - stockBasePrice) / (stockBasePrice || 1)) * 100,
  );

  const benchHistoryPoints =
    benchmarkHistory && benchmarkHistory.length > 0
      ? benchmarkHistory
      : history;
  const benchBasePrice = benchHistoryPoints[0]?.price || 1;
  const benchReturns = benchHistoryPoints.map(
    (pt) => ((pt.price - benchBasePrice) / (benchBasePrice || 1)) * 100,
  );

  // Generate SVG Stage Dimensions for TradingView & Robinhood Engine
  const svgWidth = 600;
  const svgHeight = 280;
  const rightMargin = 65;
  const plotWidth = svgWidth - rightMargin; // 535px active price plot width
  const plotTop = 15;
  const plotBottom = 215;
  const plotHeight = plotBottom - plotTop; // 200px price height

  // Bounds & SVG Scaling
  let minVal = minPrice;
  let maxVal = maxPrice;
  let valRange = priceRange;

  let zeroY = plotBottom;
  let benchmarkPathD = "";

  if (showOverlay) {
    const combinedReturns = [...stockReturns, ...benchReturns];
    minVal = Math.min(...combinedReturns) - 0.5;
    maxVal = Math.max(...combinedReturns) + 0.5;
    valRange = maxVal - minVal || 1;

    // Zero % baseline
    zeroY = plotBottom - ((0 - minVal) / valRange) * plotHeight;

    // Benchmark Path
    benchmarkPathD = benchReturns
      .map((ret, idx) => {
        const x = (idx / Math.max(1, benchReturns.length - 1)) * plotWidth;
        const y = plotBottom - ((ret - minVal) / valRange) * plotHeight;
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }

  // Recalculate price bounds for Candlesticks if not in overlay mode
  const candleAllPrices = candleOHLCData.flatMap((c) => [
    c.open,
    c.close,
    c.high,
    c.low,
  ]);
  if (candleAllPrices.length > 0 && !showOverlay) {
    let minP = Math.min(...candleAllPrices);
    let maxP = Math.max(...candleAllPrices);
    if (showSMA && visibleSmaValues.length > 0) {
      minP = Math.min(minP, ...visibleSmaValues);
      maxP = Math.max(maxP, ...visibleSmaValues);
    }
    if (showVWAP && visibleVwapValues.length > 0) {
      minP = Math.min(minP, ...visibleVwapValues);
      maxP = Math.max(maxP, ...visibleVwapValues);
    }
    const padding = (maxP - minP) * 0.05 || minP * 0.01;
    minVal = minP - padding;
    maxVal = maxP + padding;
    valRange = maxVal - minVal || 1;
  }

  const activeCandle =
    hoverIndex !== null && candleOHLCData[hoverIndex]
      ? candleOHLCData[hoverIndex]
      : candleOHLCData[candleOHLCData.length - 1] || {
          open: stock?.price || 0,
          high: stock?.price || 0,
          low: stock?.price || 0,
          close: stock?.price || 0,
          time: "Now",
          isUp: (stock?.changePercent || 0) >= 0,
          changePercent: stock?.changePercent || 0,
          volume: 10000,
        };

  const activeSma =
    hoverIndex !== null && visibleSmaValues[hoverIndex] !== undefined
      ? visibleSmaValues[hoverIndex]
      : visibleSmaValues[visibleSmaValues.length - 1] || activeCandle.close;

  const activeVwap =
    hoverIndex !== null && visibleVwapValues[hoverIndex] !== undefined
      ? visibleVwapValues[hoverIndex]
      : visibleVwapValues[visibleVwapValues.length - 1] || activeCandle.close;

  const activeMacd =
    hoverIndex !== null && macdData[hoverIndex] !== undefined
      ? macdData[hoverIndex]
      : macdData[macdData.length - 1] || {
          macd: 0,
          signal: 0,
          histogram: 0,
          time: "Now",
        };

  const activeRsi =
    hoverIndex !== null && visibleRsiValues[hoverIndex] !== undefined
      ? visibleRsiValues[hoverIndex]
      : (visibleRsiValues[visibleRsiValues.length - 1] ?? rsiData.rsi ?? 50);

  const activeRsiStatus = useMemo(() => {
    if (activeRsi >= 70)
      return {
        label: "Overbought",
        color: "text-amber-300 bg-amber-500/20 border-amber-500/40",
      };
    if (activeRsi <= 30)
      return {
        label: "Oversold",
        color: "text-emerald-300 bg-emerald-500/20 border-emerald-500/40",
      };
    return {
      label: "Neutral",
      color: "text-cyan-300 bg-cyan-500/20 border-cyan-500/30",
    };
  }, [activeRsi]);

  const macdStatus = useMemo(() => {
    if (!activeMacd)
      return {
        label: "Neutral",
        status: "Neutral",
        color: "text-cyan-300 bg-cyan-500/20 border-cyan-500/30",
      };
    const { macd, signal, histogram } = activeMacd;
    if (histogram > 0 && macd > signal) {
      return {
        label: "Bullish Momentum",
        status: "Bullish",
        color: "text-emerald-300 bg-emerald-500/20 border-emerald-500/40",
      };
    } else if (histogram < 0 && macd < signal) {
      return {
        label: "Bearish Momentum",
        status: "Bearish",
        color: "text-rose-300 bg-rose-500/20 border-rose-500/40",
      };
    } else if (histogram >= 0) {
      return {
        label: "Bullish Crossover",
        status: "Bullish",
        color: "text-emerald-300 bg-emerald-500/20 border-emerald-500/30",
      };
    } else {
      return {
        label: "Bearish Crossover",
        status: "Bearish",
        color: "text-amber-300 bg-amber-500/20 border-amber-500/30",
      };
    }
  }, [activeMacd]);

  const hoveredPoint = {
    price: activeCandle.close,
    time: activeCandle.time,
  };

  // Maximum Volume for volume histogram
  const maxVolume = useMemo(() => {
    if (candleOHLCData.length === 0) return 10000;
    return Math.max(...candleOHLCData.map((c) => c.volume || 1000), 1000);
  }, [candleOHLCData]);

  // Y-Axis Price Ticks with strict step-rounding and clean intervals
  const yAxisTicks = useMemo(() => {
    return calculateCleanYAxisTicks({
      minVal,
      maxVal,
      plotBottom,
      plotHeight,
      targetCount: 5,
      isPercent: showOverlay,
    });
  }, [minVal, maxVal, plotBottom, plotHeight, showOverlay]);

  // Smooth Robinhood Line Path & Area Path
  const linePathD = useMemo(() => {
    if (candleOHLCData.length === 0) return "";
    return candleOHLCData
      .map((c, idx) => {
        const x = (idx / Math.max(1, candleOHLCData.length - 1)) * plotWidth;
        const y = plotBottom - ((c.close - minVal) / valRange) * plotHeight;
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }, [candleOHLCData, minVal, valRange, plotWidth, plotBottom, plotHeight]);

  const areaPathD = useMemo(() => {
    if (candleOHLCData.length === 0) return "";
    return `${linePathD} L ${plotWidth.toFixed(2)} ${plotBottom} L 0 ${plotBottom} Z`;
  }, [linePathD, plotWidth, plotBottom]);

  // 50-Day SMA Overlay SVG Path
  const smaPathD =
    showSMA && visibleSmaValues.length > 0
      ? visibleSmaValues
          .map((sma, idx) => {
            const x =
              (idx / Math.max(1, visibleSmaValues.length - 1)) * plotWidth;
            const y = plotBottom - ((sma - minVal) / valRange) * plotHeight;
            return `${idx === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
          })
          .join(" ")
      : "";

  // Volume-Weighted Average Price (VWAP) Overlay SVG Path
  const vwapPathD =
    showVWAP && visibleVwapValues.length > 0
      ? visibleVwapValues
          .map((vwap, idx) => {
            const x =
              (idx / Math.max(1, visibleVwapValues.length - 1)) * plotWidth;
            const y = plotBottom - ((vwap - minVal) / valRange) * plotHeight;
            return `${idx === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
          })
          .join(" ")
      : "";

  // MACD Chart dimensions & path generation
  const macdSvgHeight = 110;
  const macdMaxAbs = useMemo(() => {
    if (macdData.length === 0) return 0.01;
    let maxVal = 0.01;
    macdData.forEach((d) => {
      maxVal = Math.max(
        maxVal,
        Math.abs(d.macd),
        Math.abs(d.signal),
        Math.abs(d.histogram),
      );
    });
    return maxVal * 1.15;
  }, [macdData]);

  const macdY0 = macdSvgHeight / 2;
  const getMacdY = (val: number) => macdY0 - (val / macdMaxAbs) * (macdY0 - 14);

  const macdLinePath = useMemo(() => {
    if (macdData.length === 0) return "";
    return macdData
      .map((d, i) => {
        const x = (i / Math.max(1, macdData.length - 1)) * plotWidth;
        const y = getMacdY(d.macd);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }, [macdData, macdMaxAbs, plotWidth, macdY0]);

  const macdSignalPath = useMemo(() => {
    if (macdData.length === 0) return "";
    return macdData
      .map((d, i) => {
        const x = (i / Math.max(1, macdData.length - 1)) * plotWidth;
        const y = getMacdY(d.signal);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }, [macdData, macdMaxAbs, plotWidth, macdY0]);

  // X-Axis Time Ticks for main price stage (Exactly 4 evenly-spaced ticks)
  const timeTicks = useMemo(() => {
    if (candleOHLCData.length === 0) return [];
    const count = Math.min(4, candleOHLCData.length);
    const ticks = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(
        (i / Math.max(1, count - 1)) * (candleOHLCData.length - 1),
      );
      const item = candleOHLCData[idx];
      if (item) {
        const x = (idx / Math.max(1, candleOHLCData.length - 1)) * plotWidth;
        ticks.push({ x, label: formatChartTimestamp(item.time), idx });
      }
    }
    return ticks;
  }, [candleOHLCData, plotWidth]);

  // Synchronized Hover scrubber for subcharts
  const handleSubchartHover = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    elem: HTMLDivElement,
  ) => {
    const rect = elem.getBoundingClientRect();
    const clientX =
      "touches" in e && e.touches.length > 0
        ? e.touches[0].clientX
        : (e as React.MouseEvent).clientX;
    const rawX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const normalizedX = (rawX / Math.max(1, rect.width)) * svgWidth;
    const totalCandles = candleOHLCData.length;
    if (totalCandles > 0) {
      const idx = Math.min(
        totalCandles - 1,
        Math.max(0, Math.round((normalizedX / plotWidth) * (totalCandles - 1))),
      );
      setHoverIndex(idx);
    }
  };

  // RSI Chart dimensions & path generation
  const rsiSvgHeight = 110;
  const getRsiY = (val: number) =>
    rsiSvgHeight -
    12 -
    (Math.min(100, Math.max(0, val)) / 100) * (rsiSvgHeight - 24);

  const rsiLinePath =
    visibleRsiValues.length > 0
      ? visibleRsiValues
          .map((val, idx) => {
            const x =
              (idx / Math.max(1, visibleRsiValues.length - 1)) * plotWidth;
            const y = getRsiY(val);
            return `${idx === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
          })
          .join(" ")
      : "";

  const pathD = history
    .map((pt, idx) => {
      const x = (idx / Math.max(1, history.length - 1)) * svgWidth;
      const value = showOverlay ? stockReturns[idx] : pt.price;
      const y =
        svgHeight - ((value - minVal) / valRange) * (svgHeight - 40) - 20;
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const areaD = `${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  // Active hover overlay calculations
  const activeHoverIdx = hoverIndex !== null ? hoverIndex : history.length - 1;
  const hoveredStockReturn = stockReturns[activeHoverIdx] || 0;
  const hoveredBenchReturn =
    benchReturns[Math.min(activeHoverIdx, benchReturns.length - 1)] || 0;
  const hoveredAlpha = hoveredStockReturn - hoveredBenchReturn;

  // Fetch Analysis from server
  const fetchAiAnalysis = async () => {
    if (!stock) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/stock-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          changePercent: stock.changePercent,
          category: stock.category,
          description: stock.description,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP status ${res.status}`);
      }

      const data = await res.json();
      if (data && data.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        throw new Error("No analysis text returned from server.");
      }
    } catch (err: any) {
      console.error("Stock Analysis Error:", err);
      setAiError(
        err?.message ||
          "Unable to fetch live Stock Bloc breakdown. Please check network connection.",
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    setAiAnalysis(null);
    setAiError(null);
  }, [stock?.symbol]);

  return (
    <AnimatePresence>
      {stock && activeStock && (
        <motion.div
          key="stock-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl"
        >
          <motion.div
            key="stock-modal-content"
            initial={{ opacity: 0, y: "100%", scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "100%", scale: 0.98 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 320,
              mass: 0.85,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl relative text-white flex flex-col"
          >
            {/* Mobile Sheet Pull Handle Bar */}
            <div className="sm:hidden w-full flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-12 h-1.5 bg-neutral-700/80 rounded-full" />
            </div>
            {/* Top Bar Navigation */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-neutral-950/90 backdrop-blur-2xl border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-cyan-400">
                  {stock.symbol.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">
                    {stock.symbol}
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    {stock.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    triggerHaptic("success");
                    window.open(
                      "https://join.robinhood.com/jumannc3",
                      "_blank",
                    );
                  }}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                  title="Sign up for Robinhood with my link and we'll both pick our own gift stock 🎁 https://join.robinhood.com/jumannc3"
                >
                  <DollarSign className="w-3.5 h-3.5 text-black" />
                  <span>Trade on Robinhood 🎁</span>
                </button>
                {onOpenBloombergTerminal && (
                  <button
                    onClick={() => onOpenBloombergTerminal(stock)}
                    className="px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="Open in SB Terminal"
                  >
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Terminal</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    triggerHaptic("selection");
                    setShowPaperForm(!showPaperForm);
                  }}
                  className="px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-500/10"
                  title="Portfolio Position Tracker & P/L Calculator"
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Portfolio Tracker</span>
                </button>
                <button
                  onClick={() => onShare(stock)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-cyan-400 transition-all active:scale-95"
                  title="Share Card"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    triggerHaptic("selection");
                    onTogglePin(stock.symbol);
                  }}
                  className={`p-2 rounded-full border transition-all active:scale-95 ${
                    stock.isPinned
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                  }`}
                  title="Pin Ticker"
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Price & Change Header */}
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-4xl font-black tracking-tight font-mono text-white">
                    $
                    {hoveredPoint.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`flex items-center font-bold text-sm ${isPositive ? "text-[#00ff88]" : "text-[#ff3b3b]"}`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {isPositive ? "+" : ""}
                      {stock.change.toFixed(2)} (
                      {stock.changePercent.toFixed(2)}%)
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">
                      Today
                    </span>
                    {hoverIndex !== null && (
                      <span className="text-xs text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        {hoveredPoint.time}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 justify-end max-w-[200px]">
                  {stock.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* PORTFOLIO POSITION TRACKER & P/L CALCULATOR */}
              {(showPaperForm || paperTrades.length > 0) && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-neutral-900 to-teal-950/50 border border-emerald-500/30 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                        <Calculator className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white">
                            Portfolio Position Tracker
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                            {stock.symbol}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-sans">
                          Calculate live position market value, cost basis, and
                          unrealized gain/loss ($ & %)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        setShowPaperForm(!showPaperForm);
                      }}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                    >
                      {showPaperForm
                        ? "Hide Calculator"
                        : "+ Tracker Calculator"}
                    </button>
                  </div>

                  {/* Portfolio Tracker & P/L Calculator Controls */}
                  {showPaperForm &&
                    (() => {
                      const currentShares = Math.max(0, sharesInput || 0);
                      const costBasis = Math.max(0, entryPriceInput || 0);
                      const totalCurrentValue = currentShares * stock.price;
                      const totalCostBasis = currentShares * costBasis;
                      const unrealizedPLDollar =
                        tradeType === "BUY"
                          ? totalCurrentValue - totalCostBasis
                          : totalCostBasis - totalCurrentValue;
                      const unrealizedPLPercent =
                        totalCostBasis > 0
                          ? (unrealizedPLDollar / totalCostBasis) * 100
                          : 0;
                      const isProfitable = unrealizedPLDollar >= 0;
                      const dailyPL = currentShares * stock.change;

                      return (
                        <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/20 space-y-4">
                          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                            <span className="font-extrabold text-white flex items-center gap-1.5">
                              <Activity className="w-4 h-4 text-emerald-400" />{" "}
                              Live Position P/L Metrics
                            </span>
                            {tradeSuccessMsg && (
                              <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                                <Check className="w-3.5 h-3.5" />{" "}
                                {tradeSuccessMsg}
                              </span>
                            )}
                          </div>

                          {/* Real time Calculated P/L Output Cards */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            {/* Current Position Value */}
                            <div className="p-3 rounded-xl bg-neutral-950 border border-white/10 space-y-1">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                                Total Value
                              </span>
                              <span className="text-sm sm:text-base font-black font-mono text-white block">
                                $
                                {totalCurrentValue.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                              <span className="text-[9px] text-neutral-500 font-mono block truncate">
                                {currentShares} sh @ ${stock.price.toFixed(2)}
                              </span>
                            </div>

                            {/* Cost Basis */}
                            <div className="p-3 rounded-xl bg-neutral-950 border border-white/10 space-y-1">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                                Cost Basis
                              </span>
                              <span className="text-sm sm:text-base font-black font-mono text-neutral-300 block">
                                $
                                {totalCostBasis.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                              <span className="text-[9px] text-neutral-500 font-mono block truncate">
                                Avg ${costBasis.toFixed(2)} / sh
                              </span>
                            </div>

                            {/* Unrealized P/L */}
                            <div
                              className={`p-3 rounded-xl bg-neutral-950 border space-y-1 ${
                                isProfitable
                                  ? "border-emerald-500/40 bg-emerald-950/20"
                                  : "border-rose-500/40 bg-rose-950/20"
                              }`}
                            >
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                                Unrealized P/L
                              </span>
                              <span
                                className={`text-sm sm:text-base font-black font-mono flex items-center gap-0.5 ${
                                  isProfitable
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {isProfitable ? "+" : ""}$
                                {unrealizedPLDollar.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold block ${
                                  isProfitable
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {isProfitable ? "+" : ""}
                                {unrealizedPLPercent.toFixed(2)}%
                              </span>
                            </div>

                            {/* Today's Return */}
                            <div className="p-3 rounded-xl bg-neutral-950 border border-white/10 space-y-1">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                                Today's P/L
                              </span>
                              <span
                                className={`text-sm sm:text-base font-black font-mono block ${
                                  dailyPL >= 0
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {dailyPL >= 0 ? "+" : ""}$
                                {dailyPL.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                              <span className="text-[9px] text-neutral-500 font-mono block truncate">
                                {stock.changePercent >= 0 ? "+" : ""}
                                {stock.changePercent.toFixed(2)}% 1D
                              </span>
                            </div>
                          </div>

                          {/* Position Inputs Form */}
                          <div className="space-y-3 pt-1">
                            {/* Order Type Toggle */}
                            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                              <button
                                onClick={() => setTradeType("BUY")}
                                className={`py-2 rounded-xl transition-all cursor-pointer ${
                                  tradeType === "BUY"
                                    ? "bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20"
                                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                                }`}
                              >
                                LONG (BUY)
                              </button>
                              <button
                                onClick={() => setTradeType("SHORT")}
                                className={`py-2 rounded-xl transition-all cursor-pointer ${
                                  tradeType === "SHORT"
                                    ? "bg-rose-500 text-white font-black shadow-md shadow-rose-500/20"
                                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                                }`}
                              >
                                SHORT (SELL)
                              </button>
                            </div>

                            {/* Shares Input & Presets */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-extrabold text-neutral-300 uppercase">
                                  Number of Shares
                                </label>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  Position Quantity
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={sharesInput}
                                  onChange={(e) =>
                                    setSharesInput(
                                      Math.max(1, Number(e.target.value)),
                                    )
                                  }
                                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 font-mono font-bold text-white text-sm focus:outline-none focus:border-emerald-500"
                                  placeholder="Quantity"
                                />
                                <div className="flex gap-1 flex-wrap">
                                  {[10, 25, 50, 100, 500].map((preset) => (
                                    <button
                                      key={preset}
                                      onClick={() => {
                                        triggerHaptic("selection");
                                        setSharesInput(preset);
                                      }}
                                      className={`px-2.5 py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all ${
                                        sharesInput === preset
                                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                                          : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800"
                                      }`}
                                    >
                                      {preset}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Cost Basis Input */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-extrabold text-neutral-300 uppercase">
                                  Average Cost Basis ($/Share)
                                </label>
                                <button
                                  onClick={() => {
                                    triggerHaptic("selection");
                                    setEntryPriceInput(stock.price);
                                  }}
                                  className="text-[10px] font-extrabold text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  Use Market Price (${stock.price.toFixed(2)})
                                </button>
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                value={entryPriceInput}
                                onChange={(e) =>
                                  setEntryPriceInput(Number(e.target.value))
                                }
                                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 font-mono font-bold text-white text-sm focus:outline-none focus:border-emerald-500"
                                placeholder="Average buy price per share"
                              />
                            </div>

                            {/* Submit Button */}
                            <button
                              onClick={handleExecutePaperTrade}
                              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Save Position to Portfolio Tracker</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                  {/* Active Positions List for this Symbol */}
                  {symbolPaperTrades.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-black uppercase text-neutral-400 tracking-wider">
                        Tracked Positions for {stock.symbol} (
                        {symbolPaperTrades.length})
                      </span>
                      <div className="space-y-2">
                        {symbolPaperTrades.map((pt) => {
                          const totalCost = pt.shares * pt.entryPrice;
                          const currentValue = pt.shares * stock.price;
                          const plDollar =
                            pt.type === "BUY"
                              ? currentValue - totalCost
                              : totalCost - currentValue;
                          const plPercent =
                            pt.entryPrice > 0
                              ? (plDollar / totalCost) * 100
                              : 0;
                          const isProfitable = plDollar >= 0;

                          return (
                            <div
                              key={pt.id}
                              className="p-3.5 rounded-xl bg-neutral-950 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                      pt.type === "BUY"
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-rose-500/20 text-rose-400"
                                    }`}
                                  >
                                    {pt.type}
                                  </span>
                                  <span className="font-extrabold text-white">
                                    {pt.shares} Shares @ $
                                    {pt.entryPrice.toFixed(2)}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 font-mono">
                                    ({pt.entryDate})
                                  </span>
                                </div>
                                <div className="text-[11px] text-neutral-300 font-mono">
                                  Cost: $
                                  {totalCost.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}{" "}
                                  • Value: $
                                  {currentValue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                <div className="text-right">
                                  <span
                                    className={`block font-black text-sm font-mono ${isProfitable ? "text-emerald-400" : "text-rose-400"}`}
                                  >
                                    {isProfitable ? "+" : ""}$
                                    {plDollar.toFixed(2)} (
                                    {isProfitable ? "+" : ""}
                                    {plPercent.toFixed(2)}%)
                                  </span>
                                  <span className="text-[9px] text-neutral-500 uppercase font-bold">
                                    Unrealized P/L
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleClosePosition(pt.id)}
                                  className="p-2 rounded-lg bg-neutral-900 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition-all cursor-pointer"
                                  title="Close / Remove Position"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* PORTFOLIO OVERVIEW & AGGREGATE BREAKDOWN */}
                  {portfolioAggregates.distribution.length > 0 && (
                    <div className="p-4 rounded-xl bg-black/70 border border-emerald-500/20 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2 text-white font-extrabold text-xs">
                          <PieChartIcon className="w-4 h-4 text-emerald-400" />
                          <span>
                            Portfolio Overview & Holdings Distribution
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                          {portfolioAggregates.distribution.length} Assets •{" "}
                          {portfolioAggregates.totalPositions} Positions
                        </span>
                      </div>

                      {/* Aggregate Stat Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {/* Total Equity Card */}
                        <div className="p-3 rounded-xl bg-neutral-950 border border-white/5 space-y-1">
                          <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-bold">
                            <Wallet className="w-3 h-3 text-cyan-400" />
                            <span>Total Equity</span>
                          </div>
                          <div className="text-base font-black font-mono text-white">
                            $
                            {portfolioAggregates.totalEquity.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </div>
                        </div>

                        {/* Total Cost Basis Card */}
                        <div className="p-3 rounded-xl bg-neutral-950 border border-white/5 space-y-1">
                          <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-bold">
                            <DollarSign className="w-3 h-3 text-amber-400" />
                            <span>Total Cost Basis</span>
                          </div>
                          <div className="text-base font-black font-mono text-neutral-300">
                            $
                            {portfolioAggregates.totalCost.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </div>
                        </div>

                        {/* Total Gain/Loss Card */}
                        <div className="p-3 rounded-xl bg-neutral-950 border border-white/5 space-y-1">
                          <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-bold">
                            {portfolioAggregates.totalGainLoss >= 0 ? (
                              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 text-rose-400" />
                            )}
                            <span>Total Gain / Loss</span>
                          </div>
                          <div
                            className={`text-base font-black font-mono ${portfolioAggregates.totalGainLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                          >
                            {portfolioAggregates.totalGainLoss >= 0 ? "+" : ""}$
                            {portfolioAggregates.totalGainLoss.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}{" "}
                            ({portfolioAggregates.totalGainLoss >= 0 ? "+" : ""}
                            {portfolioAggregates.totalGainLossPercent.toFixed(
                              2,
                            )}
                            %)
                          </div>
                        </div>
                      </div>

                      {/* Pie Chart & Holdings Allocation Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                        {/* Recharts Pie Chart */}
                        <div className="h-48 w-full flex items-center justify-center relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={portfolioAggregates.distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={42}
                                outerRadius={70}
                                paddingAngle={4}
                                dataKey="value"
                                nameKey="name"
                              >
                                {portfolioAggregates.distribution.map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                      stroke="#000"
                                      strokeWidth={2}
                                    />
                                  ),
                                )}
                              </Pie>
                              <RechartsTooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-white/20 text-xs space-y-1 font-mono shadow-2xl">
                                        <div className="font-extrabold text-white flex items-center gap-1.5">
                                          <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{
                                              backgroundColor: data.color,
                                            }}
                                          />
                                          <span>{data.name}</span>
                                          <span className="text-[10px] text-neutral-400 font-sans">
                                            ({data.allocationPercent.toFixed(1)}
                                            %)
                                          </span>
                                        </div>
                                        <div className="text-emerald-400 font-bold">
                                          $
                                          {data.value.toLocaleString(
                                            undefined,
                                            {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            },
                                          )}
                                        </div>
                                        <div className="text-[10px] text-neutral-400 font-sans">
                                          {data.shares} Shares • P/L:{" "}
                                          <span
                                            className={
                                              data.gainLoss >= 0
                                                ? "text-emerald-400 font-bold"
                                                : "text-rose-400 font-bold"
                                            }
                                          >
                                            {data.gainLoss >= 0 ? "+" : ""}$
                                            {data.gainLoss.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          {/* Donut Center Label */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                              Holdings
                            </span>
                            <span className="text-xs font-black font-mono text-emerald-400">
                              {portfolioAggregates.distribution.length} Assets
                            </span>
                          </div>
                        </div>

                        {/* Holdings List with Allocation Progress Bars */}
                        <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                          <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider block">
                            Distribution Breakdown
                          </span>
                          {portfolioAggregates.distribution.map((item) => (
                            <div
                              key={item.name}
                              className="p-2 rounded-lg bg-neutral-950/80 border border-white/5 space-y-1 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-bold text-white">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span>{item.name}</span>
                                  <span className="text-[10px] text-neutral-400 font-mono">
                                    ({item.shares} sh)
                                  </span>
                                </div>
                                <div className="text-right font-mono font-extrabold text-white text-[11px]">
                                  $
                                  {item.value.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                  <span className="text-[10px] text-cyan-400 ml-1.5 font-sans font-bold">
                                    {item.allocationPercent.toFixed(1)}%
                                  </span>
                                </div>
                              </div>

                              {/* Allocation Progress Bar */}
                              <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(100, item.allocationPercent)}%`,
                                    backgroundColor: item.color,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Paper Trade Form */}
                  {showPaperForm && (
                    <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/20 space-y-3">
                      <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Calculator className="w-4 h-4 text-emerald-400" />{" "}
                          Virtual Trade Calculator
                        </span>
                        {tradeSuccessMsg && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {tradeSuccessMsg}
                          </span>
                        )}
                      </div>

                      {/* Order Type Toggle */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                        <button
                          onClick={() => setTradeType("BUY")}
                          className={`py-2 rounded-xl transition-all cursor-pointer ${
                            tradeType === "BUY"
                              ? "bg-emerald-500 text-black font-black"
                              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                          }`}
                        >
                          BUY (LONG)
                        </button>
                        <button
                          onClick={() => setTradeType("SHORT")}
                          className={`py-2 rounded-xl transition-all cursor-pointer ${
                            tradeType === "SHORT"
                              ? "bg-rose-500 text-white font-black"
                              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                          }`}
                        >
                          SELL (SHORT)
                        </button>
                      </div>

                      {/* Shares Input & Quick Presets */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-neutral-300 uppercase block">
                          Position Size (Shares)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={sharesInput}
                            onChange={(e) =>
                              setSharesInput(
                                Math.max(1, Number(e.target.value)),
                              )
                            }
                            className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 font-mono font-bold text-white text-sm focus:outline-none focus:border-emerald-500"
                          />
                          <div className="flex gap-1">
                            {[10, 50, 100, 500].map((preset) => (
                              <button
                                key={preset}
                                onClick={() => setSharesInput(preset)}
                                className="px-2.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-mono font-bold cursor-pointer"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Entry Price Input */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-neutral-300 uppercase block">
                          Virtual Entry Price ($)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            value={entryPriceInput}
                            onChange={(e) =>
                              setEntryPriceInput(Number(e.target.value))
                            }
                            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 font-mono font-bold text-white text-sm focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            onClick={() => setEntryPriceInput(stock.price)}
                            className="absolute right-2 top-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold cursor-pointer"
                          >
                            Use Market Price
                          </button>
                        </div>
                      </div>

                      {/* Total Virtual Cost Summary */}
                      <div className="p-3 rounded-xl bg-neutral-950 border border-white/10 flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-400 font-sans">
                          Total Position Value:
                        </span>
                        <span className="text-emerald-400 font-extrabold text-sm">
                          $
                          {(sharesInput * entryPriceInput).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </span>
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={handleExecutePaperTrade}
                        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Confirm Virtual Position</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Interactive SVG Line & Candlestick Chart Stage */}
              <div className="relative bg-[#0b0e17] border border-slate-800 rounded-2xl p-4 overflow-hidden shadow-2xl">
                {/* Controls Bar: Timeframe & Technical Indicator Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800/80 text-xs">
                  {/* Timeframe Selector & Chart Type Indicator */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-[#121624] p-1 rounded-xl border border-slate-800">
                      {(["1D", "1W", "1M", "1Y", "ALL"] as TimeFrame[]).map(
                        (tf) => (
                          <button
                            key={tf}
                            onClick={() => {
                              triggerHaptic("selection");
                              setTimeframe(tf);
                              setHoverIndex(null);
                            }}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer active:scale-95 text-xs font-mono font-bold ${
                              timeframe === tf
                                ? "bg-slate-700 text-white font-black shadow-sm"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                            }`}
                          >
                            {tf}
                          </button>
                        ),
                      )}
                    </div>

                    {/* Chart Engine Switcher (Candles vs Line) */}
                    <div className="flex items-center gap-1 bg-[#121624] p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => {
                          triggerHaptic("selection");
                          setChartMode("candle");
                        }}
                        className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          chartMode === "candle"
                            ? "bg-blue-600/30 text-blue-300 border border-blue-500/50"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }`}
                        title="HD Candlestick Chart"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Candles</span>
                      </button>
                      <button
                        onClick={() => {
                          triggerHaptic("selection");
                          setChartMode("line");
                        }}
                        className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          chartMode === "line"
                            ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }`}
                        title="Line & Gradient Area Chart"
                      >
                        <LineChart className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Line Area</span>
                      </button>
                    </div>
                  </div>

                  {/* Technical Indicator Toggles */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* 50-Day SMA Toggle */}
                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        setShowSMA(!showSMA);
                      }}
                      className={`px-2.5 py-1.2 rounded-lg border font-mono font-semibold flex items-center gap-1.5 text-xs transition-all cursor-pointer active:scale-95 ${
                        showSMA
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                          : "bg-[#121624] text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>50 SMA</span>
                    </button>

                    {/* VWAP Toggle */}
                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        setShowVWAP(!showVWAP);
                      }}
                      className={`px-2.5 py-1.2 rounded-lg border font-mono font-semibold flex items-center gap-1.5 text-xs transition-all cursor-pointer active:scale-95 ${
                        showVWAP
                          ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/40"
                          : "bg-[#121624] text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span>VWAP</span>
                    </button>

                    {/* RSI Toggle */}
                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        setShowRSI(!showRSI);
                      }}
                      className={`px-2.5 py-1.2 rounded-lg border font-mono font-semibold flex items-center gap-1.5 text-xs transition-all cursor-pointer active:scale-95 ${
                        showRSI
                          ? "bg-sky-500/15 text-sky-300 border-sky-500/40"
                          : "bg-[#121624] text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 text-sky-400" />
                      <span>RSI (14)</span>
                    </button>

                    {/* Trendline Tool Toggle */}
                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        setIsTrendlineActive(!isTrendlineActive);
                      }}
                      className={`px-2.5 py-1.2 rounded-lg border font-mono font-semibold flex items-center gap-1.5 text-xs transition-all cursor-pointer active:scale-95 ${
                        isTrendlineActive
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                          : "bg-[#121624] text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5 text-amber-400" />
                      <span>Trendline</span>
                    </button>

                    {/* Benchmark Overlay Toggle */}
                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        setShowOverlay(!showOverlay);
                        setHoverIndex(null);
                      }}
                      className={`px-2.5 py-1.2 rounded-lg border font-mono font-semibold flex items-center gap-1.5 text-xs transition-all cursor-pointer active:scale-95 ${
                        showOverlay
                          ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                          : "bg-[#121624] text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Overlay</span>
                    </button>

                    {/* Benchmark Selector Pills when Overlay is ON */}
                    {showOverlay && (
                      <div className="flex items-center gap-1 bg-[#121624] p-1 rounded-lg border border-slate-800">
                        {(["SPY", "QQQ", "DIA"] as const).map((sym) => {
                          const isActive = benchmarkSymbol === sym;
                          return (
                            <button
                              key={sym}
                              onClick={() => {
                                triggerHaptic("selection");
                                setBenchmarkSymbol(sym);
                                setHoverIndex(null);
                              }}
                              className={`px-2 py-0.5 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? "bg-slate-700 text-white"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              vs {sym}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Historical Benchmark Legend & Alpha Banner */}
                {showOverlay && (
                  <div className="mb-3 p-2.5 rounded-xl bg-[#030e1a]/90 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Main Stock Return */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-1 rounded-full"
                          style={{
                            backgroundColor: isPositive ? "#00ff88" : "#ff3b3b",
                          }}
                        />
                        <span className="font-extrabold text-white">
                          ${stock.symbol}:
                        </span>
                        <span
                          className={`font-black ${hoveredStockReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {hoveredStockReturn >= 0 ? "+" : ""}
                          {hoveredStockReturn.toFixed(2)}%
                        </span>
                      </div>

                      <span className="text-neutral-600">|</span>

                      {/* Benchmark Return */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-0.5 border-t-2 border-dashed"
                          style={{ borderColor: activeBenchmark.color }}
                        />
                        <span className="font-extrabold text-neutral-200">
                          {benchmarkSymbol}:
                        </span>
                        <span
                          className={`font-black ${hoveredBenchReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {hoveredBenchReturn >= 0 ? "+" : ""}
                          {hoveredBenchReturn.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Relative Alpha Performance Badge */}
                    <div
                      className={`px-2 py-0.5 rounded-lg border text-[11px] font-black flex items-center gap-1 ${
                        hoveredAlpha >= 0
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      <span>Alpha:</span>
                      <span>
                        {hoveredAlpha >= 0 ? "+" : ""}
                        {hoveredAlpha.toFixed(2)}%
                      </span>
                      <span className="text-[9px] uppercase font-bold opacity-80">
                        vs {benchmarkSymbol}
                      </span>
                    </div>
                  </div>
                )}

                {/* TradingView High Density Header HUD */}
                <div className="mb-2 p-2 rounded-lg bg-[#0d101b] border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-slate-300 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-slate-400">
                        {stock.symbol} ({activeCandle.time}):
                      </span>
                    </span>
                    <span className="text-slate-400">
                      O{" "}
                      <strong className="text-slate-200">
                        ${activeCandle.open.toFixed(2)}
                      </strong>
                    </span>
                    <span className="text-slate-400">
                      H{" "}
                      <strong className="text-emerald-400">
                        ${activeCandle.high.toFixed(2)}
                      </strong>
                    </span>
                    <span className="text-slate-400">
                      L{" "}
                      <strong className="text-rose-400">
                        ${activeCandle.low.toFixed(2)}
                      </strong>
                    </span>
                    <span className="text-slate-400">
                      C{" "}
                      <strong
                        className={
                          activeCandle.isUp
                            ? "text-emerald-400 font-bold"
                            : "text-rose-400 font-bold"
                        }
                      >
                        ${activeCandle.close.toFixed(2)}
                      </strong>
                    </span>

                    {showSMA && activeSma !== undefined && (
                      <span className="text-slate-400 border-l border-slate-800 pl-2.5">
                        SMA(50){" "}
                        <strong className="text-amber-300">
                          ${activeSma.toFixed(2)}
                        </strong>
                      </span>
                    )}
                    {showVWAP && activeVwap !== undefined && (
                      <span className="text-slate-400 border-l border-slate-800 pl-2.5">
                        VWAP{" "}
                        <strong className="text-indigo-300">
                          ${activeVwap.toFixed(2)}
                        </strong>
                      </span>
                    )}
                    {showRSI && activeRsi !== undefined && (
                      <span className="text-slate-400 border-l border-slate-800 pl-2.5">
                        RSI(14){" "}
                        <strong
                          className={
                            activeRsi >= 70
                              ? "text-amber-300 font-bold"
                              : activeRsi <= 30
                                ? "text-emerald-300 font-bold"
                                : "text-sky-300 font-bold"
                          }
                        >
                          {activeRsi.toFixed(1)}
                        </strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-[#121624] p-0.5 rounded border border-slate-800">
                      <button
                        onClick={() => {
                          triggerHaptic("selection");
                          const next = Math.max(
                            1.0,
                            Number((zoomLevel - 0.5).toFixed(1)),
                          );
                          setZoomLevel(next);
                          if (next === 1.0) setPanOffset(0.0);
                        }}
                        disabled={zoomLevel <= 1.0}
                        title="Zoom Out"
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>

                      <span className="px-1 text-[11px] font-mono text-slate-300 min-w-[28px] text-center">
                        {zoomLevel.toFixed(1)}x
                      </span>

                      <button
                        onClick={() => {
                          triggerHaptic("selection");
                          setZoomLevel((z) =>
                            Math.min(5.0, Number((z + 0.5).toFixed(1))),
                          );
                        }}
                        disabled={zoomLevel >= 5.0}
                        title="Zoom In"
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>

                      {zoomLevel > 1.01 && (
                        <button
                          onClick={() => {
                            triggerHaptic("selection");
                            setZoomLevel(1.0);
                            setPanOffset(0.0);
                          }}
                          title="Reset Zoom"
                          className="p-1 ml-0.5 rounded text-rose-400 hover:bg-rose-500/20 cursor-pointer text-[10px] font-bold"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${activeCandle.isUp ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"}`}
                    >
                      {activeCandle.isUp ? "+" : ""}
                      {activeCandle.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Interactive Chart Stage with Pinch-to-Zoom & Pan */}
                <div
                  className="relative w-full h-48 select-none touch-none cursor-crosshair overflow-hidden rounded-xl border border-white/10"
                  style={{ touchAction: "none" }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onWheel={handleWheelZoom}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => {
                    handleMouseUp();
                    setHoverIndex(null);
                  }}
                >
                  {/* Floating Gesture & Zoom Indicator */}
                  <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg bg-black/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-lg backdrop-blur-md pointer-events-none">
                    {zoomLevel > 1.05 ? (
                      <>
                        <Move className="w-3 h-3 text-cyan-400 animate-pulse" />
                        <span>
                          Zoomed {zoomLevel.toFixed(1)}x • Drag to Pan
                        </span>
                      </>
                    ) : (
                      <>
                        <ZoomIn className="w-3 h-3 text-cyan-400" />
                        <span>Pinch or scroll to Zoom</span>
                      </>
                    )}
                  </div>

                  {/* Floating Guidance for Trendline Tool */}
                  {isTrendlineActive && (
                    <div className="absolute top-2 right-16 z-10 px-2.5 py-1 rounded-lg bg-yellow-950/90 border border-yellow-500/50 text-[10px] font-mono text-yellow-300 flex items-center gap-1.5 shadow-lg backdrop-blur-md pointer-events-none">
                      <PenTool className="w-3 h-3 text-yellow-400 animate-bounce" />
                      <span>
                        {trendline
                          ? "Drag to re-draw line"
                          : "Click & drag across chart to draw line"}
                      </span>
                    </div>
                  )}

                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-full overflow-visible"
                  >
                    <defs>
                      <linearGradient
                        id="chartGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#06b6d4"
                          stopOpacity="0.4"
                        />
                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                      <linearGradient
                        id="rhGradientUp"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#00c805"
                          stopOpacity="0.45"
                        />
                        <stop
                          offset="100%"
                          stopColor="#00c805"
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                      <linearGradient
                        id="rhGradientDown"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#ff3b30"
                          stopOpacity="0.45"
                        />
                        <stop
                          offset="100%"
                          stopColor="#ff3b30"
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>

                    {/* Dark TradingView Background Canvas */}
                    <rect
                      x="0"
                      y="0"
                      width={svgWidth}
                      height={svgHeight}
                      fill="#090d16"
                    />

                    {/* Horizontal Grid Lines & Y-Axis Scale */}
                    {yAxisTicks.map((tick, i) => (
                      <g key={tick.label + "_" + i}>
                        <line
                          x1="0"
                          y1={tick.y}
                          x2={plotWidth}
                          y2={tick.y}
                          stroke="rgba(255, 255, 255, 0.05)"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={plotWidth + 6}
                          y={tick.y + 3}
                          fill="rgba(255, 255, 255, 0.45)"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="600"
                        >
                          {tick.label}
                        </text>
                      </g>
                    ))}

                    {/* Zero % Baseline line when Overlay is ON */}
                    {showOverlay && (
                      <>
                        <line
                          x1="0"
                          y1={zeroY}
                          x2={plotWidth}
                          y2={zeroY}
                          stroke="rgba(255, 255, 255, 0.25)"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={plotWidth - 80}
                          y={zeroY - 4}
                          fill="rgba(255, 255, 255, 0.5)"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          0.0% Baseline
                        </text>
                      </>
                    )}

                    {/* Vertical Time Gridlines */}
                    {timeTicks.map((tick, i) => (
                      <line
                        key={`vtick-${i}`}
                        x1={tick.x}
                        y1="0"
                        x2={tick.x}
                        y2={plotBottom}
                        stroke="rgba(255, 255, 255, 0.04)"
                        strokeDasharray="2 2"
                      />
                    ))}

                    {/* Volume Histogram Baseline */}
                    <line
                      x1="0"
                      y1={plotBottom}
                      x2={plotWidth}
                      y2={plotBottom}
                      stroke="rgba(255, 255, 255, 0.12)"
                      strokeWidth="1"
                    />

                    {/* Bottom Volume Histogram Bars */}
                    <g>
                      {candleOHLCData.map((c, idx) => {
                        const x =
                          (idx / Math.max(1, candleOHLCData.length - 1)) *
                          plotWidth;
                        const pointSpacing =
                          plotWidth / Math.max(1, candleOHLCData.length - 1);
                        const barW = Math.max(2, pointSpacing * 0.65);
                        const vol = c.volume || 1000;
                        const volH = Math.max(2, (vol / maxVolume) * 22);
                        const volY = plotBottom - volH;
                        const color = c.isUp
                          ? "rgba(0, 200, 5, 0.28)"
                          : "rgba(255, 80, 0, 0.28)";
                        return (
                          <rect
                            key={`vol-${idx}`}
                            x={x - barW / 2}
                            y={volY}
                            width={barW}
                            height={volH}
                            fill={color}
                            rx="0.5"
                          />
                        );
                      })}
                    </g>

                    {/* X-Axis Time Ticks along bottom */}
                    <g>
                      {timeTicks.map((tick, i) => (
                        <text
                          key={`time-tick-${i}`}
                          x={tick.x}
                          y={plotBottom + 16}
                          textAnchor="middle"
                          fill="rgba(255, 255, 255, 0.45)"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="600"
                        >
                          {tick.label}
                        </text>
                      ))}
                    </g>

                    {/* Benchmark Overlay Path */}
                    {showOverlay && benchmarkPathD && (
                      <path
                        d={benchmarkPathD}
                        fill="none"
                        stroke={activeBenchmark.color}
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* 50-Day Simple Moving Average (SMA) Overlay Line */}
                    {showSMA && smaPathD && (
                      <g className="pointer-events-none">
                        <path
                          d={smaPathD}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-150 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                        />
                        {/* Interactive Hover indicator dot on SMA Line */}
                        {hoverIndex !== null &&
                          visibleSmaValues[hoverIndex] !== undefined && (
                            <circle
                              cx={
                                (hoverIndex /
                                  Math.max(1, visibleSmaValues.length - 1)) *
                                plotWidth
                              }
                              cy={
                                plotBottom -
                                ((visibleSmaValues[hoverIndex] - minVal) /
                                  valRange) *
                                  plotHeight
                              }
                              r="4.5"
                              fill="#f59e0b"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                          )}
                      </g>
                    )}

                    {/* Volume-Weighted Average Price (VWAP) Overlay Line */}
                    {showVWAP && vwapPathD && (
                      <g className="pointer-events-none">
                        <path
                          d={vwapPathD}
                          fill="none"
                          stroke="#c084fc"
                          strokeWidth="2.5"
                          strokeDasharray="5 3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-150 drop-shadow-[0_0_6px_rgba(192,132,252,0.6)]"
                        />
                        {/* Interactive Hover indicator dot on VWAP Line */}
                        {hoverIndex !== null &&
                          visibleVwapValues[hoverIndex] !== undefined && (
                            <circle
                              cx={
                                (hoverIndex /
                                  Math.max(1, visibleVwapValues.length - 1)) *
                                plotWidth
                              }
                              cy={
                                plotBottom -
                                ((visibleVwapValues[hoverIndex] - minVal) /
                                  valRange) *
                                  plotHeight
                              }
                              r="4.5"
                              fill="#c084fc"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                          )}
                      </g>
                    )}

                    {/* ROBINHOOD SMOOTH LINE & GRADIENT AREA MODE */}
                    {chartMode === "line" && (
                      <g>
                        {/* Filled Area Gradient */}
                        {areaPathD && (
                          <path
                            d={areaPathD}
                            fill={
                              isPositive
                                ? "url(#rhGradientUp)"
                                : "url(#rhGradientDown)"
                            }
                          />
                        )}
                        {/* Crisp Price Line */}
                        {linePathD && (
                          <path
                            d={linePathD}
                            fill="none"
                            stroke={isPositive ? "#00c805" : "#ff3b30"}
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-[0_2px_8px_rgba(0,200,5,0.4)]"
                          />
                        )}
                        {/* Live Endpoint Pulsing Dot */}
                        {candleOHLCData.length > 0 && (
                          <g
                            transform={`translate(${plotWidth}, ${plotBottom - ((candleOHLCData[candleOHLCData.length - 1].close - minVal) / valRange) * plotHeight})`}
                          >
                            <circle
                              r="6"
                              fill={isPositive ? "#00c805" : "#ff3b30"}
                              opacity="0.4"
                              className="animate-ping"
                            />
                            <circle
                              r="4"
                              fill={isPositive ? "#00c805" : "#ff3b30"}
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />
                          </g>
                        )}
                        {/* Active Hover Point Marker on Line Chart */}
                        {hoverIndex !== null && activeCandle && (
                          <g
                            transform={`translate(${(hoverIndex / Math.max(1, candleOHLCData.length - 1)) * plotWidth}, ${plotBottom - ((activeCandle.close - minVal) / valRange) * plotHeight})`}
                          >
                            <circle
                              r="7"
                              fill={isPositive ? "#00c805" : "#ff3b30"}
                              opacity="0.4"
                              className="animate-ping"
                            />
                            <circle
                              r="5"
                              fill={isPositive ? "#00c805" : "#ff3b30"}
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                          </g>
                        )}
                      </g>
                    )}

                    {/* TRADINGVIEW HIGH-TECH SVG AREA LINE CHART */}
                    {chartMode === "candle" && (
                      <g>
                        {/* Filled Area Gradient */}
                        {areaPathD && (
                          <path
                            d={areaPathD}
                            fill="url(#chartGradient)"
                          />
                        )}
                        {/* Crisp Price Line */}
                        {linePathD && (
                          <path
                            d={linePathD}
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-[0_2px_10px_rgba(6,182,212,0.5)]"
                          />
                        )}
                        {/* Live Endpoint Pulsing Dot */}
                        {candleOHLCData.length > 0 && (
                          <g
                            transform={`translate(${plotWidth}, ${plotBottom - ((candleOHLCData[candleOHLCData.length - 1].close - minVal) / valRange) * plotHeight})`}
                          >
                            <circle
                              r="8"
                              fill="#06b6d4"
                              opacity="0.4"
                              className="animate-ping"
                            />
                            <circle
                              r="5"
                              fill="#06b6d4"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />
                          </g>
                        )}
                        {/* Active Hover Point Marker */}
                        {hoverIndex !== null && activeCandle && (
                          <g
                            transform={`translate(${(hoverIndex / Math.max(1, candleOHLCData.length - 1)) * plotWidth}, ${plotBottom - ((activeCandle.close - minVal) / valRange) * plotHeight})`}
                          >
                            <circle
                              r="8"
                              fill="#06b6d4"
                              opacity="0.4"
                              className="animate-ping"
                            />
                            <circle
                              r="5"
                              fill="#06b6d4"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                          </g>
                        )}
                        {/* Interactive Scrubbing Columns */}
                        {candleOHLCData.map((_, idx) => {
                          const x = (idx / Math.max(1, candleOHLCData.length - 1)) * plotWidth;
                          const pointSpacing = plotWidth / Math.max(1, candleOHLCData.length - 1);
                          const rectW = Math.max(4, pointSpacing);
                          return (
                            <rect
                              key={`scrub-col-${idx}`}
                              x={x - rectW / 2}
                              y="0"
                              width={rectW}
                              height={plotBottom}
                              fill="transparent"
                              className="cursor-crosshair"
                              onMouseEnter={() => setHoverIndex(idx)}
                              onTouchStart={() => setHoverIndex(idx)}
                            />
                          );
                        })}
                      </g>
                    )}

                    {/* Live Current Price Scale Badge */}
                    {activeStock && (
                      <g
                        transform={`translate(${plotWidth + 2}, ${plotBottom - ((activeStock.price - minVal) / valRange) * plotHeight - 9})`}
                      >
                        <rect
                          x="0"
                          y="0"
                          width="58"
                          height="18"
                          rx="4"
                          fill={isPositive ? "#00c805" : "#ff3b30"}
                          className="shadow-md"
                        />
                        <text
                          x="29"
                          y="12"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          ${activeStock.price.toFixed(2)}
                        </text>
                      </g>
                    )}

                    {/* TRADINGVIEW DYNAMIC CROSSHAIR & AXIS MAGNET BADGES */}
                    {hoverIndex !== null && activeCandle && (
                      <g className="pointer-events-none">
                        {/* Vertical Crosshair Line */}
                        <line
                          x1={
                            (hoverIndex /
                              Math.max(1, candleOHLCData.length - 1)) *
                            plotWidth
                          }
                          y1="0"
                          x2={
                            (hoverIndex /
                              Math.max(1, candleOHLCData.length - 1)) *
                            plotWidth
                          }
                          y2={265}
                          stroke="#38bdf8"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                        />
                        {/* Horizontal Crosshair Line */}
                        <line
                          x1="0"
                          y1={
                            plotBottom -
                            ((activeCandle.close - minVal) / valRange) *
                              plotHeight
                          }
                          x2={plotWidth}
                          y2={
                            plotBottom -
                            ((activeCandle.close - minVal) / valRange) *
                              plotHeight
                          }
                          stroke="#38bdf8"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                        />
                        {/* Right Y-Axis Hover Price Badge */}
                        <g
                          transform={`translate(${plotWidth + 2}, ${plotBottom - ((activeCandle.close - minVal) / valRange) * plotHeight - 10})`}
                        >
                          <rect
                            x="0"
                            y="0"
                            width="58"
                            height="20"
                            rx="4"
                            fill="#0f172a"
                            stroke="#38bdf8"
                            strokeWidth="1.5"
                          />
                          <text
                            x="29"
                            y="13"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            ${activeCandle.close.toFixed(2)}
                          </text>
                        </g>
                        {/* Bottom X-Axis Hover Timestamp Badge */}
                        <g
                          transform={`translate(${Math.max(25, Math.min(plotWidth - 35, (hoverIndex / Math.max(1, candleOHLCData.length - 1)) * plotWidth)) - 30}, 266)`}
                        >
                          <rect
                            x="0"
                            y="0"
                            width="60"
                            height="14"
                            rx="3"
                            fill="#0f172a"
                            stroke="#38bdf8"
                            strokeWidth="1"
                          />
                          <text
                            x="30"
                            y="10"
                            textAnchor="middle"
                            fill="#38bdf8"
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {activeCandle.time}
                          </text>
                        </g>
                      </g>
                    )}

                    {/* Interactive User Trendline Overlay */}
                    {trendline && (
                      <g className="pointer-events-none">
                        {/* Outer Glow */}
                        <line
                          x1={trendline.x1}
                          y1={trendline.y1}
                          x2={trendline.x2}
                          y2={trendline.y2}
                          stroke={
                            trendlineMetrics?.isBullish ? "#00ff88" : "#ff3b3b"
                          }
                          strokeWidth="6"
                          strokeOpacity="0.35"
                          strokeLinecap="round"
                        />
                        {/* Core Line */}
                        <line
                          x1={trendline.x1}
                          y1={trendline.y1}
                          x2={trendline.x2}
                          y2={trendline.y2}
                          stroke={
                            trendlineMetrics?.isBullish ? "#00ff88" : "#ff3b3b"
                          }
                          strokeWidth="2.5"
                          strokeDasharray={isDrawingTrendline ? "4 2" : "none"}
                          strokeLinecap="round"
                        />
                        {/* Start Endpoint Handle */}
                        <circle
                          cx={trendline.x1}
                          cy={trendline.y1}
                          r="5"
                          fill={
                            trendlineMetrics?.isBullish ? "#00ff88" : "#ff3b3b"
                          }
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        {/* End Endpoint Handle */}
                        <circle
                          cx={trendline.x2}
                          cy={trendline.y2}
                          r="5"
                          fill={
                            trendlineMetrics?.isBullish ? "#00ff88" : "#ff3b3b"
                          }
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        {/* Midpoint Slope Label Badge */}
                        {Math.hypot(
                          trendline.x2 - trendline.x1,
                          trendline.y2 - trendline.y1,
                        ) > 25 &&
                          trendlineMetrics && (
                            <g
                              transform={`translate(${(trendline.x1 + trendline.x2) / 2}, ${(trendline.y1 + trendline.y2) / 2 - 12})`}
                            >
                              <rect
                                x="-60"
                                y="-11"
                                width="120"
                                height="22"
                                rx="6"
                                fill="#09090b"
                                stroke={
                                  trendlineMetrics.isBullish
                                    ? "#00ff88"
                                    : "#ff3b3b"
                                }
                                strokeWidth="1.5"
                                fillOpacity="0.95"
                              />
                              <text
                                x="0"
                                y="3"
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="10"
                                fontWeight="bold"
                                fontFamily="monospace"
                              >
                                {trendlineMetrics.isBullish ? "▲ " : "▼ "}
                                {trendlineMetrics.priceSlopePerBar >= 0
                                  ? "+"
                                  : ""}
                                {trendlineMetrics.priceSlopePerBar.toFixed(2)}
                                /candle (
                                {trendlineMetrics.percentChange >= 0 ? "+" : ""}
                                {trendlineMetrics.percentChange.toFixed(1)}%)
                              </text>
                            </g>
                          )}
                      </g>
                    )}
                  </svg>
                </div>

                {/* Trendline Slope & Technical Analysis Display Panel */}
                {trendline && trendlineMetrics && (
                  <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-neutral-950 via-yellow-950/20 to-neutral-950 border border-yellow-500/30 font-mono text-xs text-neutral-200 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 flex items-center gap-1.5 font-extrabold text-[11px] uppercase tracking-wider">
                        <PenTool className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Trendline Analysis</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-neutral-400 font-sans">
                          Points:
                        </span>
                        <span className="font-bold text-white">
                          ${trendline.price1.toFixed(2)} ({trendline.time1}) → $
                          {trendline.price2.toFixed(2)} ({trendline.time2})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Price Difference & % */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10">
                        <span className="text-neutral-400 text-[10px] uppercase font-sans">
                          Total Δ:
                        </span>
                        <span
                          className={`font-black ${trendlineMetrics.isBullish ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {trendlineMetrics.isBullish ? "+" : ""}$
                          {trendlineMetrics.priceDiff.toFixed(2)} (
                          {trendlineMetrics.isBullish ? "+" : ""}
                          {trendlineMetrics.percentChange.toFixed(2)}%)
                        </span>
                      </div>

                      {/* Calculated Slope per Candle */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 border border-yellow-500/30">
                        <span className="text-yellow-400 text-[10px] uppercase font-sans font-bold">
                          Slope:
                        </span>
                        <span
                          className={`font-black ${trendlineMetrics.isBullish ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {trendlineMetrics.isBullish ? "+" : ""}$
                          {trendlineMetrics.priceSlopePerBar.toFixed(2)} /
                          candle
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          ({trendlineMetrics.percentSlopePerBar >= 0 ? "+" : ""}
                          {trendlineMetrics.percentSlopePerBar.toFixed(2)}%/bar)
                        </span>
                      </div>

                      {/* Trajectory Angle */}
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-950/50 text-yellow-300 border border-yellow-500/30 text-[10px] font-bold">
                        <span>Trajectory:</span>
                        <span>
                          {trendlineMetrics.angleDeg >= 0 ? "+" : ""}
                          {trendlineMetrics.angleDeg.toFixed(1)}°
                        </span>
                      </div>

                      {/* Clear Button */}
                      <button
                        onClick={() => {
                          triggerHaptic("selection");
                          setTrendline(null);
                        }}
                        className="px-2 py-1 rounded-lg bg-neutral-900 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                        title="Clear trendline"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Mini Timeline Viewport Slider when Zoomed In */}
                {zoomLevel > 1.05 && (
                  <div className="mt-2.5 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
                      <span>Start</span>
                      <span className="text-cyan-300 font-extrabold flex items-center gap-1">
                        Showing {candleOHLCData.length} of{" "}
                        {fullCandleOHLCData.length} Candles (
                        {Math.round(
                          (candleOHLCData.length / fullCandleOHLCData.length) *
                            100,
                        )}
                        % View)
                      </span>
                      <span>Latest</span>
                    </div>
                    <div
                      className="relative w-full h-2.5 rounded-full bg-neutral-950 border border-cyan-500/30 overflow-hidden cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const pct = Math.max(
                          0,
                          Math.min(1, clickX / rect.width),
                        );
                        setPanOffset(Number(pct.toFixed(3)));
                      }}
                    >
                      <div
                        className="absolute top-0 bottom-0 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all shadow-[0_0_8px_#06b6d4]"
                        style={{
                          left: `${panOffset * (100 - 100 / zoomLevel)}%`,
                          width: `${Math.max(10, 100 / zoomLevel)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Relative Strength Index (RSI 14) Visual Gauge & Subchart Indicator */}
              <div className="p-4 rounded-2xl bg-[#030e1a]/90 border border-cyan-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      <Activity className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-cyan-200 uppercase tracking-wider block">
                        Relative Strength Index (RSI 14)
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Technical Momentum & Overbought / Oversold Oscillator
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black font-mono px-3 py-1 rounded-xl flex items-center gap-1.5 border ${activeRsiStatus.color}`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>RSI: {activeRsi.toFixed(1)}</span>
                      <span className="uppercase font-bold text-[10px]">
                        ({activeRsiStatus.label})
                      </span>
                    </span>
                  </div>
                </div>

                {/* Interactive RSI Subchart SVG Stage */}
                {showRSI && (
                  <div
                    className="relative w-full h-[110px] select-none touch-none cursor-crosshair overflow-hidden bg-black/60 rounded-xl border border-cyan-500/20"
                    onMouseMove={(e) => handleSubchartHover(e, e.currentTarget)}
                    onTouchMove={(e) => handleSubchartHover(e, e.currentTarget)}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    <svg
                      viewBox={`0 0 ${svgWidth} ${rsiSvgHeight}`}
                      className="w-full h-full overflow-visible"
                    >
                      {/* Dark Background Canvas */}
                      <rect
                        x="0"
                        y="0"
                        width={svgWidth}
                        height={rsiSvgHeight}
                        fill="#070b14"
                      />

                      {/* Overbought 70% Shaded Zone */}
                      <rect
                        x="0"
                        y="0"
                        width={plotWidth}
                        height={getRsiY(70)}
                        fill="rgba(245, 158, 11, 0.08)"
                      />

                      {/* Oversold 30% Shaded Zone */}
                      <rect
                        x="0"
                        y={getRsiY(30)}
                        width={plotWidth}
                        height={rsiSvgHeight - getRsiY(30)}
                        fill="rgba(16, 185, 129, 0.08)"
                      />

                      {/* 70% Overbought Threshold Line */}
                      <line
                        x1="0"
                        y1={getRsiY(70)}
                        x2={plotWidth}
                        y2={getRsiY(70)}
                        stroke="rgba(245, 158, 11, 0.5)"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={plotWidth + 6}
                        y={getRsiY(70) + 3}
                        fill="rgba(245, 158, 11, 0.85)"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        70 OB
                      </text>

                      {/* 50% Centerline */}
                      <line
                        x1="0"
                        y1={getRsiY(50)}
                        x2={plotWidth}
                        y2={getRsiY(50)}
                        stroke="rgba(255, 255, 255, 0.15)"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                      <text
                        x={plotWidth + 6}
                        y={getRsiY(50) + 3}
                        fill="rgba(255, 255, 255, 0.4)"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        50
                      </text>

                      {/* 30% Oversold Threshold Line */}
                      <line
                        x1="0"
                        y1={getRsiY(30)}
                        x2={plotWidth}
                        y2={getRsiY(30)}
                        stroke="rgba(16, 185, 129, 0.5)"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={plotWidth + 6}
                        y={getRsiY(30) + 3}
                        fill="rgba(16, 185, 129, 0.85)"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        30 OS
                      </text>

                      {/* Active Hover vertical guide */}
                      {hoverIndex !== null && (
                        <line
                          x1={
                            (hoverIndex /
                              Math.max(1, visibleRsiValues.length - 1)) *
                            plotWidth
                          }
                          y1="0"
                          x2={
                            (hoverIndex /
                              Math.max(1, visibleRsiValues.length - 1)) *
                            plotWidth
                          }
                          y2={rsiSvgHeight}
                          stroke="#38bdf8"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* RSI Line Path */}
                      {rsiLinePath && (
                        <path
                          d={rsiLinePath}
                          fill="none"
                          stroke="#00f2ff"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="drop-shadow-[0_0_8px_rgba(0,242,255,0.7)]"
                        />
                      )}

                      {/* Hover indicator dot & Y-Axis Scale Badge */}
                      {hoverIndex !== null &&
                        visibleRsiValues[hoverIndex] !== undefined && (
                          <g className="pointer-events-none">
                            <circle
                              cx={
                                (hoverIndex /
                                  Math.max(1, visibleRsiValues.length - 1)) *
                                plotWidth
                              }
                              cy={getRsiY(visibleRsiValues[hoverIndex])}
                              r="4.5"
                              fill="#38bdf8"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              className="animate-pulse"
                            />
                            <g
                              transform={`translate(${plotWidth + 2}, ${Math.max(4, Math.min(rsiSvgHeight - 20, getRsiY(visibleRsiValues[hoverIndex]) - 9))})`}
                            >
                              <rect
                                x="0"
                                y="0"
                                width="58"
                                height="18"
                                rx="4"
                                fill="#0f172a"
                                stroke="#38bdf8"
                                strokeWidth="1.2"
                              />
                              <text
                                x="29"
                                y="12"
                                textAnchor="middle"
                                fill={
                                  visibleRsiValues[hoverIndex] >= 70
                                    ? "#f59e0b"
                                    : visibleRsiValues[hoverIndex] <= 30
                                      ? "#10b981"
                                      : "#38bdf8"
                                }
                                fontSize="9"
                                fontFamily="monospace"
                                fontWeight="bold"
                              >
                                RSI {visibleRsiValues[hoverIndex].toFixed(1)}
                              </text>
                            </g>
                          </g>
                        )}
                    </svg>
                  </div>
                )}

                {/* RSI Visual Spectrum Gauge */}
                <div className="space-y-1.5 pt-1">
                  <div className="relative w-full h-3.5 rounded-full bg-neutral-900 overflow-hidden border border-white/10 flex">
                    {/* 0-30 Oversold Zone */}
                    <div
                      className="w-[30%] h-full bg-gradient-to-r from-emerald-600 to-emerald-400/80 opacity-80"
                      title="Oversold Zone (0 30)"
                    />
                    {/* 30-70 Neutral Zone */}
                    <div
                      className="w-[40%] h-full bg-gradient-to-r from-cyan-900 via-slate-700 to-cyan-900 opacity-60"
                      title="Neutral Zone (30 70)"
                    />
                    {/* 70-100 Overbought Zone */}
                    <div
                      className="w-[30%] h-full bg-gradient-to-r from-amber-500 to-rose-600 opacity-80"
                      title="Overbought Zone (70 100)"
                    />

                    {/* Threshold mark lines */}
                    <div className="absolute left-[30%] top-0 bottom-0 w-0.5 bg-emerald-300 z-10 shadow-[0_0_8px_#10b981]" />
                    <div className="absolute left-[70%] top-0 bottom-0 w-0.5 bg-amber-300 z-10 shadow-[0_0_8px_#f59e0b]" />

                    {/* Pointer Pin */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-cyan-400 shadow-[0_0_12px_#00f2ff] z-20 transition-all duration-300"
                      style={{
                        left: `${Math.min(98, Math.max(2, activeRsi))}%`,
                      }}
                    />
                  </div>

                  {/* Threshold Labels */}
                  <div className="flex justify-between text-[10px] font-mono font-bold text-neutral-400 px-0.5">
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                      <span>0</span>
                      <span className="text-[9px] text-emerald-300/80">
                        (Oversold ≤30)
                      </span>
                    </span>
                    <span className="text-cyan-400 font-bold">50 Neutral</span>
                    <span className="text-amber-400 font-extrabold flex items-center gap-1">
                      <span className="text-[9px] text-amber-300/80">
                        (Overbought ≥70)
                      </span>
                      <span>100</span>
                    </span>
                  </div>
                </div>

                {/* Technical Condition Explanation */}
                <div className="p-2.5 rounded-xl bg-black/50 border border-cyan-500/20 text-xs font-mono text-slate-200 flex items-start gap-2">
                  <div className="text-[11px] leading-relaxed">
                    {activeRsiStatus.label === "Overbought" && (
                      <span className="text-amber-200">
                        <strong className="text-amber-300 uppercase">
                          Overbought Warning ({activeRsi.toFixed(1)}):
                        </strong>{" "}
                        Stock price has expanded rapidly. High RSI indicates
                        strong momentum, but signals potential short term
                        exhaustion or consolidation risk.
                      </span>
                    )}
                    {activeRsiStatus.label === "Oversold" && (
                      <span className="text-emerald-200">
                        <strong className="text-emerald-300 uppercase">
                          Oversold Signal ({activeRsi.toFixed(1)}):
                        </strong>{" "}
                        Asset has experienced heavy downside pressure. Low RSI
                        indicates selling depletion, highlighting a potential
                        buy dip / rebound opportunity.
                      </span>
                    )}
                    {activeRsiStatus.label === "Neutral" && (
                      <span className="text-slate-300">
                        <strong className="text-cyan-300 uppercase">
                          Balanced Trend ({activeRsi.toFixed(1)}):
                        </strong>{" "}
                        RSI is oscillating smoothly in the 30 to 70 range,
                        reflecting market equilibrium between buyers and
                        sellers.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Moving Average Convergence Divergence (MACD 12, 26, 9) Panel */}
              <div className="p-4 rounded-2xl bg-[#030e1a]/90 border border-cyan-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-cyan-200 uppercase tracking-wider block">
                        MACD Indicator (12, 26, 9)
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Trend Momentum & Moving Average Crossover Signals
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-black font-mono px-2.5 py-1 rounded-xl flex items-center gap-1 border ${macdStatus.color}`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>{macdStatus.label}</span>
                    </span>
                  </div>
                </div>

                {/* MACD Value HUD Bar */}
                <div className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-3 flex-wrap text-[11px]">
                    <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                      <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full" />
                      MACD Line:{" "}
                      <strong className="text-cyan-200">
                        {activeMacd.macd >= 0 ? "+" : ""}
                        {activeMacd.macd.toFixed(2)}
                      </strong>
                    </span>

                    <span className="flex items-center gap-1.5 text-fuchsia-300 font-bold">
                      <span className="w-2.5 h-0.5 bg-fuchsia-400 rounded-full" />
                      Signal Line:{" "}
                      <strong className="text-fuchsia-200">
                        {activeMacd.signal >= 0 ? "+" : ""}
                        {activeMacd.signal.toFixed(2)}
                      </strong>
                    </span>

                    <span className="flex items-center gap-1.5 font-bold">
                      <span
                        className={`w-2.5 h-2.5 rounded-sm ${activeMacd.histogram >= 0 ? "bg-emerald-400" : "bg-rose-500"}`}
                      />
                      Histogram:{" "}
                      <strong
                        className={
                          activeMacd.histogram >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }
                      >
                        {activeMacd.histogram >= 0 ? "+" : ""}
                        {activeMacd.histogram.toFixed(2)}
                      </strong>
                    </span>
                  </div>

                  <span className="text-[10px] text-neutral-400 font-semibold">
                    Zero Line: <strong className="text-white">0.00</strong>
                  </span>
                </div>

                {/* Interactive MACD SVG Chart Stage */}
                <div
                  className="relative w-full h-[110px] select-none touch-none cursor-crosshair overflow-hidden bg-black/40 rounded-xl border border-cyan-500/20"
                  onMouseMove={(e) => handleSubchartHover(e, e.currentTarget)}
                  onTouchMove={(e) => handleSubchartHover(e, e.currentTarget)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <svg
                    viewBox={`0 0 ${svgWidth} ${macdSvgHeight}`}
                    className="w-full h-full overflow-visible"
                  >
                    {/* Zero-line baseline */}
                    <line
                      x1="0"
                      y1={macdY0}
                      x2={plotWidth}
                      y2={macdY0}
                      stroke="rgba(255, 255, 255, 0.25)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />

                    {/* Y-Axis Right Scale Ticks */}
                    <text
                      x={plotWidth + 6}
                      y={16}
                      fill="rgba(255, 255, 255, 0.45)"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      +{macdMaxAbs.toFixed(1)}
                    </text>
                    <text
                      x={plotWidth + 6}
                      y={macdY0 + 3}
                      fill="rgba(255, 255, 255, 0.55)"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      0.0
                    </text>
                    <text
                      x={plotWidth + 6}
                      y={macdSvgHeight - 8}
                      fill="rgba(255, 255, 255, 0.45)"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      -{macdMaxAbs.toFixed(1)}
                    </text>

                    {/* Active Hover vertical guide */}
                    {hoverIndex !== null && (
                      <line
                        x1={
                          (hoverIndex / Math.max(1, macdData.length - 1)) *
                          plotWidth
                        }
                        y1="0"
                        x2={
                          (hoverIndex / Math.max(1, macdData.length - 1)) *
                          plotWidth
                        }
                        y2={macdSvgHeight}
                        stroke="#00f2ff"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Histogram Vertical Bars */}
                    {macdData.map((d, i) => {
                      const x =
                        (i / Math.max(1, macdData.length - 1)) * plotWidth;
                      const barWidth = Math.max(
                        3,
                        Math.min(
                          16,
                          Math.floor(
                            (plotWidth / Math.max(1, macdData.length)) * 0.55,
                          ),
                        ),
                      );
                      const yVal = getMacdY(d.histogram);
                      const yTop = d.histogram >= 0 ? yVal : macdY0;
                      const h = Math.max(1.5, Math.abs(yVal - macdY0));
                      const isPositive = d.histogram >= 0;
                      const color = isPositive ? "#10b981" : "#f43f5e";

                      return (
                        <rect
                          key={`macd-hist-${i}`}
                          x={x - barWidth / 2}
                          y={yTop}
                          width={barWidth}
                          height={h}
                          fill={color}
                          opacity={hoverIndex === i ? 1 : 0.85}
                          rx="1"
                        />
                      );
                    })}

                    {/* MACD Line (Cyan) */}
                    {macdLinePath && (
                      <path
                        d={macdLinePath}
                        fill="none"
                        stroke="#00f2ff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_6px_rgba(0,242,255,0.6)]"
                      />
                    )}

                    {/* Signal Line (Fuchsia) */}
                    {macdSignalPath && (
                      <path
                        d={macdSignalPath}
                        fill="none"
                        stroke="#e879f9"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_6px_rgba(232,121,249,0.5)]"
                      />
                    )}

                    {/* Hover Points on MACD & Signal Lines & Y-Axis Hover Badge */}
                    {hoverIndex !== null && macdData[hoverIndex] && (
                      <g className="pointer-events-none">
                        <circle
                          cx={
                            (hoverIndex / Math.max(1, macdData.length - 1)) *
                            plotWidth
                          }
                          cy={getMacdY(macdData[hoverIndex].macd)}
                          r="3.5"
                          fill="#00f2ff"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx={
                            (hoverIndex / Math.max(1, macdData.length - 1)) *
                            plotWidth
                          }
                          cy={getMacdY(macdData[hoverIndex].signal)}
                          r="3.5"
                          fill="#e879f9"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        {/* Active Right Y-Axis Badge */}
                        <g
                          transform={`translate(${plotWidth + 2}, ${Math.max(4, Math.min(macdSvgHeight - 20, getMacdY(macdData[hoverIndex].macd) - 9))})`}
                        >
                          <rect
                            x="0"
                            y="0"
                            width="58"
                            height="18"
                            rx="4"
                            fill="#0f172a"
                            stroke="#00f2ff"
                            strokeWidth="1.2"
                          />
                          <text
                            x="29"
                            y="12"
                            textAnchor="middle"
                            fill="#00f2ff"
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {macdData[hoverIndex].histogram >= 0 ? "+" : ""}
                            {macdData[hoverIndex].histogram.toFixed(2)}
                          </text>
                        </g>
                      </g>
                    )}
                  </svg>
                </div>

                {/* MACD Signal Explanation Card */}
                <div className="p-2.5 rounded-xl bg-black/50 border border-cyan-500/20 text-xs font-mono text-slate-200 flex items-start gap-2">
                  <div className="text-[11px] leading-relaxed">
                    {activeMacd.histogram >= 0 ? (
                      <span className="text-emerald-200">
                        <strong className="text-emerald-300 uppercase">
                          Bullish Momentum (+{activeMacd.histogram.toFixed(2)}):
                        </strong>{" "}
                        MACD line is trading above the signal line. Positive
                        histogram expansion indicates accelerating upward
                        pressure.
                      </span>
                    ) : (
                      <span className="text-rose-200">
                        <strong className="text-rose-300 uppercase">
                          Bearish Momentum ({activeMacd.histogram.toFixed(2)}):
                        </strong>{" "}
                        MACD line is trading below the signal line. Negative
                        histogram indicates downward pressure or pullbacks.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CORPORATE FINANCIALS / PRIVATE CAPITAL STRUCTURE WIDGET */}
              {isPrivateCompany ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-neutral-900 to-purple-950/50 border border-indigo-500/40 space-y-4 shadow-xl">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                        <Building2 className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                            Private Corporate Capital Structure
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase">
                            Pre-IPO / Reg D
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-sans">
                          Institutional secondary tender disclosures for{" "}
                          <strong className="text-neutral-200">
                            {stock.name} ({stock.symbol})
                          </strong>
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono font-bold text-indigo-300">
                      SEC Reg D Exemption
                    </div>
                  </div>

                  {/* Private Financial Disclosures Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 rounded-xl bg-neutral-950 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>Valuation Method</span>
                        <Landmark className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div>
                        <span className="text-lg font-black font-mono text-white block">
                          Tender Offer Markups
                        </span>
                        <span className="text-[11px] text-neutral-400 font-sans block mt-1">
                          Est. Valuation: <strong className="text-indigo-300">{stock.marketCap || "$350B - $400B"}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>Primary Revenue Engines</span>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-200 block leading-snug">
                          Starlink Orbit Constellation & Launch Manifests
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-1">
                          Starship V3 & Falcon 9 Commercial Payload Contracts
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>SEC Filing Notice</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-400 block">
                          No Public Quarterly SEC EPS
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-1">
                          Private entity. Does not issue public 10-Q SEC reports.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/70 via-neutral-900 to-yellow-950/40 border border-amber-500/30 space-y-4 shadow-xl">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
                        <Calendar className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                            Corporate SEC Earnings Filings
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                            Official Calendar
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-sans">
                          SEC EDGAR quarterly filing tracking & official corporate reports for{" "}
                          <strong className="text-neutral-200">
                            {stock.symbol}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleToggleEarningsReminder}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                        earningsReminder
                          ? "bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20 font-black"
                          : "bg-neutral-900/80 text-amber-300 border-amber-500/30 hover:bg-neutral-800"
                      }`}
                    >
                      {earningsReminder ? (
                        <>
                          <BellRing className="w-3.5 h-3.5 text-black animate-bounce" />
                          <span>Alert Active</span>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5 text-amber-400" />
                          <span>Track Filings</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Public Corporate Filing Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>Filing Status</span>
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-sm font-black text-amber-300 block">
                          Next Fiscal Quarter
                        </span>
                        <span className="text-[11px] text-white block mt-1">
                          Official Date Pending SEC Distribution
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>Price Target Consensus</span>
                        <Target className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div>
                        <span className="text-xl font-black font-mono text-white block">
                          {stock.targetPrice ? `$${stock.targetPrice.toFixed(2)}` : "N/A"}
                        </span>
                        <span className="text-[11px] text-cyan-400 font-bold block mt-1">
                          Rating: {stock.rating || "Moderate Buy"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>Corporate Reporting Policy</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-400 block">
                          Real-time SEC EDGAR Sync
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-1">
                          Official 10-Q & 8-K press releases are updated immediately upon distribution.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LATEST MARKET HEADLINES & NEWS WIRE */}
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-cyan-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                      <Newspaper className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <span>{stock.symbol} Intelligence Wire</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                          Live Feed
                        </span>
                      </h4>
                      <p className="text-[11px] text-neutral-400 font-sans">
                        Real-time news wire, press releases & market sentiment for {stock.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-cyan-400/80 font-bold uppercase block">
                      {tickerHeadlines.length} News Alerts
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {tickerHeadlines.length === 0 ? (
                    <div className="p-4 rounded-xl bg-neutral-950 border border-white/5 text-center text-xs text-neutral-400">
                      No recent news alerts reported for {stock.symbol}.
                    </div>
                  ) : (
                    tickerHeadlines.map((hl) => (
                      <a
                        key={hl.id}
                        href={hl.url || "#"}
                        target={hl.url ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group cursor-pointer block"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                                hl.sentiment === "Bullish"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : hl.sentiment === "Bearish"
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                              }`}
                            >
                              {hl.sentiment}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 font-bold">
                              {hl.source}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              • {hl.timeAgo}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-neutral-200 group-hover:text-cyan-300 transition-colors leading-snug">
                            {hl.title}
                          </h5>
                        </div>
                        <div className="flex items-center text-xs font-mono text-cyan-400 group-hover:translate-x-1 transition-transform self-end sm:self-center shrink-0">
                          <span>Read Article</span>
                          <ExternalLink className="w-3.5 h-3.5 ml-1" />
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>

              {/* ANALYST CONSENSUS WIDGET */}
              {analystConsensusData && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-neutral-900 to-cyan-950/40 border border-emerald-500/30 space-y-4 shadow-xl">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                        <Target className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                            Analyst Consensus & Price Targets
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                            {analystConsensusData.totalAnalysts} Analysts
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-sans">
                          Wall Street rating distribution and consensus price
                          targets for{" "}
                          <strong className="text-neutral-200">
                            {stock.symbol}
                          </strong>
                        </p>
                      </div>
                    </div>

                    {/* Toggle Firm Breakdown Drawer */}
                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        setShowAnalystFirms(!showAnalystFirms);
                      }}
                      className="px-3 py-1.5 rounded-xl border text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 bg-neutral-900/80 text-emerald-300 border-emerald-500/30 hover:bg-neutral-800"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {showAnalystFirms
                          ? "Hide Firm Ratings"
                          : "Wall Street Ratings"}
                      </span>
                      {showAnalystFirms ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Primary Overview Cards: Consensus Rating & Average Price Target */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Consensus Rating Card */}
                    <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/30 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>Consensus Recommendation</span>
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <span
                          className={`inline-block text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${analystConsensusData.labelBadgeColor}`}
                        >
                          {analystConsensusData.consensusLabel}
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-2xl font-black font-mono text-white">
                            {analystConsensusData.consensusScore}
                          </span>
                          <span className="text-xs font-mono text-neutral-400 font-semibold">
                            / 5.0 Rating Score
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Average Price Target Card */}
                    <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>Avg Price Target</span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black font-mono text-emerald-400">
                            ${analystConsensusData.avgPriceTarget.toFixed(2)}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            +{analystConsensusData.upsidePercent}% Upside
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-neutral-400 block mt-1">
                          Current:{" "}
                          <strong className="text-white">
                            ${analystConsensusData.currentPrice.toFixed(2)}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Target Range (Low vs High) */}
                    <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>Price Target Range</span>
                        <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="text-rose-400 font-bold">
                            Low: $
                            {analystConsensusData.lowPriceTarget.toFixed(2)}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            High: $
                            {analystConsensusData.highPriceTarget.toFixed(2)}
                          </span>
                        </div>
                        {/* Range slider visual representation */}
                        <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden relative border border-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400"
                            style={{ width: "100%" }}
                          />
                        </div>
                        <p className="text-[10px] text-neutral-400 text-center font-mono">
                          Wall Street Spread: $
                          {(
                            analystConsensusData.highPriceTarget -
                            analystConsensusData.lowPriceTarget
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rating Distribution Visual Bar & Counts */}
                  <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          Rating Breakdown ({analystConsensusData.totalAnalysts}{" "}
                          Total Analysts)
                        </span>
                      </span>
                    </div>

                    {/* Stacked Percentage Bar */}
                    <div className="w-full h-3 rounded-full bg-neutral-900 overflow-hidden flex border border-white/10">
                      {analystConsensusData.strongBuyPct > 0 && (
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{
                            width: `${analystConsensusData.strongBuyPct}%`,
                          }}
                          title={`Strong Buy: ${analystConsensusData.strongBuyCount} (${analystConsensusData.strongBuyPct}%)`}
                        />
                      )}
                      {analystConsensusData.buyPct > 0 && (
                        <div
                          className="h-full bg-emerald-400/80 transition-all duration-300"
                          style={{ width: `${analystConsensusData.buyPct}%` }}
                          title={`Buy: ${analystConsensusData.buyCount} (${analystConsensusData.buyPct}%)`}
                        />
                      )}
                      {analystConsensusData.holdPct > 0 && (
                        <div
                          className="h-full bg-amber-400 transition-all duration-300"
                          style={{ width: `${analystConsensusData.holdPct}%` }}
                          title={`Hold: ${analystConsensusData.holdCount} (${analystConsensusData.holdPct}%)`}
                        />
                      )}
                      {analystConsensusData.sellPct > 0 && (
                        <div
                          className="h-full bg-orange-500 transition-all duration-300"
                          style={{ width: `${analystConsensusData.sellPct}%` }}
                          title={`Sell: ${analystConsensusData.sellCount} (${analystConsensusData.sellPct}%)`}
                        />
                      )}
                      {analystConsensusData.strongSellPct > 0 && (
                        <div
                          className="h-full bg-rose-500 transition-all duration-300"
                          style={{
                            width: `${analystConsensusData.strongSellPct}%`,
                          }}
                          title={`Strong Sell: ${analystConsensusData.strongSellCount} (${analystConsensusData.strongSellPct}%)`}
                        />
                      )}
                    </div>

                    {/* Interactive Legend Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px]">
                      <div className="p-2 rounded-lg bg-neutral-900 border border-emerald-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-neutral-300 font-bold">
                            Strong Buy
                          </span>
                        </div>
                        <span className="font-extrabold text-emerald-400">
                          {analystConsensusData.strongBuyCount}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-neutral-900 border border-emerald-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                          <span className="text-neutral-300 font-bold">
                            Buy
                          </span>
                        </div>
                        <span className="font-extrabold text-emerald-300">
                          {analystConsensusData.buyCount}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-neutral-900 border border-amber-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <span className="text-neutral-300 font-bold">
                            Hold
                          </span>
                        </div>
                        <span className="font-extrabold text-amber-400">
                          {analystConsensusData.holdCount}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-neutral-900 border border-orange-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          <span className="text-neutral-300 font-bold">
                            Sell
                          </span>
                        </div>
                        <span className="font-extrabold text-orange-400">
                          {analystConsensusData.sellCount}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-neutral-900 border border-rose-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span className="text-neutral-300 font-bold">
                            Strong Sell
                          </span>
                        </div>
                        <span className="font-extrabold text-rose-400">
                          {analystConsensusData.strongSellCount}
                        </span>
                      </div>
                    </div>

                    {/* Wall Street Firm Ratings Drawer */}
                    {showAnalystFirms && (
                      <div className="pt-3 border-t border-white/10 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider block">
                          Recent Major Wall Street Firm Price Targets
                        </span>
                        <div className="space-y-1.5 font-mono text-[11px]">
                          {analystConsensusData.firms.map((firm) => (
                            <div
                              key={firm.name}
                              className="p-2.5 rounded-lg bg-neutral-900 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-emerald-400" />
                                <div>
                                  <span className="font-bold text-white block">
                                    {firm.name}
                                  </span>
                                  <span className="text-[10px] text-neutral-400">
                                    {firm.analyst} • {firm.date}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] px-2 py-0.5 rounded font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  {firm.rating}
                                </span>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white block">
                                    ${firm.target}
                                  </span>
                                  <span className="text-[9px] text-emerald-400 font-bold uppercase">
                                    {firm.action}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Key Statistics Grid */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                  Key Metrics
                </h4>

                {/* Asymmetry Matrix Banner if applicable */}
                {(stock.asymmetryPotentialStars !== undefined ||
                  stock.probabilityOfSuccess) && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {stock.asymmetryPotentialStars !== undefined && (
                      <div>
                        <span className="text-[10px] text-amber-400/80 font-mono font-bold uppercase block">
                          Asymmetry Upside Potential
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-amber-300 font-extrabold text-sm">
                            {"★".repeat(
                              Math.floor(stock.asymmetryPotentialStars),
                            )}
                            {stock.asymmetryPotentialStars % 1 !== 0 ? "½" : ""}
                          </span>
                          <span className="text-amber-200 font-mono font-black text-xs">
                            ({stock.asymmetryPotentialStars} Stars)
                          </span>
                        </div>
                      </div>
                    )}

                    {stock.probabilityOfSuccess && (
                      <div>
                        <span className="text-[10px] text-amber-400/80 font-mono font-bold uppercase block">
                          Probability of Success
                        </span>
                        <span className="text-emerald-400 font-mono font-black text-xs mt-0.5 block">
                          {stock.probabilityOfSuccess}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[11px] text-neutral-400 font-medium">
                      Market Cap
                    </p>
                    <p className="text-base font-bold font-mono text-white mt-0.5">
                      {stock.marketCap}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[11px] text-neutral-400 font-medium">
                      Volume
                    </p>
                    <p className="text-base font-bold font-mono text-white mt-0.5">
                      {stock.volume}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[11px] text-neutral-400 font-medium">
                      52W High
                    </p>
                    <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                      ${stock.high52.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[11px] text-neutral-400 font-medium">
                      52W Low
                    </p>
                    <p className="text-base font-bold font-mono text-rose-400 mt-0.5">
                      ${stock.low52.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 col-span-2 sm:col-span-1">
                    <p className="text-[11px] text-cyan-300 font-medium flex items-center justify-between">
                      <span>RSI (14)</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          rsiData.status === "Overbought"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : rsiData.status === "Oversold"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        }`}
                      >
                        {rsiData.status}
                      </span>
                    </p>
                    <p
                      className={`text-base font-black font-mono mt-0.5 ${
                        rsiData.status === "Overbought"
                          ? "text-amber-300"
                          : rsiData.status === "Oversold"
                            ? "text-emerald-300"
                            : "text-cyan-200"
                      }`}
                    >
                      {rsiData.rsi.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* INSTITUTIONAL OWNERSHIP % & SMART-MONEY ACTIVITY SECTION */}
              {institutionalData && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-neutral-900 to-slate-950/80 border border-indigo-500/30 space-y-4 shadow-xl">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                        <Landmark className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                            Institutional Ownership & Smart-Money Flow
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                            SEC 13F
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-sans">
                          Hedge fund, ETF, and sovereign fund holdings tracking
                          for{" "}
                          <strong className="text-neutral-200">
                            {stock.symbol}
                          </strong>
                        </p>
                      </div>
                    </div>

                    {/* Flow Sentiment & Conviction Badges */}
                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      <div className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-xs font-mono font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Conviction:</span>
                        <span className="text-white font-black">
                          {institutionalData.smartMoneyConvictionScore}/10
                        </span>
                      </div>

                      <div
                        className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border flex items-center gap-1 ${
                          institutionalData.flowSentiment === "Accumulation"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : institutionalData.flowSentiment === "Distribution"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="uppercase">
                          {institutionalData.flowSentiment}
                        </span>
                        <span className="text-[10px] opacity-80">
                          ({institutionalData.quarterlyNetFlow})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Core Institutional Metrics KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {/* Institutional Ownership % */}
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-indigo-500/30 space-y-1.5 relative overflow-hidden">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>Institutional Own %</span>
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-black font-mono text-cyan-300">
                          {institutionalData.ownershipPercent.toFixed(1)}%
                        </span>
                      </div>
                      {/* Small progress meter */}
                      <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                          style={{
                            width: `${Math.min(100, institutionalData.ownershipPercent)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[9px] text-neutral-400 font-mono block">
                        {institutionalData.ownershipPercent > 70
                          ? "High Smart-Money Support"
                          : "Moderate Institutional Support"}
                      </span>
                    </div>

                    {/* Active Funds Count */}
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>Total Institutions</span>
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <span className="text-lg sm:text-xl font-black font-mono text-white block">
                        {institutionalData.holdersCount.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-neutral-400 font-mono block">
                        Filing SEC Form 13F
                      </span>
                    </div>

                    {/* 13F Value Held */}
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>13F Position Value</span>
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span className="text-lg sm:text-xl font-black font-mono text-emerald-400 block">
                        {institutionalData.totalValue}
                      </span>
                      <span className="text-[9px] text-neutral-400 font-mono block truncate">
                        {institutionalData.sharesHeld} Shares
                      </span>
                    </div>

                    {/* Quarterly Net Flow */}
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span>Q/Q Smart Flow</span>
                        <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <span
                        className={`text-lg sm:text-xl font-black font-mono block ${
                          institutionalData.quarterlyNetFlow.startsWith("+")
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {institutionalData.quarterlyNetFlow}
                      </span>
                      <span className="text-[9px] text-neutral-400 font-mono block truncate">
                        {institutionalData.buyersCount} Buyers /{" "}
                        {institutionalData.sellersCount} Sellers
                      </span>
                    </div>
                  </div>

                  {/* Ownership Distribution Spectrum Bar */}
                  <div className="p-3.5 rounded-xl bg-black/60 border border-indigo-500/20 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-neutral-200 uppercase tracking-wider text-[11px]">
                        Shareholder Structure Breakdown
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        100% Total Shares
                      </span>
                    </div>

                    {/* Multi-segment Progress Bar */}
                    <div className="w-full h-3.5 rounded-full bg-neutral-900 overflow-hidden flex border border-white/10 p-0.5 gap-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-l-full transition-all duration-500"
                        style={{
                          width: `${institutionalData.ownershipPercent}%`,
                        }}
                        title={`Institutions: ${institutionalData.ownershipPercent}%`}
                      />
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                        style={{
                          width: `${institutionalData.insiderOwnershipPercent}%`,
                        }}
                        title={`Insiders & Officers: ${institutionalData.insiderOwnershipPercent}%`}
                      />
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-r-full transition-all duration-500"
                        style={{
                          width: `${institutionalData.retailOwnershipPercent}%`,
                        }}
                        title={`Public & Retail: ${institutionalData.retailOwnershipPercent}%`}
                      />
                    </div>

                    {/* Spectrum Legend Pills */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
                        <span className="text-neutral-300 font-bold">
                          Institutional:
                        </span>
                        <span className="text-cyan-300 font-black">
                          {institutionalData.ownershipPercent.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                        <span className="text-neutral-300 font-bold">
                          Insiders/Execs:
                        </span>
                        <span className="text-emerald-300 font-black">
                          {institutionalData.insiderOwnershipPercent.toFixed(1)}
                          %
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7]" />
                        <span className="text-neutral-300 font-bold">
                          Retail / Public:
                        </span>
                        <span className="text-purple-300 font-black">
                          {institutionalData.retailOwnershipPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Institutional Buyers vs Sellers Heat Bar */}
                  <div className="p-3 rounded-xl bg-neutral-950 border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>
                          {institutionalData.buyersCount} Accumulating
                          Institutions (
                          {Math.round(
                            (institutionalData.buyersCount /
                              (institutionalData.buyersCount +
                                institutionalData.sellersCount)) *
                              100,
                          )}
                          %)
                        </span>
                      </span>
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <span>
                          {institutionalData.sellersCount} Trimming (
                          {Math.round(
                            (institutionalData.sellersCount /
                              (institutionalData.buyersCount +
                                institutionalData.sellersCount)) *
                              100,
                          )}
                          %)
                        </span>
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-rose-950/80 overflow-hidden flex border border-white/10">
                      <div
                        className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                        style={{
                          width: `${(institutionalData.buyersCount / (institutionalData.buyersCount + institutionalData.sellersCount)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Top Institutional Holders List */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-neutral-300 tracking-wider flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-indigo-400" />
                        Top Institutional Holders ({stock.symbol})
                      </span>
                      <button
                        onClick={() => {
                          triggerHaptic("selection");
                          setShowAllInstitutionalHolders(
                            !showAllInstitutionalHolders,
                          );
                        }}
                        className="text-[11px] font-bold text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>
                          {showAllInstitutionalHolders
                            ? "Show Less"
                            : "View All Funds"}
                        </span>
                        {showAllInstitutionalHolders ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {(showAllInstitutionalHolders
                        ? institutionalData.topHolders
                        : institutionalData.topHolders.slice(0, 3)
                      ).map((holder, idx) => (
                        <div
                          key={holder.name}
                          className="p-3 rounded-xl bg-black/60 border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <div>
                              <span className="font-extrabold text-white text-xs block font-sans">
                                {holder.name}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono block">
                                {holder.shares} Shares • Port Weight:{" "}
                                <strong className="text-cyan-300">
                                  {holder.portfolioWeight}
                                </strong>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
                            <div className="text-left sm:text-right">
                              <span className="font-black text-emerald-400 text-xs block">
                                {holder.value}
                              </span>
                              <span className="text-[9px] text-neutral-500 uppercase block">
                                13F Position Value
                              </span>
                            </div>

                            <span
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border uppercase shrink-0 ${
                                holder.changeType === "INCREASED" ||
                                holder.changeType === "NEW"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : holder.changeType === "DECREASED"
                                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                    : "bg-neutral-800 text-neutral-300 border-neutral-700"
                              }`}
                            >
                              {holder.changePercent}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Smart Money Insight Box */}
                  <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2 leading-relaxed">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white uppercase font-mono text-[11px] block mb-0.5">
                        Smart-Money Structural Analysis:
                      </strong>
                      With{" "}
                      <span className="text-cyan-300 font-extrabold font-mono">
                        {institutionalData.ownershipPercent.toFixed(1)}%
                      </span>{" "}
                      of floating shares backed by tier-1 institutional asset
                      managers (
                      {institutionalData.holdersCount.toLocaleString()} funds),{" "}
                      {stock.symbol} benefits from strong long term liquidity
                      and institutional floor support during broader market
                      pullbacks.
                    </div>
                  </div>
                </div>
              )}
              <SentimentIndicator stock={stock} compact={false} />

              {/* Stock Bloc Market Intelligence Module */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-neutral-900 to-emerald-950/30 border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Stock Bloc Market Intelligence</span>
                  </div>
                  {!aiAnalysis && !aiError && (
                    <button
                      onClick={fetchAiAnalysis}
                      disabled={isAiLoading}
                      className="px-3 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isAiLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <span>Generate Live Brief</span>
                      )}
                    </button>
                  )}
                </div>

                {isAiLoading && (
                  <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/30 text-xs text-neutral-300 space-y-3.5 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      </div>
                      <div>
                        <p className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                          <span>
                            Analyzing {stock.symbol} Market Intelligence...
                          </span>
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Evaluating catalyst drivers, memory/grid CapEx, and
                          sentiment score
                        </p>
                      </div>
                    </div>

                    {/* Skeleton lines representing incoming response */}
                    <div className="space-y-2 pt-1 border-t border-white/5">
                      <div className="h-3.5 bg-cyan-950/60 rounded-md w-3/4 border border-cyan-500/10"></div>
                      <div className="h-3 bg-neutral-800/80 rounded-md w-full"></div>
                      <div className="h-3 bg-neutral-800/80 rounded-md w-11/12"></div>
                      <div className="h-3 bg-neutral-800/80 rounded-md w-4/5"></div>
                      <div className="flex gap-2 pt-1">
                        <div className="h-5 bg-cyan-900/40 border border-cyan-500/20 rounded-full w-24"></div>
                        <div className="h-5 bg-emerald-900/40 border border-emerald-500/20 rounded-full w-28"></div>
                      </div>
                    </div>
                  </div>
                )}

                {aiError && !isAiLoading && (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white">
                          {" "}
                          Analysis Generation Failed
                        </p>
                        <p className="text-[11px] text-rose-300/80">
                          {aiError}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={fetchAiAnalysis}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Retry Analysis</span>
                    </button>
                  </div>
                )}

                {aiAnalysis && !isAiLoading && (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-neutral-200 space-y-2 leading-relaxed relative">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        Verified Quantitative Report • {stock.symbol}
                      </span>
                      <button
                        onClick={fetchAiAnalysis}
                        disabled={isAiLoading}
                        title="Re-run Analysis"
                        className="text-neutral-400 hover:text-cyan-300 transition-colors p-1 rounded hover:bg-white/5 flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Refresh</span>
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap font-sans">
                      {aiAnalysis}
                    </div>
                  </div>
                )}

                {!aiAnalysis && !isAiLoading && !aiError && (
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Tap{" "}
                    <span className="text-cyan-300 font-semibold">
                      "Generate Live Brief"
                    </span>{" "}
                    to run Gemini quantitative analysis for catalyst drivers,
                    memory/grid hardware demand, and sentiment score.
                  </p>
                )}
              </div>

              {/* About / Description */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                  About {stock.name}
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed font-normal bg-white/5 p-4 rounded-2xl border border-white/5">
                  {stock.description}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
