import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Check,
  Zap,
  Lock,
  Mail,
  ShieldCheck,
  Server,
  Users,
  Terminal,
  ArrowRight,
  Bell,
  Sparkles,
} from "lucide-react";
import { triggerHaptic } from "../utils/haptics";
import { trackEvent } from "../utils/analytics";
import { db, saveUserDataLocally } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface ProSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePlan?: string;
  onSelectPlan?: (plan: "free" | "pro" | "institutional") => void;
}

export const ProSubscriptionModal: React.FC<ProSubscriptionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactSuccessMsg, setContactSuccessMsg] = useState<string | null>(null);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes("@")) return;

    triggerHaptic("success");
    setIsSubmitting(true);

    trackEvent("waitlist_signup", { email: waitlistEmail });

    try {
      if (db) {
        await addDoc(collection(db, "pro_waitlist"), {
          email: waitlistEmail,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      // Fallback
      saveUserDataLocally(`pro_waitlist_${Date.now()}`, { email: waitlistEmail });
    }

    setIsSubmitting(false);
    setWaitlistSubmitted(true);
  };

  const handleB2bInquiry = (tierName: string) => {
    triggerHaptic("success");
    setContactSuccessMsg(
      `Inquiry received for ${tierName}. An Enterprise Account Director will contact your team within 24 hours.`
    );
    setTimeout(() => {
      setContactSuccessMsg(null);
      onClose();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          key="pro-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl overflow-y-auto font-mono"
        >
          <motion.div
            key="pro-modal-content"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            className="w-full max-w-4xl bg-[#030914] border border-cyan-500/50 rounded-3xl p-5 sm:p-8 shadow-2xl relative text-white space-y-6 overflow-hidden alien-card my-auto"
          >
            {/* Background Holographic Glow */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/20">
                  <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black font-tech tracking-wider text-cyan-100 uppercase">
                      STOCK BLOC PRO
                    </h2>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black font-tech bg-amber-400 text-black border border-amber-200 uppercase shadow-md shadow-amber-400/20">
                      EARLY ACCESS WAITLIST
                    </span>
                  </div>
                  <p className="text-sm text-amber-300/80 font-sans mt-0.5">
                    Unlock institutional alerts, saved watchlists, and priority email notifications.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerHaptic("light");
                  onClose();
                }}
                className="p-2 rounded-full bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-800 transition-all active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Inquiry Toast */}
            {contactSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 relative z-10"
              >
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{contactSuccessMsg}</span>
              </motion.div>
            )}

            {/* Main PRO Pricing Card & B2B Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
              {/* Main Stock Bloc PRO Tier ($19/mo) */}
              <div className="md:col-span-7 bg-[#05111d] border-2 border-cyan-400 p-6 rounded-2xl shadow-2xl relative flex flex-col justify-between space-y-5">
                <div className="hud-corner-tl border-cyan-400" />
                <div className="hud-corner-tr border-cyan-400" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1 rounded">
                      INDIVIDUAL QUANT SUITE
                    </span>
                    <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                      <Lock className="w-3 h-3" /> COMING SOON
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-black font-tech text-white uppercase">$19</h3>
                      <span className="text-xs font-bold text-neutral-400">/ month</span>
                    </div>
                    <p className="text-sm text-neutral-300 font-sans mt-1">
                      Designed for high-frequency retail traders, real estate investors, and credit optimization enthusiasts.
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-neutral-200 pt-3 border-t border-cyan-500/20 font-sans">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Saved Custom Watchlists & Cloud Sync</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Real-time RSI & Tsunami Stock Volatility Alerts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>13F SEC Filing Email Digest (Whale Move Alerts)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Advanced Institutional Data Filters & Heatmaps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Ad-Free Experience & Unrestricted Copilot</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Priority VIP Access on Stock Bloc X (@thestockbloc)</span>
                    </li>
                  </ul>
                </div>


                {/* Waitlist Form */}
                <div className="pt-4 border-t border-cyan-500/20 space-y-4">
                  <button disabled className="w-full py-3 bg-neutral-900 border border-neutral-700 text-neutral-500 font-black font-tech uppercase text-sm tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                    <Lock className="w-4 h-4" /> SUBSCRIBE NOW (COMING SOON)
                  </button>
                  
                  {waitlistSubmitted ? (

                    <div className="p-3 bg-emerald-950/80 border border-emerald-400 rounded-xl text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>You're on the list. We'll notify you when PRO launches.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleWaitlistSubmit} className="space-y-2">
                      <label className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                        JOIN THE PRO WAITLIST FOR EARLY ACCESS
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          required
                          value={waitlistEmail}
                          onChange={(e) => setWaitlistEmail(e.target.value)}
                          placeholder="Enter your email..."
                          className="flex-1 bg-black/80 border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-cyan-400 text-black font-black font-tech uppercase text-xs tracking-wider rounded-xl hover:bg-cyan-300 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          JOIN WAITLIST
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Enterprise B2B Cards (Side Column) */}
              <div className="md:col-span-5 space-y-4 flex flex-col justify-between">
                {/* Enterprise API */}
                <div className="p-4 rounded-xl border bg-[#020d18] border-cyan-900/60 hover:border-cyan-700/60 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                      <Server className="w-3 h-3" /> ENTERPRISE API
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Quant API Gateway</h4>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    WebSocket price feeds, Level 2 depth, and 13F webhook endpoints.
                  </p>
                  <button
                    onClick={() => handleB2bInquiry("Enterprise Data Gateway")}
                    className="w-full py-1.5 rounded-lg text-[11px] font-bold bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700 text-cyan-300 transition-all cursor-pointer"
                  >
                    Inquire API Access
                  </button>
                </div>

                {/* Team Seats */}
                <div className="p-4 rounded-xl border bg-[#031322] border-cyan-500/60 hover:border-cyan-400 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-1">
                      <Users className="w-3 h-3" /> TEAM SEATS
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-cyan-100">Corporate Terminal Seats</h4>
                  <p className="text-[11px] text-cyan-200/80 font-sans">
                    Deploy Bloomberg Terminal seats with SAML SSO & Okta.
                  </p>
                  <button
                    onClick={() => handleB2bInquiry("Corporate Terminal Seats")}
                    className="w-full py-2 rounded-lg text-xs font-black uppercase bg-cyan-400 text-black hover:bg-cyan-300 transition-all cursor-pointer"
                  >
                    Inquire Corporate Seats
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-[11px] text-amber-400/80 font-mono relative z-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Commitment • Educational Intelligence • Bank-Grade Security</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

