import { create } from 'zustand';

interface UserState {
  isDayMode: boolean;
  setIsDayMode: (isDayMode: boolean) => void;
  watchlistSubTab: "tickers" | "briefs";
  setWatchlistSubTab: (tab: "tickers" | "briefs") => void;
  userPlan: "free" | "pro" | "institutional";
  setUserPlan: (plan: "free" | "pro" | "institutional") => void;
  starredTickers: string[];
  toggleStarredTicker: (symbol: string) => void;
}

const getInitialDayMode = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem("sb_theme_pref");
    if (stored) return stored === "light";
  }
  return false;
};

const getInitialStarredTickers = () => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem("stock_bloc_saved");
      if (stored) return JSON.parse(stored) as string[];
    } catch (e) {
      console.error("Error parsing stock_bloc_saved from localStorage", e);
    }
  }
  return [];
};

export const useUserStore = create<UserState>((set, get) => ({
  isDayMode: getInitialDayMode(),
  setIsDayMode: (isDayMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("sb_theme_pref", isDayMode ? "light" : "dark");
    }
    set({ isDayMode });
  },
  watchlistSubTab: "tickers",
  setWatchlistSubTab: (watchlistSubTab) => set({ watchlistSubTab }),
  userPlan: "free",
  setUserPlan: (userPlan) => set({ userPlan }),
  starredTickers: getInitialStarredTickers(),
  toggleStarredTicker: (symbol) => {
    const { starredTickers } = get();
    const isStarred = starredTickers.includes(symbol);
    const updated = isStarred 
      ? starredTickers.filter(s => s !== symbol)
      : [...starredTickers, symbol];
    
    if (typeof window !== 'undefined') {
      localStorage.setItem("stock_bloc_saved", JSON.stringify(updated));
    }
    set({ starredTickers: updated });
  }
}));
