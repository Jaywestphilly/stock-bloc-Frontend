import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  X,
  CheckCircle,
  FileText,
  Building2,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface ImageAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "real_estate" | "credit" | "stock_chart";
}

export const ImageAnalyzerModal: React.FC<ImageAnalyzerModalProps> = ({
  isOpen,
  onClose,
  initialType = "real_estate",
}) => {
  const [analysisType, setAnalysisType] = useState<
    "real_estate" | "credit" | "stock_chart"
  >(initialType);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [userNotes, setUserNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      // Extract base64 part
      setSelectedImage(resultStr);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setResult(null);

    try {
      // Extract base64 data portion
      const base64Data = selectedImage.split(",")[1] || selectedImage;

      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          analysisType,
          userNotes,
        }),
      });

      const data = await res.json();
      setResult(data.analysis || "Analysis completed.");
    } catch (err) {
      console.error("Image analysis failed:", err);
      setResult("Failed to analyze image. Please check network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-neutral-950 border border-white/20 rounded-3xl p-6 shadow-2xl relative text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Gemini Vision Intelligence
            </span>
            <h3 className="text-lg font-black text-white leading-none mt-0.5">
              Multimodal Photo & Document Scanner
            </h3>
          </div>
        </div>

        {/* Category Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
          <button
            onClick={() => setAnalysisType("real_estate")}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              analysisType === "real_estate"
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                : "text-neutral-300 hover:bg-white/5"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Property Photo</span>
          </button>

          <button
            onClick={() => setAnalysisType("credit")}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              analysisType === "credit"
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                : "text-neutral-300 hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Credit Report</span>
          </button>

          <button
            onClick={() => setAnalysisType("stock_chart")}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              analysisType === "stock_chart"
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                : "text-neutral-300 hover:bg-white/5"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Stock Chart</span>
          </button>
        </div>

        {/* Image Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/20 hover:border-amber-400/60 bg-white/5 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-3"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {selectedImage ? (
            <div className="space-y-3">
              <div className="relative aspect-video max-h-48 rounded-xl overflow-hidden bg-black border border-white/10 mx-auto">
                <img
                  src={selectedImage}
                  alt="Uploaded preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-amber-300 font-bold flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Image loaded ready for Gemini Vision</span>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
              <p className="text-xs font-bold text-white">
                Click or drop a photo to upload
              </p>
              <p className="text-[11px] text-neutral-400">
                {analysisType === "real_estate" &&
                  "Upload a rental property exterior, roof, interior, or rehab photo."}
                {analysisType === "credit" &&
                  "Upload a photo of a credit bureau letter, collection notice, or statement."}
                {analysisType === "stock_chart" &&
                  "Upload a stock price chart screenshot or earnings table."}
              </p>
            </div>
          )}
        </div>

        {/* User Notes Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-neutral-300">
            Optional Notes / Specific Question
          </label>
          <input
            type="text"
            placeholder="e.g. Estimate rehab cost / Check for FCRA violation / Identify support price"
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleAnalyze}
          disabled={!selectedImage || loading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-98 transition-all disabled:opacity-40 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing with Gemini 3.6 Vision...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Gemini Vision Audit</span>
            </>
          )}
        </button>

        {/* Results Output */}
        {result && (
          <div className="p-4 rounded-2xl bg-white/5 border border-amber-500/30 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Stock Bloc Vision Audit Report</span>
            </div>
            <div className="text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
