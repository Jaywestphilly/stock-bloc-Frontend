import React, { useState } from "react";

interface StockBlocLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const StockBlocLogo: React.FC<StockBlocLogoProps> = ({
  size = "md",
  showText = true,
  showTagline = false,
  className = "",
}) => {
  // Dimensions based on size
  const iconDimensions = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
    hero: "w-52 h-52",
  }[size];

  const textSizeClass = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-base",
    xl: "text-xl",
    hero: "text-2xl sm:text-3xl",
  }[size];

  return (
    <div
      className={`flex flex-col items-center justify-center font-mono select-none ${className}`}
    >
      {/* Official Stock Bloc Bell & SB Arrow Logo Emblem */}
      <div
        className={`relative ${iconDimensions} flex items-center justify-center group overflow-hidden rounded-2xl`}
      >
        <img 
          src="/logo.jpg" 
          alt="Stock Bloc Logo" 
          className="w-full h-full object-cover relative z-10 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]"
        />
      </div>

      {/* "STOCK BLOC" Text & Tagline */}
      {showText && (
        <div className="mt-3 text-center">
          <h2
            className={`${textSizeClass} font-black text-cyan-100 tracking-[0.2em] uppercase font-mono drop-shadow-[0_0_16px_rgba(34,211,238,0.8)]`}
          >
            "STOCK BLOC"
          </h2>
          {showTagline && (
            <p className="mt-1 text-[11px] sm:text-xs font-black tracking-[0.3em] text-cyan-400 font-mono uppercase">
              BUILD WEALTH. BREAK LIMITS.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
