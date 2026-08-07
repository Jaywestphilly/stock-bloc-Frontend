import React, { useRef, useEffect, useState } from "react";
import {
  Globe,
  RotateCw,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Radio,
  Zap,
  Info,
  Wifi,
  Shield,
  Eye,
  HelpCircle,
  X,
} from "lucide-react";

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  inclination: number; // in radians
  raan: number; // Right Ascension of the Ascending Node in radians
  meanAnomaly: number; // orbital position in radians
  speed: number;
  shellId: string;
  color: string;
  size: number;
}

interface Starlink3DGlobeProps {
  activeSatellitesCount?: number;
  lastUpdatedIso?: string;
  isStale?: boolean;
}

export const Starlink3DGlobe: React.FC<Starlink3DGlobeProps> = ({
  activeSatellitesCount = 10840,
  lastUpdatedIso,
  isStale = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Interaction State
  const [isRotating, setIsRotating] = useState(true);
  const [selectedShellFilter, setSelectedShellFilter] = useState<string>("all");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showLaserMesh, setShowLaserMesh] = useState(true);
  const [showInfoPopover, setShowInfoPopover] = useState(false);

  // Rotation angles (radians) - slower premium spin
  const rotXRef = useRef<number>(0.35); // tilt downward slightly
  const rotYRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Generate 3D Satellite Shell particles - High Density
  const satellitesRef = useRef<Point3D[]>([]);

  useEffect(() => {
    const points: Point3D[] = [];
    const shells = [
      { id: "shell1", name: "Shell 1 (550km / 53°)", inc: 53.0, radius: 1.28, count: 750, color: "#22d3ee" }, // cyan
      { id: "shell2", name: "Shell 2 (540km / 53.2°)", inc: 53.2, radius: 1.27, count: 520, color: "#38bdf8" }, // sky
      { id: "shell3", name: "Direct-to-Cell (350km / 53°)", inc: 53.0, radius: 1.18, count: 380, color: "#fbbf24" }, // amber
      { id: "shell4", name: "Polar SSO (560km / 97.6°)", inc: 97.6, radius: 1.29, count: 320, color: "#34d399" }, // emerald
      { id: "shell5", name: "V3 Heavy (525km / 33°)", inc: 33.0, radius: 1.26, count: 280, color: "#c084fc" }, // purple
    ];

    shells.forEach((shell) => {
      const incRad = (shell.inc * Math.PI) / 180;
      for (let i = 0; i < shell.count; i++) {
        // Distribute RAAN across orbital planes
        const raan = (i % 32) * ((2 * Math.PI) / 32) + (Math.random() * 0.04);
        // Distribute anomaly along the orbit ring
        const meanAnomaly = (i / shell.count) * 2 * Math.PI + Math.random() * 0.15;
        const speed = 0.0008 + (Math.random() * 0.0004); // subtle, realistic slow velocity

        points.push({
          x: 0,
          y: 0,
          z: 0,
          baseRadius: shell.radius,
          inclination: incRad,
          raan: raan,
          meanAnomaly: meanAnomaly,
          speed: speed,
          shellId: shell.id,
          color: shell.color,
          size: shell.id === "shell3" ? 2.2 : 1.7,
        });
      }
    });

    satellitesRef.current = points;
  }, []);

  // WebGL / Canvas 3D Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    const resizeObs = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObs.observe(containerRef.current);

    const render = () => {
      if (!canvas || !ctx || !containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      if (width === 0 || height === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const globeRadius = Math.min(width, height) * 0.26 * zoomLevel;

      // Slow auto rotation
      if (isRotating && !isDraggingRef.current) {
        rotYRef.current += 0.0012; // slow, premium spin
      }

      const rx = rotXRef.current;
      const ry = rotYRef.current;

      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);

      // Helper for 3D rotation matrix
      const project3D = (x: number, y: number, z: number) => {
        const x1 = x * cosY + z * sinY;
        const y1 = y;
        const z1 = -x * sinY + z * cosY;

        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        const scale = globeRadius;
        const screenX = centerX + x2 * scale;
        const screenY = centerY + y2 * scale;

        return { screenX, screenY, zIndex: z2, x3d: x2, y3d: y2, z3d: z2 };
      };

      // 1. Draw Deep Space Background Stars & Grid Glow
      ctx.save();
      const bgGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        globeRadius * 0.2,
        centerX,
        centerY,
        globeRadius * 2.5
      );
      bgGlow.addColorStop(0, "rgba(8, 25, 48, 0.5)");
      bgGlow.addColorStop(0.5, "rgba(5, 15, 30, 0.85)");
      bgGlow.addColorStop(1, "rgba(3, 7, 18, 1)");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // 2. Draw Atmosphere Outer Glow
      ctx.save();
      const atmoGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        globeRadius * 0.9,
        centerX,
        centerY,
        globeRadius * 1.38
      );
      atmoGlow.addColorStop(0, "rgba(34, 211, 238, 0.3)");
      atmoGlow.addColorStop(0.5, "rgba(6, 182, 212, 0.12)");
      atmoGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = atmoGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius * 1.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Draw Earth Sphere Base
      ctx.save();
      const earthGrad = ctx.createRadialGradient(
        centerX - globeRadius * 0.35,
        centerY - globeRadius * 0.35,
        globeRadius * 0.1,
        centerX,
        centerY,
        globeRadius
      );
      earthGrad.addColorStop(0, "#0e3a5d");
      earthGrad.addColorStop(0.5, "#071e36");
      earthGrad.addColorStop(0.85, "#030f1e");
      earthGrad.addColorStop(1, "#020710");

      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.fillStyle = earthGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(34, 211, 238, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Earth Latitude / Longitude Grid Lines
      ctx.strokeStyle = "rgba(56, 189, 248, 0.14)";
      ctx.lineWidth = 0.8;

      for (let lat = -60; lat <= 60; lat += 30) {
        const rad = (lat * Math.PI) / 180;
        const rLat = globeRadius * Math.cos(rad);
        const yLat = globeRadius * Math.sin(rad);

        ctx.beginPath();
        let first = true;
        for (let lon = 0; lon <= 360; lon += 10) {
          const lRad = (lon * Math.PI) / 180;
          const x = (rLat / globeRadius) * Math.cos(lRad);
          const z = (rLat / globeRadius) * Math.sin(lRad);
          const y = yLat / globeRadius;

          const proj = project3D(x, y, z);
          if (proj.zIndex > -0.1) {
            if (first) {
              ctx.moveTo(proj.screenX, proj.screenY);
              first = false;
            } else {
              ctx.lineTo(proj.screenX, proj.screenY);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      for (let lon = 0; lon < 360; lon += 45) {
        const lRad = (lon * Math.PI) / 180;
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 10) {
          const rad = (lat * Math.PI) / 180;
          const rLat = Math.cos(rad);
          const y = Math.sin(rad);
          const x = rLat * Math.cos(lRad);
          const z = rLat * Math.sin(lRad);

          const proj = project3D(x, y, z);
          if (proj.zIndex > -0.1) {
            if (first) {
              ctx.moveTo(proj.screenX, proj.screenY);
              first = false;
            } else {
              ctx.lineTo(proj.screenX, proj.screenY);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }
      ctx.restore();

      // 4. Update and Project Satellite Particles
      const projectedPoints: {
        pt: Point3D;
        screenX: number;
        screenY: number;
        zIndex: number;
      }[] = [];

      satellitesRef.current.forEach((pt) => {
        pt.meanAnomaly += pt.speed;
        if (pt.meanAnomaly > Math.PI * 2) pt.meanAnomaly -= Math.PI * 2;

        const u = pt.meanAnomaly;
        const xOrb = pt.baseRadius * Math.cos(u);
        const yOrb = pt.baseRadius * Math.sin(u);

        const cosInc = Math.cos(pt.inclination);
        const sinInc = Math.sin(pt.inclination);
        const cosRaan = Math.cos(pt.raan);
        const sinRaan = Math.sin(pt.raan);

        const x3d = xOrb * cosRaan - yOrb * cosInc * sinRaan;
        const z3d = xOrb * sinRaan + yOrb * cosInc * cosRaan;
        const y3d = yOrb * sinInc;

        const proj = project3D(x3d, y3d, z3d);
        projectedPoints.push({
          pt,
          screenX: proj.screenX,
          screenY: proj.screenY,
          zIndex: proj.zIndex,
        });
      });

      const visiblePoints = projectedPoints.filter(({ pt }) => {
        if (selectedShellFilter === "all") return true;
        return pt.shellId === selectedShellFilter;
      });

      visiblePoints.sort((a, b) => a.zIndex - b.zIndex);

      // 5. Draw Inter-Satellite Laser Mesh Connections
      if (showLaserMesh) {
        ctx.save();
        ctx.lineWidth = 0.5;
        const frontPoints = visiblePoints.filter((p) => p.zIndex > 0.1);
        const sampleCount = Math.min(frontPoints.length, 180);

        for (let i = 0; i < sampleCount; i++) {
          const p1 = frontPoints[i];
          for (let j = i + 1; j < Math.min(i + 10, sampleCount); j++) {
            const p2 = frontPoints[j];
            const dx = p1.screenX - p2.screenX;
            const dy = p1.screenY - p2.screenY;
            const distSq = dx * dx + dy * dy;

            if (distSq < 1800 && p1.pt.shellId === p2.pt.shellId) {
              const alpha = Math.max(0, 0.35 - distSq / 4200);
              ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(p1.screenX, p1.screenY);
              ctx.lineTo(p2.screenX, p2.screenY);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      // 6. Draw Satellites (Dots & Soft Halos)
      visiblePoints.forEach(({ pt, screenX, screenY, zIndex }) => {
        const isFront = zIndex > 0;
        const alpha = isFront ? Math.min(1, 0.4 + zIndex * 0.6) : Math.max(0.06, 0.18 + zIndex * 0.12);

        ctx.save();
        ctx.globalAlpha = alpha;

        // Front-facing satellites get soft glow halos
        if (isFront && zIndex > 0.3) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, pt.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = pt.shellId === "shell3" ? "rgba(251, 191, 36, 0.2)" : "rgba(34, 211, 238, 0.18)";
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, isFront ? pt.size : pt.size * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.fill();

        ctx.restore();
      });

      // 7. Front Atmosphere Limb Highlight
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      if (containerRef.current) resizeObs.unobserve(containerRef.current);
    };
  }, [isRotating, selectedShellFilter, zoomLevel, showLaserMesh]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;

    rotYRef.current += dx * 0.005;
    rotXRef.current = Math.max(-1.2, Math.min(1.2, rotXRef.current + dy * 0.005));

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setZoomLevel((prev) => Math.max(0.7, Math.min(2.0, prev - e.deltaY * 0.001)));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden border border-cyan-500/30 bg-[#030712] shadow-2xl transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "h-[480px] sm:h-[580px]"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      style={{ touchAction: "none" }}
    >
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left HUD Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 max-w-[280px] sm:max-w-md pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300 drop-shadow-md">
            Starlink Orbital Constellation 3D Globe
          </h2>
        </div>
        <p className="text-[10px] sm:text-[11px] text-neutral-300 font-mono bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/20">
          Starlink shell visualization · approx ~10,840 working sats as of Aug 2026 · illustrative density
        </p>
      </div>

      {/* Top Right Controls Overlay */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* ONE-CLICK "WHAT AM I LOOKING AT?" BUTTON */}
        <button
          onClick={() => setShowInfoPopover(!showInfoPopover)}
          className={`p-2 rounded-xl text-xs font-bold border backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer ${
            showInfoPopover
              ? "bg-cyan-400 text-black border-cyan-300 shadow-lg shadow-cyan-400/30"
              : "bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/90"
          }`}
          title="What am I looking at?"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">What am I looking at?</span>
        </button>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-2 rounded-xl text-xs font-bold border backdrop-blur-md transition-all flex items-center gap-1.5 ${
            isRotating
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30"
              : "bg-neutral-800/80 text-neutral-400 border-white/10 hover:text-white"
          }`}
          title={isRotating ? "Pause Auto Rotation" : "Start Auto Rotation"}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{isRotating ? "Orbiting" : "Paused"}</span>
        </button>

        <button
          onClick={() => setShowLaserMesh(!showLaserMesh)}
          className={`p-2 rounded-xl text-xs font-bold border backdrop-blur-md transition-all flex items-center gap-1.5 ${
            showLaserMesh
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-neutral-800/80 text-neutral-400 border-white/10"
          }`}
          title="Toggle Laser Mesh Links"
        >
          <Wifi className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Laser Mesh</span>
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-cyan-300 border border-cyan-500/30 backdrop-blur-md transition-all"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* ONE-CLICK INFO POPOVER MODAL */}
      {showInfoPopover && (
        <div className="absolute top-16 right-4 z-30 max-w-sm sm:max-w-md p-4 rounded-2xl bg-[#091322]/95 border border-cyan-400/50 backdrop-blur-xl shadow-2xl space-y-2 animate-fadeIn pointer-events-auto">
          <div className="flex items-center justify-between text-xs font-extrabold text-cyan-300 border-b border-white/10 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              What Am I Looking At?
            </span>
            <button
              onClick={() => setShowInfoPopover(false)}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-neutral-200 leading-relaxed font-sans">
            This 3D model renders the primary operational orbital shells of the Starlink megaconstellation using physics-based inclination vectors and mathematical particle density. Rather than tracking individual TLE NORAD IDs, it demonstrates orbital shell mechanics, inter-satellite laser mesh links, and global coverage density as of Aug 2026.
          </p>
          <div className="pt-1 flex justify-end">
            <button
              onClick={() => setShowInfoPopover(false)}
              className="px-3 py-1 rounded-lg bg-cyan-400 text-black font-extrabold text-[11px] hover:bg-cyan-300 transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Filter & Metrics HUD */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        {/* Shell Filters */}
        <div className="flex flex-wrap items-center gap-1 bg-black/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 px-2 flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            Shell:
          </span>
          {[
            { id: "all", label: "All Shells" },
            { id: "shell1", label: "Main LEO (53°)" },
            { id: "shell3", label: "Direct-Cell (350km)" },
            { id: "shell4", label: "Polar SSO (97°)" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedShellFilter(f.id)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                selectedShellFilter === f.id
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30"
                  : "text-neutral-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Live Metric Chip */}
        <div className="flex items-center gap-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold text-white">~{activeSatellitesCount.toLocaleString()}</span>
            <span className="text-neutral-400">Working Sats (approx, Aug 2026)</span>
          </div>
          <span className="text-neutral-600">|</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>530–560km LEO</span>
          </div>
        </div>
      </div>
    </div>
  );
};
