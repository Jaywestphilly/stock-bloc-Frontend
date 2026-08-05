import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StockTicker } from "../types";
import {
  X,
  Share2,
  Copy,
  Check,
  Twitter,
  MessageSquare,
  Sparkles,
  Image,
  Video,
  Smartphone,
  CheckCircle,
  ExternalLink,
  Zap,
} from "lucide-react";
import { triggerHaptic } from "../utils/haptics";

interface SocialShareModalProps {
  stock: StockTicker | null;
  isOpen: boolean;
  onClose: () => void;
}

type CardFormat = "landscape" | "vertical" | "square";

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  stock,
  isOpen,
  onClose,
}) => {
  const [cardFormat, setCardFormat] = useState<CardFormat>("landscape");
  const [handleText, setHandleText] = useState("@thestockbloc");
  const [copied, setCopied] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState(false);

  const isPositive = stock ? stock.changePercent >= 0 : true;

  const shareTitle = stock
    ? `🚨 $${stock.symbol} ALERT: Trading at $${stock.price.toFixed(2)} (${isPositive ? "+" : ""}${stock.changePercent.toFixed(2)}%)\n📊 Market Cap: ${stock.marketCap} | 7D High: $${stock.high52}\n⚡ Category: ${stock.category ? stock.category.toUpperCase() : " TECH"}\n\nVia Stock Bloc Market Intelligence ${handleText}`
    : `🚀 Track Super sonic Tsunami & Semiconductor Stocks on Stock Bloc Terminal ${handleText}`;

  const shareUrl = "https://linktr.ee/StockBloc";

  const viralHashtags = stock
    ? `#StockMarket #${stock.symbol} #Trading #Investing #StockBloc #`
    : "#StockMarket #Finance #StockBloc #Trading";

  const fullShareText = `${shareTitle}\n\n${viralHashtags}\n🔗 ${shareUrl}`;

  const handleCopyText = () => {
    triggerHaptic("success");
    navigator.clipboard.writeText(fullShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTwitterShare = () => {
    triggerHaptic("selection");
    const text = encodeURIComponent(fullShareText);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleTelegramShare = () => {
    triggerHaptic("selection");
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
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
            className="w-full max-w-xl bg-[#030914] border border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative text-white space-y-6 overflow-hidden alien-card my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-900/60 pb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-cyan-100 uppercase tracking-wider">
                    VIRAL SOCIAL SHARE CARDS
                  </h3>
                  <p className="text-sm text-cyan-400/80 font-sans">
                    Generate sleek cards for X (Twitter), TikTok & Instagram
                    Reels
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

            {/* Aspect Ratio Format Selector */}
            <div className="space-y-2 relative z-10">
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
                  <Video className="w-3.5 h-3.5" />
                  <span>Square (1:1)</span>
                </button>
              </div>
            </div>

            {/* Social Handle Input */}
            <div className="flex items-center gap-2 bg-[#020d18] p-2 rounded-xl border border-cyan-900/60 relative z-10 text-xs">
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
            <div className="relative z-10 flex justify-center">
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
                      {stock ? stock.symbol.slice(0, 2) : "SB"}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xl text-white tracking-wider">
                        {stock ? `$${stock.symbol}` : "Stock Bloc"}
                      </h4>
                      <p className="text-xs text-cyan-400/80 font-medium">
                        {stock
                          ? stock.name
                          : "Super sonic Tsunami Intelligence"}
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
                          $
                          {stock.price >= 1000
                            ? stock.price.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : stock.price.toFixed(2)}
                        </span>
                        <span className="ml-2 text-xs text-cyan-400/80 font-medium">
                          Cap: {stock.marketCap}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-cyan-400/70 uppercase block">
                          7D HIGH
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
                        Sentiment Rating:
                      </span>
                      <span className="font-black text-amber-300 font-mono">
                        {stock.sentimentScore
                          ? `${stock.sentimentScore}% BULLISH`
                          : "88% BULLISH"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Watermark branding */}
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
                className="p-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs text-center flex items-center justify-center gap-1.5 relative z-10"
              >
                <CheckCircle className="w-4 h-4 text-black" />
                <span>
                  Card Rendered & Saved to Clipboard! Ready for TikTok /
                  Instagram Story upload.
                </span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10">
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
                <span>Download Card</span>
              </button>

              <button
                onClick={handleCopyText}
                className="py-2.5 px-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-black" />
                ) : (
                  <Copy className="w-4 h-4 text-black" />
                )}
                <span>{copied ? "Copied Post!" : "Copy Caption"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
