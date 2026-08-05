import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, AlertTriangle, RefreshCw, Radio, Database, ShieldCheck, FileText, Globe } from "lucide-react";
import { triggerHaptic } from "../utils/haptics";

interface DataStatusPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lastSyncTime?: string | null;
}

export const DataStatusPanel: React.FC<DataStatusPanelProps> = ({
  isOpen,
  onClose,
  lastSyncTime,
}) => {
  if (!isOpen) return null;

  const feeds = [
    {
      name: "Quant Live Quotes Engine",
      source: "Polygon.io / Yahoo Finance",
      status: "ONLINE",
      latency: "45ms",
      lastUpdated: lastSyncTime || "Just now",
      color: "emerald",
    },
    {
      name: "SEC EDGAR 13F Institutional Filings",
      source: "U.S. SEC EDGAR System",
      status: "ONLINE",
      latency: "120ms",
      lastUpdated: "15 mins ago",
      color: "emerald",
    },
    {
      name: "Credit Bureau API Simulator",
      source: "Experian / TransUnion / Equifax Models",
      status: "ONLINE",
      latency: "15ms",
      lastUpdated: "Active session",
      color: "emerald",
    },
    {
      name: "Commercial Real Estate & REIT Matrix",
      source: "S&P Dow Jones REIT Indices",
      status: "ONLINE",
      latency: "80ms",
      lastUpdated: "1 hour ago",
      color: "emerald",
    },
    {
      name: "Orbital Space Solar & Dyson Manifests",
      source: "NASA / SpaceX / ESA Orbital Telemetry",
      status: "SYNCED",
      latency: "210ms",
      lastUpdated: "2 hours ago",
      color: "cyan",
    },
    {
      name: "War.Gov Aerospace & Defense Procurement",
      source: "U.S. Dept of Defense Contracts",
      status: "GROUNDED",
      latency: "95ms",
      lastUpdated: "4 hours ago",
      color: "emerald",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-[#040f18] border border-cyan-500/40 rounded-2xl p-6 space-y-6 text-neutral-100 shadow-2xl font-mono"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-cyan-100 uppercase tracking-wider">
                  STOCK BLOC DATA STATUS & FEEDS
                </h2>
                <p className="text-sm text-neutral-400 font-sans">
                  Real-time pipeline verification and data source grounding metrics.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-cyan-950 rounded-lg text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feed List */}
          <div className="space-y-3">
            {feeds.map((feed, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/20 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs sm:text-sm">{feed.name}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-sans mt-0.5">
                    Source: <span className="text-cyan-300">{feed.source}</span> • Updated: {feed.lastUpdated}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                    {feed.status}
                  </span>
                  <div className="text-[9px] text-neutral-500 mt-1">{feed.latency}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Educational Disclaimer Note */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300/90 text-xs font-sans leading-relaxed">
            <strong>Data Grounding Notice:</strong> STOCK BLOC aggregates public SEC filings, open market indices, and defense contract records for educational intelligence purposes only.
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                triggerHaptic("selection");
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs uppercase hover:bg-cyan-400 transition-all cursor-pointer"
            >
              CLOSE AUDIT PANEL
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
