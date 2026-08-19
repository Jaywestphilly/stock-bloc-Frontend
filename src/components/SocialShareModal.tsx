import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StockTicker } from "../types";
import {
  X,
  Share2,
  Copy,
  Check,
  Twitter,
  MessageSquare,
  MessageCircle,
  Sparkles,
  Image,
  Smartphone,
  CheckCircle,
  ExternalLink,
  Zap,
  Send,
  Link2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { triggerHaptic } from "../utils/haptics";
import { computeDeterministicSignal } from "../utils/signalCalculator";

interface SocialShareModalProps {
  stock: StockTicker | null;
  isOpen: boolean;
  onClose: () => void;
}

type ShareTab = "sms" | "card" | "thumbnail";
type SmsPreset = "alert" | "thesis" | "short";
type CardFormat = "landscape" | "vertical" | "square";

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  stock,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ShareTab>("sms");
  const [smsPreset, setSmsPreset] = useState<SmsPreset>("alert");
  const [customNote, setCustomNote] = useState("");
  const [cardFormat, setCardFormat] = useState<CardFormat>("landscape");
  const [handleText, setHandleText] = useState("@thestockbloc");
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState(false);
  const [copiedOgUrl, setCopiedOgUrl] = useState(false);

  const isPositive = stock ? stock.changePercent >= 0 : true;
  const symbol = stock ? stock.symbol : "SPCX";
  const name = stock ? stock.name : "Stock Bloc Intelligence";
  const priceFormatted = stock
    ? `$${stock.price >= 1000 ? stock.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : stock.price.toFixed(2)}`
    : "$0.00";
  const changeFormatted = stock
    ? `${isPositive ? "+" : ""}${stock.changePercent.toFixed(2)}%`
    : "0.00%";

  // Direct deep-link to the specific stock analysis card
  const origin = typeof window !== "undefined" ? window.location.origin : "https://stockbloc.ai";
  const stockUrl = stock
    ? `${origin}/?stock=${encodeURIComponent(stock.symbol)}`
    : `${origin}/`;

  const ogImageUrl = stock
    ? `${origin}/api/og?symbol=${encodeURIComponent(stock.symbol)}&title=${encodeURIComponent(stock.name || stock.symbol)}&subtitle=${encodeURIComponent('Live Technicals, 13F Accumulation & Quant Thesis')}&price=${encodeURIComponent(priceFormatted)}&change=${encodeURIComponent(changeFormatted)}&badge=LEVEL+2+TELEMETRY&category=Stock+Analysis`
    : `${origin}/api/og?title=${encodeURIComponent('STOCK BLOC // QUANT MATRIX')}&subtitle=${encodeURIComponent('Autonomous Agent Economy & Real-Time Market Intelligence')}&badge=LIVE+2026&category=Terminal`;

  const quantSignal = useMemo(() => {
    if (!stock) return { score: 75, bias: "BULLISH" };
    const sig = computeDeterministicSignal(stock);
    const bias = sig.score >= 70 ? "BULLISH" : sig.score >= 50 ? "NEUTRAL" : "CAUTION";
    return { score: sig.score, bias };
  }, [stock]);

  // Construct text message based on selected preset
  const smsBody = useMemo(() => {
    if (!stock) {
      return `🚀 Check out live AI & supersonic momentum stocks on Stock Bloc:\n${stockUrl}`;
    }

    const notePrefix = customNote.trim() ? `💬 "${customNote.trim()}"\n\n` : "";

    if (smsPreset === "short") {
      return `${notePrefix}📊 $${symbol} is trading at ${priceFormatted} (${changeFormatted}).\n\n👉 View live stock analysis card:\n${stockUrl}`;
    }

    if (smsPreset === "thesis") {
      return `${notePrefix}🚨 Stock Bloc Dossier: $${symbol} (${name})\n💵 Price: ${priceFormatted} (${changeFormatted})\n⚡ Quant Score: SB ${quantSignal.score}/100 (${quantSignal.bias})\n📊 Market Cap: ${stock.marketCap || "N/A"} | 52W High: $${stock.high52 || "N/A"}\n🎯 Focus: ${stock.tags?.slice(0, 2).join(", ") || "AI Hardware"}\n\n🔍 Tap to view real-time technical chart, 13F holders & AI thesis:\n${stockUrl}`;
    }

    // Default "alert" preset
    return `${notePrefix}🚨 $${symbol} ALERT: ${name}\n💵 Current Price: ${priceFormatted} (${changeFormatted})\n⚡ Stock Bloc Rating: ${quantSignal.score}/100 (${quantSignal.bias})\n📈 52-Wk Range: $${stock.low52 || "N/A"} - $${stock.high52 || "N/A"}\n\n🔗 Open full Stock Analysis Card:\n${stockUrl}`;
  }, [stock, symbol, name, priceFormatted, changeFormatted, quantSignal, stockUrl, smsPreset, customNote]);

  // Trigger native SMS application
  const handleSendSms = () => {
    triggerHaptic("success");
    const isIOS =
      typeof navigator !== "undefined" &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    // iOS uses &body=, Android/others use ?body=
    const separator = isIOS ? "&" : "?";
    const smsHref = `sms:${separator}body=${encodeURIComponent(smsBody)}`;
    window.location.href = smsHref;
  };

  // Trigger Web Share API (mobile share sheet)
  const handleNativeShare = async () => {
    triggerHaptic("selection");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Stock Bloc: $${symbol} Analysis`,
          text: smsBody,
          url: stockUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          navigator.clipboard.writeText(smsBody);
          setCopiedMessage(true);
          setTimeout(() => setCopiedMessage(false), 2500);
        }
      }
    } else {
      navigator.clipboard.writeText(smsBody);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  // Copy full SMS text message with link
  const handleCopyMessage = () => {
    triggerHaptic("success");
    navigator.clipboard.writeText(smsBody);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  // Copy direct stock link only
  const handleCopyLink = () => {
    triggerHaptic("success");
    navigator.clipboard.writeText(stockUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Share to WhatsApp
  const handleWhatsAppShare = () => {
    triggerHaptic("selection");
    const text = encodeURIComponent(smsBody);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // Share to Twitter / X
  const handleTwitterShare = () => {
    triggerHaptic("selection");
    const tweetText = `${stock ? `🚨 $${symbol} (${priceFormatted}, ${changeFormatted}) Quant Analysis & Momentum on Stock Bloc.` : "🚀 Stock Bloc Quant Terminal"}\n\n${stockUrl}\n\n#StockMarket #${symbol} #Trading`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, "_blank");
  };

  // Share to Telegram
  const handleTelegramShare = () => {
    triggerHaptic("selection");
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(stockUrl)}&text=${encodeURIComponent(`$${symbol} Stock Analysis & Charts on Stock Bloc`)}`,
      "_blank",
    );
  };

  const handleDownloadCard = () => {
    triggerHaptic("success");
    setDownloadMsg(true);
    setTimeout(() => setDownloadMsg(false), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          key="share-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl overflow-y-auto font-mono"
        >
          <motion.div
            key="share-modal-content"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            className="w-full max-w-xl bg-[#030914] border border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative text-white space-y-5 overflow-hidden alien-card my-auto max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-cyan-100 uppercase tracking-wider">
                      SHARE ${symbol}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                      DEEP LINK
                    </span>
                  </div>
                  <p className="text-xs text-cyan-400/80 font-sans">
                    Send direct text message link to the ${symbol} stock analysis card
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  triggerHaptic("light");
                  onClose();
                }}
                className="p-1.5 rounded-full bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800 transition-all active:scale-95 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 bg-[#020b16] p-1 rounded-2xl border border-cyan-900/60 relative z-10">
              <button
                onClick={() => {
                  triggerHaptic("selection");
                  setActiveTab("sms");
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "sms"
                    ? "bg-cyan-500 text-black font-black shadow-md shadow-cyan-500/30"
                    : "text-cyan-300 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="truncate">SMS / Text</span>
              </button>
              <button
                onClick={() => {
                  triggerHaptic("selection");
                  setActiveTab("card");
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "card"
                    ? "bg-cyan-500 text-black font-black shadow-md shadow-cyan-500/30"
                    : "text-cyan-300 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="truncate">Social Post</span>
              </button>
              <button
                onClick={() => {
                  triggerHaptic("selection");
                  setActiveTab("thumbnail");
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "thumbnail"
                    ? "bg-cyan-500 text-black font-black shadow-md shadow-cyan-500/30"
                    : "text-cyan-300 hover:text-white"
                }`}
              >
                <Image className="w-3.5 h-3.5" />
                <span className="truncate">OG Banner</span>
              </button>
            </div>

            {/* TAB 1: TEXT MESSAGE (SMS) SHARING */}
            {activeTab === "sms" && (
              <div className="space-y-4 relative z-10">
                {/* Style Presets */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Message Preset:</span>
                    <span className="text-[10px] text-cyan-400/70 lowercase font-normal">
                      Includes live card link
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        setSmsPreset("alert");
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                        smsPreset === "alert"
                          ? "bg-cyan-950 text-cyan-200 border-cyan-400 shadow-sm shadow-cyan-500/20"
                          : "bg-[#020d18] text-cyan-400/80 border-cyan-900/60 hover:bg-cyan-950/40"
                      }`}
                    >
                      ⚡ Key Alert
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        setSmsPreset("thesis");
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                        smsPreset === "thesis"
                          ? "bg-cyan-950 text-cyan-200 border-cyan-400 shadow-sm shadow-cyan-500/20"
                          : "bg-[#020d18] text-cyan-400/80 border-cyan-900/60 hover:bg-cyan-950/40"
                      }`}
                    >
                      📊 Full Dossier
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        setSmsPreset("short");
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                        smsPreset === "short"
                          ? "bg-cyan-950 text-cyan-200 border-cyan-400 shadow-sm shadow-cyan-500/20"
                          : "bg-[#020d18] text-cyan-400/80 border-cyan-900/60 hover:bg-cyan-950/40"
                      }`}
                    >
                      🎯 Quick Link
                    </button>
                  </div>
                </div>

                {/* Optional Custom Note */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Personal Note (Optional):</span>
                    <span className="text-[10px] text-cyan-400/70">Prepends to SMS</span>
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="e.g., Check out this optical transceiver breakout setup!"
                    className="w-full bg-[#020d18] border border-cyan-900/60 rounded-xl px-3 py-2 text-xs text-cyan-100 placeholder-cyan-700 font-sans focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                {/* iMessage / SMS Chat Bubble Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                      Text Message Live Preview
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle className="w-3 h-3" /> Ready to Send
                    </span>
                  </div>

                  <div className="bg-[#020a14] p-3.5 rounded-2xl border border-cyan-900/60 space-y-2 relative overflow-hidden shadow-inner">
                    {/* Simulated iMessage bubble */}
                    <div className="flex justify-end">
                      <div className="max-w-[92%] sm:max-w-[85%] bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-700 text-white p-3.5 rounded-2xl rounded-tr-sm shadow-lg text-xs font-sans space-y-2 relative leading-relaxed">
                        <div className="whitespace-pre-wrap">{smsBody}</div>

                        {/* Interactive Link Card Preview in bubble */}
                        <div className="pt-2 mt-2 border-t border-white/20 flex items-center justify-between gap-2 text-[11px] bg-black/20 p-2 rounded-xl">
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-6 h-6 rounded-lg bg-cyan-400 text-black font-black flex items-center justify-center text-[10px] shrink-0 font-mono">
                              ${symbol.slice(0, 2)}
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-white truncate">
                                ${symbol} Stock Analysis Card
                              </div>
                              <div className="text-[10px] text-cyan-200 truncate font-mono">
                                {stockUrl.replace(/^https?:\/\//, "")}
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary SMS Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Direct SMS Action */}
                  <button
                    onClick={handleSendSms}
                    className="py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-black" />
                    <span>Send in Text Message (SMS)</span>
                  </button>

                  {/* Native Share Sheet (iMessage, WhatsApp, AirDrop) */}
                  <button
                    onClick={handleNativeShare}
                    className="py-3 px-4 rounded-2xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-cyan-400" />
                    <span>Native Share / AirDrop</span>
                  </button>
                </div>

                {/* Secondary Quick Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={handleCopyMessage}
                    className="py-2 px-2 rounded-xl bg-[#020d18] hover:bg-cyan-950/60 border border-cyan-900/60 text-[11px] font-bold text-cyan-300 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    title="Copy full formatted SMS message"
                  >
                    {copiedMessage ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span>{copiedMessage ? "Copied!" : "Copy SMS"}</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="py-2 px-2 rounded-xl bg-[#020d18] hover:bg-cyan-950/60 border border-cyan-900/60 text-[11px] font-bold text-cyan-300 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    title="Copy direct stock link only"
                  >
                    {copiedLink ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="py-2 px-2 rounded-xl bg-[#020d18] hover:bg-emerald-950/40 border border-emerald-900/60 text-[11px] font-bold text-emerald-300 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleTwitterShare}
                    className="py-2 px-2 rounded-xl bg-[#020d18] hover:bg-blue-950/40 border border-blue-900/60 text-[11px] font-bold text-blue-300 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <Twitter className="w-3.5 h-3.5 text-blue-400" />
                    <span>Post on X</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: VISUAL SOCIAL CARD EXPORT */}
            {activeTab === "card" && (
              <div className="space-y-4 relative z-10">
                {/* Aspect Ratio Format Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-cyan-300 flex items-center justify-between">
                    <span>Card Preset Format:</span>
                    <span className="text-[10px] text-cyan-400/80 font-mono uppercase">
                      Optimized for algorithms
                    </span>
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        setCardFormat("landscape");
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        cardFormat === "landscape"
                          ? "bg-cyan-500 text-black border-cyan-400 font-black shadow-md shadow-cyan-500/20"
                          : "bg-[#020d18] text-cyan-300 border-cyan-900/60 hover:bg-cyan-950/40"
                      }`}
                    >
                      <Image className="w-3.5 h-3.5" />
                      <span>Post on X (16:9)</span>
                    </button>

                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        setCardFormat("vertical");
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        cardFormat === "vertical"
                          ? "bg-cyan-500 text-black border-cyan-400 font-black shadow-md shadow-cyan-500/20"
                          : "bg-[#020d18] text-cyan-300 border-cyan-900/60 hover:bg-cyan-950/40"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>TikTok/Reels (9:16)</span>
                    </button>

                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        setCardFormat("square");
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        cardFormat === "square"
                          ? "bg-cyan-500 text-black border-cyan-400 font-black shadow-md shadow-cyan-500/20"
                          : "bg-[#020d18] text-cyan-300 border-cyan-900/60 hover:bg-cyan-950/40"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Square (1:1)</span>
                    </button>
                  </div>
                </div>

                {/* Social Handle Input */}
                <div className="flex items-center gap-2 bg-[#020d18] p-2 rounded-xl border border-cyan-900/60 text-xs">
                  <span className="text-cyan-400 font-bold shrink-0">
                    Watermark Handle:
                  </span>
                  <input
                    type="text"
                    value={handleText}
                    onChange={(e) => setHandleText(e.target.value)}
                    placeholder="@YourBrand"
                    className="w-full bg-transparent text-cyan-200 font-mono focus:outline-none"
                  />
                </div>

                {/* Visual Share Card Render Box */}
                <div className="flex justify-center">
                  <div
                    className={`w-full rounded-2xl bg-gradient-to-br from-[#020a14] via-[#041628] to-[#020a14] border-2 border-cyan-500/50 shadow-2xl p-5 space-y-4 relative overflow-hidden transition-all alien-card ${
                      cardFormat === "landscape"
                        ? "aspect-[16/9]"
                        : cardFormat === "vertical"
                          ? "aspect-[9/16] max-w-xs py-8"
                          : "aspect-square"
                    }`}
                  >
                    {/* Card Holographic Grid Background */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00f2ff_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />

                    {/* Card Header Ticker */}
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/80 flex items-center justify-center font-black text-cyan-200 text-xl shadow-md shadow-cyan-500/20">
                          {symbol.slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xl text-white tracking-wider">
                            ${symbol}
                          </h4>
                          <p className="text-xs text-cyan-400/80 font-medium">
                            {name}
                          </p>
                        </div>
                      </div>

                      {stock && (
                        <div
                          className={`px-3 py-1.5 rounded-xl font-black text-sm font-mono shadow-md ${
                            isPositive
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-400 glow-emerald"
                              : "bg-rose-950 text-rose-300 border border-rose-500 glow-rose"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%
                        </div>
                      )}
                    </div>

                    {/* Price & Sentiment Strip */}
                    {stock && (
                      <div className="space-y-2 relative z-10 pt-2 border-t border-cyan-900/50">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-3xl font-black font-mono text-white tracking-tight">
                              {priceFormatted}
                            </span>
                            <span className="ml-2 text-xs text-cyan-400/80 font-medium">
                              Cap: {stock.marketCap}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-cyan-400/70 uppercase block">
                              52W HIGH
                            </span>
                            <span className="text-xs font-bold text-emerald-300 font-mono">
                              ${stock.high52}
                            </span>
                          </div>
                        </div>

                        {/* Sentiment Badge */}
                        <div className="flex items-center justify-between bg-[#020b16]/80 p-2 rounded-xl border border-cyan-900/60 text-xs">
                          <span className="text-cyan-300 font-bold flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            Quant Signal:
                          </span>
                          <span className="font-black text-amber-300 font-mono">
                            SB {quantSignal.score} ({quantSignal.bias})
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Watermark branding & Link */}
                    <div className="pt-3 border-t border-cyan-900/60 flex items-center justify-between text-[11px] text-cyan-300 font-mono relative z-10 mt-auto">
                      <span className="flex items-center gap-1 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        Stock Bloc Terminal
                      </span>
                      <span className="text-cyan-400/80 font-bold">
                        {handleText}
                      </span>
                    </div>
                  </div>
                </div>

                {downloadMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs text-center flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4 text-black" />
                    <span>
                      Card Snapshot Copied to Clipboard! Ready for TikTok / Instagram.
                    </span>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={handleTwitterShare}
                    className="py-2.5 px-3 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/50 text-xs font-bold flex flex-col items-center justify-center gap-1 text-cyan-300 active:scale-95 transition-all cursor-pointer"
                  >
                    <Twitter className="w-4 h-4 text-cyan-400" />
                    <span>Post on X</span>
                  </button>

                  <button
                    onClick={handleTelegramShare}
                    className="py-2.5 px-3 rounded-2xl bg-blue-950/80 hover:bg-blue-900/80 border border-blue-500/50 text-xs font-bold flex flex-col items-center justify-center gap-1 text-blue-300 active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span>Telegram</span>
                  </button>

                  <button
                    onClick={handleDownloadCard}
                    className="py-2.5 px-3 rounded-2xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/50 text-xs font-bold flex flex-col items-center justify-center gap-1 text-purple-300 active:scale-95 transition-all cursor-pointer"
                  >
                    <Image className="w-4 h-4 text-purple-400" />
                    <span>Save Card</span>
                  </button>

                  <button
                    onClick={handleCopyMessage}
                    className="py-2.5 px-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    {copiedMessage ? (
                      <Check className="w-4 h-4 text-black" />
                    ) : (
                      <Copy className="w-4 h-4 text-black" />
                    )}
                    <span>{copiedMessage ? "Copied!" : "Copy Post"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: DYNAMIC OPEN GRAPH THUMBNAIL BANNER */}
            {activeTab === "thumbnail" && (
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between text-xs text-cyan-300">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Dynamic Open Graph Banner
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                    1200 × 630 Vector SVG
                  </span>
                </div>

                {/* Live Preview of Generated Banner */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl bg-black/90 group">
                  <img
                    src={ogImageUrl}
                    alt={`${symbol} Live Open Graph Banner`}
                    className="w-full h-auto object-cover aspect-[1200/630]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-cyan-950/20 pointer-events-none" />
                </div>

                <div className="p-3 rounded-xl bg-[#020b16] border border-cyan-900/60 text-[11px] text-cyan-300/80 space-y-1 font-mono">
                  <div className="text-cyan-200 font-bold flex items-center justify-between">
                    <span>Direct Open Graph URL:</span>
                    <span className="text-[10px] text-emerald-400">Indexed & Crawler-Ready</span>
                  </div>
                  <p className="text-cyan-400/60 break-all text-[10px]">
                    {ogImageUrl}
                  </p>
                </div>

                {/* Banner Actions */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      triggerHaptic("success");
                      navigator.clipboard.writeText(ogImageUrl);
                      setCopiedOgUrl(true);
                      setTimeout(() => setCopiedOgUrl(false), 2500);
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/50 text-xs font-bold flex items-center justify-center gap-1.5 text-cyan-300 active:scale-95 transition-all cursor-pointer"
                  >
                    {copiedOgUrl ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">Banner URL Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-cyan-400" />
                        <span>Copy Image URL</span>
                      </>
                    )}
                  </button>

                  <a
                    href={ogImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-black" />
                    <span>Open High-Res Banner</span>
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

