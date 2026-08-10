import React, { useState, useEffect } from "react";
import { GraduationCap, ExternalLink, PlayCircle, BookOpen, AlertCircle, Share2, Check } from "lucide-react";
import { triggerHaptic } from "../../utils/haptics";

export const MitCoursesHub: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = () => {
    triggerHaptic("selection");
    const shareUrl = `${window.location.origin}/education`;
    if (navigator.share) {
      navigator.share({
        title: "Stock Bloc | MIT & University OpenCourseWare",
        text: "Access free official university lectures & playlists from MIT, Yale, and Stanford.",
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  useEffect(() => {
    fetch("/api/education/youtube-courses")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("YOUTUBE_API_KEY is not configured in secrets.");
          }
          throw new Error("Failed to fetch courses. Status: " + res.status);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          throw new Error("Invalid response format.");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-8 font-mono text-cyan-100 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/30 pb-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-purple-400" />
            <span>MIT OpenCourseWare & University Feed</span>
          </h1>
          <p className="text-sm text-cyan-400/80 uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            Live Official Playlists from Top Institutions
          </p>
        </div>

        <button
          onClick={handleShare}
          className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 hover:border-purple-400 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer self-start sm:self-auto shadow-lg shadow-purple-950/30"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Share Education Hub</span>
            </>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-sm font-bold text-purple-300 animate-pulse">Syncing catalog via YouTube API...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/40 border-2 border-red-500/50 rounded-2xl flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <div className="space-y-2">
            <h3 className="text-lg font-black text-white uppercase">API Key Required</h3>
            <p className="text-sm text-red-200/80 font-sans">
              {error}
            </p>
            <p className="text-xs text-red-300 font-mono mt-4 p-3 bg-black/40 rounded-lg border border-red-500/30">
              Please go to Google Cloud Console, enable "YouTube Data API v3", generate an API Key, and add it to the AI Studio Secrets panel as <strong>YOUTUBE_API_KEY</strong>.
            </p>
          </div>
        </div>
      ) : courses.length === 0 ? (
        <div className="p-8 text-center bg-neutral-900 border border-white/10 rounded-2xl">
          <p className="text-neutral-400">No courses found on the channel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((playlist: any) => {
            const snippet = playlist.snippet;
            const thumbnailUrl = snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url;
            const itemUrl = typeof playlist.id === "string" && playlist.id.startsWith("PL")
              ? `https://www.youtube.com/playlist?list=${playlist.id}`
              : `https://www.youtube.com/watch?v=${playlist.id}`;
            return (
              <a
                key={playlist.id}
                href={itemUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic("selection")}
                className="bg-black/80 border border-purple-500/30 hover:border-purple-400/80 rounded-2xl overflow-hidden flex flex-col group transition-all"
              >
                {thumbnailUrl && (
                  <div className="relative aspect-video bg-neutral-900 overflow-hidden border-b border-purple-500/30">
                    <img 
                      src={thumbnailUrl} 
                      alt={snippet.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-3 right-3 p-2 bg-purple-500/90 text-black rounded-full shadow-lg shadow-purple-500/50 backdrop-blur-md">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                    {snippet.title}
                  </h3>
                  <p className="text-xs text-cyan-200/60 font-sans line-clamp-3 mb-4 flex-1">
                    {snippet.description || "No description provided."}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest bg-purple-950 px-2 py-1 rounded border border-purple-500/20">
                      {snippet.channelTitle}
                    </span>
                    <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};
