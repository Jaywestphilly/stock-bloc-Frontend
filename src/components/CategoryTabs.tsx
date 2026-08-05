import React from "react";
import { SectorCategory, SortField } from "../types";
import {
  ChevronDown,
  Flame,
  Building2,
  CreditCard,
  Cpu,
  MemoryStick,
  Zap,
  LineChart,
  Sparkles,
  Star,
} from "lucide-react";
import { triggerHaptic } from "../utils/haptics";

interface CategoryTabsProps {
  selectedCategory: SectorCategory | "all";
  onSelectCategory: (cat: SectorCategory | "all") => void;
  itemCount: number;
  sortField: SortField;
  onSelectSort: (field: SortField) => void;
  titleOverride?: string;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
  itemCount,
  sortField,
  onSelectSort,
  titleOverride,
}) => {
  const categories: {
    id: SectorCategory | "all";
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: "tsunami", label: "Super sonic Tsunami", icon: Flame },
    { id: "all", label: "All Watchlist", icon: Sparkles },
    { id: "asymmetry", label: "Max Asymmetry", icon: Star },
    { id: "reits", label: "Real Estate REITs", icon: Building2 },
    { id: "credit_fin", label: "Credit & FinTech", icon: CreditCard },
    { id: "ai_infra", label: " Infrastructure", icon: Cpu },
    { id: "memory", label: "Memory & Chips", icon: MemoryStick },
    { id: "energy", label: "Energy & Grid", icon: Zap },
    { id: "indexes", label: "Indexes & Tech", icon: LineChart },
  ];

  const getCategoryTitle = () => {
    if (titleOverride) return titleOverride;
    switch (selectedCategory) {
      case "all":
        return "All Watchlist Stocks";
      case "asymmetry":
        return "Maximum Asymmetry Upside Matrix";
      case "tsunami":
        return "Super sonic Tsunami";
      case "reits":
        return "Real Estate REITs";
      case "credit_fin":
        return "Credit & FinTech";
      case "ai_infra":
        return " Infra & Cloud";
      case "memory":
        return "Memory Chips & Hardware";
      case "energy":
        return "Energy, Grid & Power";
      case "indexes":
        return "Indexes & Cryptos";
      default:
        return "All Market Blocs";
    }
  };

  return (
    <div className="w-full px-4 pt-3 pb-2 space-y-3 font-mono">
      {/* Category Scroll Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic("selection");
                onSelectCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 alien-block-cut-sm font-black transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                isActive
                  ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/30 border border-cyan-200"
                  : "bg-neutral-900 hover:bg-neutral-800 text-cyan-400/80 hover:text-white border border-cyan-500/30"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-cyan-400"}`}
              />
              <span className="uppercase text-[11px] font-tech tracking-wider">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* List Title & Sort Selector */}
      <div className="flex items-end justify-between pt-1 pb-1 border-b border-cyan-500/20 pb-2">
        <div>
          <h2 className="text-xl font-black font-mono tracking-wider text-cyan-100 uppercase leading-tight flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 inline-block animate-ping" />
            {getCategoryTitle()}
          </h2>
          <p className="text-[10px] text-cyan-400/70 font-mono">
            // {itemCount} ASSETS MONITORED IN QUANT MATRIX
          </p>
        </div>

        {/* Sort Pill Dropdown */}
        <div className="relative group">
          <select
            value={sortField}
            onChange={(e) => {
              triggerHaptic("selection");
              onSelectSort(e.target.value as SortField);
            }}
            className="appearance-none bg-[#030d16] hover:bg-cyan-950 text-cyan-300 font-black text-xs px-3 py-1.5 pr-7 alien-block-cut-sm border border-cyan-500/40 focus:outline-none cursor-pointer shadow-md transition-all uppercase tracking-wider"
          >
            <option value="changePercent">Price Change %</option>
            <option value="volatility">⚡ Volatility</option>
            <option value="volume">📊 Volume</option>
            <option value="marketCap">🏢 Market Cap</option>
            <option value="rsi">📈 RSI Indicator</option>
            <option value="asymmetry">★ Asymmetry Rating</option>
            <option value="price">Price $</option>
            <option value="name">Ticker Name</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
