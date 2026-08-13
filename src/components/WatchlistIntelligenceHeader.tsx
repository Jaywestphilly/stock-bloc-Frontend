import React from "react";
import { SortField } from "../types";
import {
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Zap,
  TrendingUp,
  BarChart3,
  DollarSign
} from "lucide-react";
import { getMarketOpenStatus, getStockDataFreshness } from "../utils/signalCalculator";
import { triggerHaptic } from "../utils/haptics";

interface WatchlistIntelligenceHeaderProps {
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  sortField: SortField;
  setSortField: (field: any) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (dir: "asc" | "desc") => void;
  isSyncing: boolean;
  onRefresh: () => void;
  marketDataUpdatedAt: string | null;
  marketDataSource: string | null;
  marketDataIsStale: boolean;
  totalStocks: number;
}

export const WatchlistIntelligenceHeader: React.FC<WatchlistIntelligenceHeaderProps> = ({
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  isSyncing,
  onRefresh,
  marketDataUpdatedAt,
  marketDataSource,
  marketDataIsStale,
  totalStocks,
}) => {
  const marketOpen = getMarketOpenStatus();
  const freshness = getStockDataFreshness(marketDataUpdatedAt);

  return (
    <div className="w-full space-y-3 px-4 py-2 font-mono">
      {/* Top Banner: Market Status, Feed Source, Data Freshness & Manual Refresh */}
      <div className="p-3.5 rounded-2xl bg-[#020d18] border border-cyan-500/40 shadow-xl shadow-cyan-950/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Market Status Pill */}
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase flex items-center gap-1.5 ${marketOpen.colorClass}`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>{marketOpen.statusText}</span>
            </span>

            {/* Freshness Badge */}
            <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 ${freshness.badgeClass}`}>
              <Clock className="w-3 h-3 text-current" />
              <span>{freshness.label} ({freshness.ageText})</span>
            </span>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={() => {
              triggerHaptic("refresh");
              onRefresh();
            }}
            disabled={isSyncing}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing Market Feed..." : "Sync Live Prices"}</span>
          </button>
        </div>

        {/* Metadata Row: Source & Timestamp */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-cyan-400/80 pt-2 border-t border-cyan-900/50">
          <div className="flex items-center gap-2">
            <span className="text-cyan-500/70">FEED PROVIDER:</span>
            <span className="font-bold text-cyan-200">{marketDataSource || "Alpha Vantage Quant API"}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-cyan-500/70">LAST VERIFIED:</span>
            <span className="font-bold text-neutral-200">
              {marketDataUpdatedAt ? new Date(marketDataUpdatedAt).toLocaleTimeString() : "Recent Session"}
            </span>
          </div>
        </div>

        {/* Error / Stale Warning Banners */}
        {marketDataIsStale && (
          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Market Data Stale:</strong> Showing last verified snapshot ({freshness.minutesAgo} min ago). Live market pipeline active.
            </span>
          </div>
        )}

        {totalStocks === 0 && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Market data temporarily unavailable. Click <strong>Sync Live Prices</strong> to reload verified feed.</span>
          </div>
        )}
      </div>

      {/* Sort Controls Bar */}
      <div className="p-3 rounded-2xl bg-[#03111f] border border-cyan-900/60 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Sort Direction Toggle */}
          <button
            onClick={() => {
              triggerHaptic("selection");
              setSortDirection(sortDirection === "desc" ? "asc" : "desc");
            }}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ml-auto"
            title="Toggle High-to-Low or Low-to-High"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>{sortDirection === "desc" ? "HIGH → LOW" : "LOW → HIGH"}</span>
          </button>
        </div>

        {/* Quick Sorting Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
          <span className="text-cyan-500/70 text-[10px] font-bold uppercase shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
            Sort By:
          </span>

          <button
            onClick={() => { setSortField("changePercent"); triggerHaptic("selection"); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all flex items-center gap-1 border ${
              sortField === "changePercent"
                ? "bg-cyan-500 text-black border-cyan-400 shadow-md"
                : "bg-black/40 text-cyan-300 border-cyan-900/60 hover:border-cyan-500/40"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Daily %</span>
          </button>

          <button
            onClick={() => { setSortField("volume"); triggerHaptic("selection"); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all flex items-center gap-1 border ${
              sortField === "volume"
                ? "bg-cyan-500 text-black border-cyan-400 shadow-md"
                : "bg-black/40 text-cyan-300 border-cyan-900/60 hover:border-cyan-500/40"
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Volume</span>
          </button>

          <button
            onClick={() => { setSortField("marketCap"); triggerHaptic("selection"); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all flex items-center gap-1 border ${
              sortField === "marketCap"
                ? "bg-cyan-500 text-black border-cyan-400 shadow-md"
                : "bg-black/40 text-cyan-300 border-cyan-900/60 hover:border-cyan-500/40"
            }`}
          >
            <DollarSign className="w-3 h-3" />
            <span>Market Cap</span>
          </button>
        </div>
      </div>
    </div>
  );
};
