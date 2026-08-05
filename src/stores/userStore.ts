import { create } from 'zustand';

interface UserState {
  isDayMode: boolean;
  setIsDayMode: (isDayMode: boolean) => void;
  watchlistSubTab: "tickers" | "briefs";
  setWatchlistSubTab: (tab: "tickers" | "briefs") => void;
  userPlan: "free" | "pro" | "institutional";
  setUserPlan: (plan: "free" | "pro" | "institutional") => void;
}

const getInitialDayMode = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem("sb_theme_pref");
    if (stored) return stored === "light";
  }
  return false;
};

export const useUserStore = create<UserState>((set) => ({
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
}));
