import React, { useState, useRef } from "react";
import {
  Music,
  Play,
  Pause,
  Volume2,
  Sparkles,
  X,
  RefreshCw,
  Radio,
  Disc,
} from "lucide-react";

interface FocusMusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FocusMusicPlayerModal: React.FC<FocusMusicPlayerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [prompt, setPrompt] = useState(
    "30-second smooth ambient focus track with minimalist synth pads and lo-fi beats for studying stock market charts",
  );
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Web Audio Synth Fallback state
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  if (!isOpen) return null;

  const handleGenerateLyriaTrack = async () => {
    setLoading(true);
    setIsPlaying(false);
    stopSynth();

    try {
      const res = await fetch("/api/ai/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (data.audioBase64) {
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType || "audio/wav" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        // Start synthetic focus sound generator
        playSyntheticFocusMusic();
      }
    } catch (err) {
      console.error("Lyria Music error:", err);
      playSyntheticFocusMusic();
    } finally {
      setLoading(false);
    }
  };

  const playSyntheticFocusMusic = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Relaxing 432Hz ambient chord frequency
      osc.type = "sine";
      osc.frequency.setValueAtTime(216, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscRef.current = osc;
      setIsPlaying(true);
    } catch (e) {
      console.warn("Synth sound failed", e);
    }
  };

  const stopSynth = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
      } catch (e) {}
      oscRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSynth();
    } else {
      if (audioUrl && audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        playSyntheticFocusMusic();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-950 border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative text-white space-y-5">
        <button
          onClick={() => {
            stopSynth();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
              Lyria Audio Engine
            </span>
            <h3 className="text-lg font-black text-white leading-none mt-0.5">
              Deep Work Ambient Focus Music
            </h3>
          </div>
        </div>

        {/* Vinyl Visualizer */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-br from-purple-950/60 via-neutral-900 to-indigo-950 border border-purple-500/20 flex flex-col items-center justify-center space-y-4 overflow-hidden">
          <div
            className={`w-28 h-28 rounded-full border-4 border-purple-500/40 bg-neutral-950 flex items-center justify-center shadow-2xl relative ${
              isPlaying ? "animate-spin" : ""
            }`}
            style={{ animationDuration: "8s" }}
          >
            <Disc className="w-20 h-20 text-purple-400/80" />
            <div className="absolute w-6 h-6 rounded-full bg-purple-400 border-2 border-black" />
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-sm font-extrabold text-white">
              Quant Deep Work Focus State
            </h4>
            <p className="text-[11px] text-purple-300 font-mono">
              {isPlaying
                ? "♪ Audio Playing (432Hz Ambient Focus)"
                : "Audio Paused"}
            </p>
          </div>

          <audio
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>

        {/* Prompt Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-neutral-300">
            Lyria Music Prompt
          </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex-1 py-3 rounded-2xl bg-purple-500 hover:bg-purple-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Ambient Audio</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play Focus Ambient Music</span>
              </>
            )}
          </button>

          <button
            onClick={handleGenerateLyriaTrack}
            disabled={loading}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-400" />
            )}
            <span>Generate New Lyria Track</span>
          </button>
        </div>
      </div>
    </div>
  );
};
