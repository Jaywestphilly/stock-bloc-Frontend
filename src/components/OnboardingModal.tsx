import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StockBlocLogo } from "./StockBlocLogo";
import {
  TrendingUp,
  Layers,
  Orbit,
  Command,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  ShieldAlert,
  SlidersHorizontal,
  Calendar,
} from "lucide-react";
import { triggerHaptic } from "../utils/haptics";
import { isAgentOrHeadless } from "../utils/agentDetection";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tabId: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  const handleFinish = () => {
    triggerHaptic("success");
    try {
      localStorage.setItem("stock_bloc_onboarding_dismissed", "true");
    } catch (e) {
      console.warn("Unable to save onboarding state", e);
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen && isAgentOrHeadless()) {
      handleFinish();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleFinish();
          }
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md font-mono select-none overflow-y-auto cursor-pointer"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative max-w-2xl w-full bg-[#030d17] border-2 border-cyan-500/50 alien-block-cut p-5 sm:p-7 shadow-2xl text-white space-y-6 cursor-default"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
            <div className="flex items-center gap-3">
              <StockBlocLogo size="sm" showText={false} />
              <div>
                <span className="text-xs font-black uppercase text-amber-300 tracking-wider block">
                  FIRST-TIME USER ONBOARDING // STEP 0{step} OF 02
                </span>
                <h2 className="text-base sm:text-lg font-black text-white font-mono uppercase tracking-wider">
                  Welcome to Stock Bloc Quant Terminal
                </h2>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic("selection");
                handleFinish();
              }}
              className="p-1.5 rounded-xl bg-black/60 border border-cyan-500/40 text-neutral-300 hover:text-white hover:border-cyan-400 transition-all cursor-pointer"
              title="Close Onboarding permanently"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* STEP 1 CONTENT */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 font-sans"
            >
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed font-mono">
                Stock Bloc is an institutional-grade quantitative wealth workstation built for individual investors. Democratizing real-time market momentum, SEC 13F whale disclosures, credit score mastery, and space economy hardware telemetry.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab("watchlist");
                    handleFinish();
                  }}
                  className="p-3.5 rounded-2xl bg-black/60 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-cyan-300 font-mono font-bold">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      1. Markets & Watchlist
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      LIVE DATA
                    </span>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    Sort equities by RSI momentum, price change %, volume, or market cap. View inline sparklines & export CSV watchlists instantly.
                  </p>
                </div>

                <div
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab("intelligence");
                    handleFinish();
                  }}
                  className="p-3.5 rounded-2xl bg-black/60 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-cyan-300 font-mono font-bold">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-purple-400" />
                      2. 13F Hedge Fund Intel
                    </span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                      SEC EDGAR
                    </span>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    Track institutional holdings from Berkshire, Citadel, & Scion. Filter by manager, QoQ position shifts, & asset allocation charts.
                  </p>
                </div>

                <div
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab("dyson_swarm");
                    handleFinish();
                  }}
                  className="p-3.5 rounded-2xl bg-black/60 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-cyan-300 font-mono font-bold">
                    <span className="flex items-center gap-1.5">
                      <Orbit className="w-4 h-4 text-amber-400" />
                      3. Dyson Swarm Energy
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                      SPACEX LIVE
                    </span>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    Real-time SpaceX launch countdowns, live stream pop-ups, public space economy stock correlations, and orbital roadmap phases.
                  </p>
                </div>

                <div
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab("macro");
                    handleFinish();
                  }}
                  className="p-3.5 rounded-2xl bg-black/60 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-cyan-300 font-mono font-bold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      4. Macro Briefings & Cal
                    </span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      FED / CPI
                    </span>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    Track FOMC rate decisions and CPI events with Expected vs. Actual metrics. Export calendar events to Google Cal or .ICS files.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2 CONTENT */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 font-sans"
            >
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 leading-relaxed font-mono flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Pro Tip: Command Palette & Global Keyboard Shortcuts are available anywhere on the platform!
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 font-mono font-bold rounded border border-cyan-500/40 text-[11px]">
                      Cmd + K or /
                    </span>
                    <span className="text-neutral-200 text-xs font-semibold">
                      Universal Command Palette
                    </span>
                  </div>
                  <span className="text-neutral-400 text-[11px]">Instant Ticker & Hub Search</span>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                    <span className="text-neutral-200 text-xs font-semibold">
                      Column Sorting & Direction Toggle
                    </span>
                  </div>
                  <span className="text-neutral-400 text-[11px]">Click % Change, Volume, RSI</span>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="text-neutral-200 text-xs font-semibold">
                      Educational & Legal Disclaimer
                    </span>
                  </div>
                  <span className="text-neutral-400 text-[11px]">Educational info only — not advice</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-neutral-300 font-mono">
                <span className="text-cyan-400 font-bold block mb-1">
                  OFFLINE & API RATE-LIMIT FALLBACK:
                </span>
                If third-party telemetry or Yahoo Finance APIs experience downtime, Stock Bloc automatically switches to verified offline baselines so your terminal never breaks.
              </div>
            </motion.div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-cyan-500/30 pt-4 font-mono">
            {step === 2 ? (
              <button
                onClick={() => {
                  triggerHaptic("selection");
                  setStep(1);
                }}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/20 text-neutral-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-3.5 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 hover:text-white hover:bg-cyan-900 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950/40"
              >
                <X className="w-3.5 h-3.5 text-cyan-400" />
                <span>Skip Onboarding</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400">Step {step} of 2</span>
              {step === 1 ? (
                <button
                  onClick={() => {
                    triggerHaptic("selection");
                    setStep(2);
                  }}
                  className="px-4 py-2 alien-block-cut-sm bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-cyan-400/20"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-4 py-2 alien-block-cut-sm bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-emerald-400/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>EXPLORE TERMINAL NOW</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
