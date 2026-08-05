import React, { useState, useEffect, useRef } from "react";
import { StockTicker } from "../../types";
import {
  ShieldAlert,
  Radar,
  Radio,
  ExternalLink,
  Eye,
  Cpu,
  Layers,
  Search,
  Sparkles,
  FileText,
  AlertTriangle,
  Zap,
  Info,
  ChevronRight,
  Lock,
  Globe,
  Activity,
  Award,
  Terminal,
  Compass,
  Building2,
  TrendingUp,
  Maximize2,
  X,
} from "lucide-react";
import { triggerHaptic } from "../../utils/haptics";

interface WarGovUfoHubProps {
  allStocks?: StockTicker[];
  onSelectStock?: (stock: StockTicker) => void;
}

interface UapIncident {
  id: string;
  title: string;
  date: string;
  location: string;
  coordinates: string;
  branch:
    | "US Navy FLIR"
    | "US Air Force NORAD"
    | "Space Force Radar"
    | "Commercial FAA Pirep"
    | "DoD AARO Array";
  shape:
    | "Tic-Tac Cylinder"
    | "Spherical Orb"
    | "Triangular Craft"
    | "Trans-Medium Hydro"
    | "Variable Morphing";
  speedMach: string;
  altitude: string;
  accelerationG: string;
  sensorSpectrum: string;
  threatLevel:
    | "HIGH ANOMALY"
    | "UNRESOLVED"
    | "UNDER EVALUATION"
    | "CLASSIFIED PROPRIETARY";
  summary: string;
  sensorData: {
    radarCrossSection: string;
    thermalSignature: string;
    radioFrequency: string;
    acousticEmitter: string;
  };
  defenseContractorLink?: string;
  radarPos: { x: number; y: number }; // Percentage relative to center for radar map
}

interface DefenseStock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap: string;
  uapFocusRole: string;
  clearanceLevel: string;
}

const UAP_INCIDENTS: UapIncident[] = [
  {
    id: "UAP-2004-NIMITZ",
    title: 'USS Nimitz "Tic-Tac" FLIR1 Anomaly',
    date: "NOV 14, 2004",
    location: "Pacific Ocean (100mi SW of San Diego, CA)",
    coordinates: "31.24° N, 117.82° W",
    branch: "US Navy FLIR",
    shape: "Tic-Tac Cylinder",
    speedMach: "Mach 22+ (Instantaneous)",
    altitude: "80,000 ft to 50 ft in <0.78s",
    accelerationG: "750+ Gs",
    sensorSpectrum: "AN/ASQ-228 ATFLIR & SPY-1 Radar",
    threatLevel: "HIGH ANOMALY",
    summary:
      "40ft smooth white oblong vessel with no flight control surfaces, wings, or exhaust plumes. Demonstrated instantaneous acceleration, dropping 80,000 feet to sea level without generating a sonic boom or heat bloom.",
    sensorData: {
      radarCrossSection: "0.001 m² (Stealth / Zero Return)",
      thermalSignature: "Sub-ambient Cold Exterior",
      radioFrequency: "Broadband Active Jamming (X-Band)",
      acousticEmitter: "Zero Sonic Boom at Mach 3+",
    },
    defenseContractorLink: "LMT",
    radarPos: { x: 28, y: 68 },
  },
  {
    id: "UAP-2014-GIMBAL",
    title: 'USS Theodore Roosevelt "Gimbal" FLIR Tracker',
    date: "JAN 21, 2015",
    location: "Atlantic Ocean (Warning Area W-72, Jacksonville)",
    coordinates: "30.15° N, 80.42° W",
    branch: "US Navy FLIR",
    shape: "Variable Morphing",
    speedMach: "Mach 4.5 against 120kt Wind",
    altitude: "25,000 ft Stable Orbit",
    accelerationG: "120+ Gs",
    sensorSpectrum: "Raytheon APG-79 AESA Radar & FLIR",
    threatLevel: "UNRESOLVED",
    summary:
      "Rotating disc-like vehicle exhibiting a glowing thermal aura. Rotated 90 degrees against 120-knot hurricane-force headwinds while remaining perfectly stationary relative to vector drift.",
    sensorData: {
      radarCrossSection: "Fluctuating Plasma Envelope",
      thermalSignature: "High-Heat Central Rotor, Cold Perimeter",
      radioFrequency: "2.99 GHz Pulsed Microwave",
      acousticEmitter: "None Detected",
    },
    defenseContractorLink: "RTX",
    radarPos: { x: 74, y: 62 },
  },
  {
    id: "UAP-2015-GOFAST",
    title: 'Atlantic Fleet "GoFast" Low-Altitude Hydro Encounter',
    date: "JAN 21, 2015",
    location: "US East Coast Offshore Operating Area",
    coordinates: "32.88° N, 78.12° W",
    branch: "US Navy FLIR",
    shape: "Spherical Orb",
    speedMach: "Mach 1.8 at Water Baseline",
    altitude: "50 ft Above Sea Surface",
    accelerationG: "90+ Gs",
    sensorSpectrum: "Raytheon ATFLIR Auto-Track",
    threatLevel: "HIGH ANOMALY",
    summary:
      "Small, highly luminous spherical object captured on auto-lock FLIR moving at hypersonic speed just inches above ocean waves without producing wake turbulence or water displacement.",
    sensorData: {
      radarCrossSection: "Ultra-small (<0.01 m²)",
      thermalSignature: "Negative Delta-T Thermal Signature",
      radioFrequency: "Passive RF Pulse Spectrum",
      acousticEmitter: "Hydro-Acoustic Muted",
    },
    defenseContractorLink: "NOC",
    radarPos: { x: 80, y: 52 },
  },
  {
    id: "UAP-2023-NORAD-01",
    title: "NORAD Sector 9 High-Altitude Arctic Trans-Medium Probe",
    date: "FEB 11, 2023",
    location: "Deadhorse / Beaufort Sea, Alaska",
    coordinates: "70.20° N, 148.46° W",
    branch: "US Air Force NORAD",
    shape: "Triangular Craft",
    speedMach: "Mach 8.0 Stationary-Hover Shift",
    altitude: "40,000 ft Arctic Airspace",
    accelerationG: "300+ Gs",
    sensorSpectrum: "E-3 Sentry AWACS & F-22 Raptor Optics",
    threatLevel: "CLASSIFIED PROPRIETARY",
    summary:
      "Cylindrical metallic craft tracked entering US sovereign airspace from orbital trajectory. Kinetic recovery operation launched with high frequency RF jamming active throughout engagement.",
    sensorData: {
      radarCrossSection: "Metallic Metallic-Lattice Array",
      thermalSignature: "Zero Propulsive Heat Exhaust",
      radioFrequency: "High Frequency UHF Telemetry",
      acousticEmitter: "Inaudible",
    },
    defenseContractorLink: "BA",
    radarPos: { x: 22, y: 20 },
  },
  {
    id: "UAP-2024-GULF-HYDRO",
    title: "Gulf of Mexico Deep Trench Trans-Medium Anomaly",
    date: "OCT 04, 2024",
    location: "De Soto Canyon, Gulf of Mexico",
    coordinates: "28.50° N, 87.20° W",
    branch: "DoD AARO Array",
    shape: "Trans-Medium Hydro",
    speedMach: "200 Knots Submerged / Mach 12 Airborne",
    altitude: "-2,400 ft Ocean to 60,000 ft Space",
    accelerationG: "500+ Gs",
    sensorSpectrum: "Integrated Sonar & Satellite Optical IR",
    threatLevel: "HIGH ANOMALY",
    summary:
      "Hydro-acoustic sonar array registered object transitioning seamlessly from deep ocean floor at 200 knots into open atmosphere without splash, water resistance, or thermal shock.",
    sensorData: {
      radarCrossSection: "Gravitational Cavitation Bubble",
      thermalSignature: "Ambient Water Matching",
      radioFrequency: "ELF Sub-surface Resonance",
      acousticEmitter: "Hydro-Acoustic Cavitation Suppression",
    },
    defenseContractorLink: "PLTR",
    radarPos: { x: 58, y: 76 },
  },
];

const DEFENSE_EQUITIES: DefenseStock[] = [
  {
    symbol: "LMT",
    name: "Lockheed Martin Corp (Skunk Works)",
    price: 462.8,
    changePercent: 1.85,
    marketCap: "$112B",
    uapFocusRole:
      "Advanced Aerospace Prototyping & Exotic Propulsion Reverse Engineering",
    clearanceLevel: "TOP SECRET // SCI // SAP",
  },
  {
    symbol: "NOC",
    name: "Northrop Grumman Corp",
    price: 498.4,
    changePercent: 2.1,
    marketCap: "$74B",
    uapFocusRole:
      "Next Gen B-21 Stealth, Space Tracking Radar & High-Altitude Optics",
    clearanceLevel: "TOP SECRET // BYEMAN",
  },
  {
    symbol: "RTX",
    name: "Raytheon Technologies (RTX)",
    price: 118.5,
    changePercent: 0.95,
    marketCap: "$158B",
    uapFocusRole:
      "APG-79 AESA Radars, FLIR Sensors & Directed Energy Laser Defense",
    clearanceLevel: "SECRET // NOFORN",
  },
  {
    symbol: "BA",
    name: "Boeing Defense & Security (Phantom Works)",
    price: 178.2,
    changePercent: -0.45,
    marketCap: "$108B",
    uapFocusRole:
      "Autonomous Hypersonic Airframes & Orbital Defense Interceptors",
    clearanceLevel: "TOP SECRET // SPECIAL ACCESS",
  },
  {
    symbol: "PLTR",
    name: "Palantir Technologies (Gotham Defense )",
    price: 44.2,
    changePercent: 4.8,
    marketCap: "$98B",
    uapFocusRole: "DoD AARO Threat Telemetry Aggregation & Anomaly Trajectory ",
    clearanceLevel: "SECRET // FEDRAMP HIGH",
  },
  {
    symbol: "KTOS",
    name: "Kratos Defense & Security Solutions",
    price: 24.8,
    changePercent: 3.25,
    marketCap: "$3.8B",
    uapFocusRole:
      "Unmanned High Speed Tactical Target Drones & Directed Energy Testing",
    clearanceLevel: "SECRET // SPECIAL ACCESS",
  },
];

export const WarGovUfoHub: React.FC<WarGovUfoHubProps> = ({
  allStocks,
  onSelectStock,
}) => {
  const [activeTab, setActiveTab] = useState<
    "incidents" | "radar" | "equities" | "physics" | "whistleblower"
  >("incidents");
  const [selectedIncident, setSelectedIncident] = useState<UapIncident | null>(
    UAP_INCIDENTS[0],
  );
  const [incidentFilter, setIncidentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [radarSweepAngle, setRadarSweepAngle] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Radar Animation Loop
  useEffect(() => {
    let animFrameId: number;
    const animateRadar = () => {
      setRadarSweepAngle((prev) => (prev + 1.5) % 360);
      animFrameId = requestAnimationFrame(animateRadar);
    };
    animFrameId = requestAnimationFrame(animateRadar);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  // Draw Radar Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear background
    ctx.fillStyle = "#020d14";
    ctx.fillRect(0, 0, width, height);

    // Concentric Radar Rings
    ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
    ctx.lineWidth = 1;

    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 4) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // Radar Sweep Line & Gradient Cone
    const sweepRad = (radarSweepAngle * Math.PI) / 180;
    const endX = centerX + Math.cos(sweepRad) * radius;
    const endY = centerY + Math.sin(sweepRad) * radius;

    // Gradient Sweep Cone
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, sweepRad - 0.4, sweepRad);
    ctx.closePath();
    const grad = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius,
    );
    grad.addColorStop(0, "rgba(6, 182, 212, 0.4)");
    grad.addColorStop(1, "rgba(6, 182, 212, 0.05)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Sweep Line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Plot UAP Incident Blips
    UAP_INCIDENTS.forEach((inc) => {
      const blipX = (inc.radarPos.x / 100) * width;
      const blipY = (inc.radarPos.y / 100) * height;

      // Distance & Angle calculation for sweep intensity
      const dx = blipX - centerX;
      const dy = blipY - centerY;
      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += Math.PI * 2;

      const angleDiff = Math.abs(angle - sweepRad);
      const isHit = angleDiff < 0.2 || angleDiff > Math.PI * 2 - 0.2;

      const isSelected = selectedIncident?.id === inc.id;

      // Draw Glowing Blip
      ctx.beginPath();
      ctx.arc(blipX, blipY, isSelected ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? "#fbbf24" : isHit ? "#f43f5e" : "#38bdf8";
      ctx.fill();

      // Outer Ping Ring
      if (isHit || isSelected) {
        ctx.beginPath();
        ctx.arc(blipX, blipY, isSelected ? 12 : 8, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected
          ? "rgba(251, 191, 36, 0.8)"
          : "rgba(244, 63, 94, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = isSelected ? "#fbbf24" : "#a5f3fc";
      ctx.font = "9px monospace";
      ctx.fillText(inc.id.replace("UAP-", ""), blipX + 8, blipY + 3);
    });
  }, [radarSweepAngle, selectedIncident]);

  const filteredIncidents = UAP_INCIDENTS.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.shape.toLowerCase().includes(searchQuery.toLowerCase());

    if (incidentFilter === "all") return matchesSearch;
    if (incidentFilter === "navy")
      return matchesSearch && inc.branch.includes("Navy");
    if (incidentFilter === "norad")
      return matchesSearch && inc.branch.includes("NORAD");
    if (incidentFilter === "hydro")
      return (
        matchesSearch &&
        (inc.shape.includes("Hydro") || inc.branch.includes("AARO"))
      );
    return matchesSearch;
  });

  return (
    <div className="w-full space-y-4 font-mono select-none">
      {/* DoD War.gov / UFO Security Banner Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#020b14] border-2 border-cyan-500/40 alien-block-cut relative overflow-hidden shadow-2xl shadow-cyan-500/20">
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-400/60 text-cyan-300 shadow-lg shadow-cyan-500/30 alien-block-cut-sm">
              <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2 py-0.5 border border-amber-500/40 alien-block-cut-sm">
                  WAR.GOV / UFO DEFENSE MATRIX
                </span>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 border border-emerald-500/40 alien-block-cut-sm flex items-center gap-1">
                  <Radar className="w-2.5 h-2.5 text-emerald-400 animate-spin-slow" />
                  AARO SENSOR FEED LIVE
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-cyan-100 tracking-wider mt-1 uppercase">
                PENTAGON AARO & UAP INTELLIGENCE HUB
              </h1>
            </div>
          </div>

          <a
            href="https://www.aaro.mil"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 alien-block-cut-sm bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs shadow-lg shadow-cyan-500/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>OFFICIAL WAR.GOV / AARO PORTAL</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20">
            <span className="text-[9px] text-cyan-400/80 uppercase font-extrabold block">
              AARO Sighting Database
            </span>
            <span className="text-sm font-black text-amber-300 mt-0.5 block">
              1,842 Declassified Logs
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20">
            <span className="text-[9px] text-cyan-400/80 uppercase font-extrabold block">
              Active Sensor Arrays
            </span>
            <span className="text-sm font-black text-cyan-200 mt-0.5 block">
              FLIR / NORAD / AESA Radar
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20">
            <span className="text-[9px] text-cyan-400/80 uppercase font-extrabold block">
              Trans-Medium Speed
            </span>
            <span className="text-sm font-black text-emerald-300 mt-0.5 block">
              Mach 20+ (No Sonic Boom)
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20">
            <span className="text-[9px] text-cyan-400/80 uppercase font-extrabold block">
              Classification
            </span>
            <span className="text-sm font-black text-purple-300 mt-0.5 block">
              UNCLASSIFIED // FVEY
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          { id: "incidents", label: "Declassified Incidents", icon: FileText },
          { id: "radar", label: "Live Radar Sweep", icon: Radar },
          {
            id: "equities",
            label: "Defense & Aerospace Stocks",
            icon: Building2,
          },
          { id: "physics", label: "Observed Physics", icon: Zap },
          {
            id: "whistleblower",
            label: "Congressional Briefings",
            icon: Award,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic("selection");
                setActiveTab(tab.id as any);
              }}
              className={`px-3.5 py-2 alien-block-cut-sm text-xs font-black shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/30 border border-cyan-200"
                  : "bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: Declassified Incidents */}
      {activeTab === "incidents" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3 rounded-2xl bg-[#030f1b] border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                placeholder="Search FLIR, Nimitz, Gimbal, Mach speed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-cyan-100 placeholder-cyan-600 outline-none w-full sm:w-64 font-mono"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
              {[
                { id: "all", label: "All Reports" },
                { id: "navy", label: "US Navy FLIR" },
                { id: "norad", label: "NORAD Airspace" },
                { id: "hydro", label: "Trans-Medium Hydro" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setIncidentFilter(f.id)}
                  className={`px-2.5 py-1 alien-block-cut-sm text-[10px] font-black uppercase transition-all cursor-pointer ${
                    incidentFilter === f.id
                      ? "bg-amber-400 text-black"
                      : "bg-cyan-950/60 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Incidents List & Selected Incident Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* List */}
            <div className="lg:col-span-6 space-y-2.5">
              {filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      triggerHaptic("light");
                      setSelectedIncident(inc);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-cyan-950/90 border-cyan-400 shadow-xl shadow-cyan-500/20"
                        : "bg-[#030e18]/80 hover:bg-cyan-950/40 border-cyan-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-300 bg-amber-950/80 px-2 py-0.5 border border-amber-500/40 alien-block-cut-sm">
                        {inc.id}
                      </span>
                      <span className="text-[10px] font-bold text-cyan-400 font-mono">
                        {inc.date}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-cyan-100 mt-2 leading-snug">
                      {inc.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] font-mono text-cyan-300/80">
                      <span className="bg-cyan-950 px-2 py-0.5 border border-cyan-500/30 rounded-md">
                        {inc.branch}
                      </span>
                      <span className="bg-cyan-950 px-2 py-0.5 border border-cyan-500/30 rounded-md text-amber-300">
                        {inc.shape}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {inc.speedMach}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Dossier Box */}
            <div className="lg:col-span-6">
              {selectedIncident ? (
                <div className="p-4 sm:p-5 rounded-3xl bg-[#020b14] border-2 border-cyan-400/50 alien-block-cut space-y-4 shadow-2xl relative">
                  <div className="hud-corner-tl" />
                  <div className="hud-corner-tr" />
                  <div className="hud-corner-bl" />
                  <div className="hud-corner-br" />

                  <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-black text-cyan-400 tracking-widest block">
                        DoD AARO CLASSIFIED CASE DOSSIER
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-cyan-100 mt-0.5 animate-periodic-text-glitch">
                        {selectedIncident.title}
                      </h2>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-black uppercase text-amber-300 bg-amber-950/80 border border-amber-500/50 alien-block-cut-sm">
                      {selectedIncident.threatLevel}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-neutral-300 leading-relaxed font-sans bg-cyan-950/30 p-3 rounded-2xl border border-cyan-500/20">
                    {selectedIncident.summary}
                  </p>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/20">
                      <span className="text-[9px] text-cyan-400 uppercase font-bold block">
                        Coordinates / Area
                      </span>
                      <span className="text-xs font-black text-cyan-200 mt-0.5 block">
                        {selectedIncident.coordinates}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/20">
                      <span className="text-[9px] text-cyan-400 uppercase font-bold block">
                        Peak G-Force Acceleration
                      </span>
                      <span className="text-xs font-black text-rose-300 mt-0.5 block">
                        {selectedIncident.accelerationG}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/20">
                      <span className="text-[9px] text-cyan-400 uppercase font-bold block">
                        Altitude Vector
                      </span>
                      <span className="text-xs font-black text-amber-300 mt-0.5 block">
                        {selectedIncident.altitude}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/20">
                      <span className="text-[9px] text-cyan-400 uppercase font-bold block">
                        Sensor Spectrum
                      </span>
                      <span className="text-xs font-black text-emerald-300 mt-0.5 block">
                        {selectedIncident.sensorSpectrum}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Sensor Spectrogram Breakdown */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      DoD Sensor Telemetry & Radar Return
                    </span>
                    <div className="p-3 rounded-2xl bg-[#010810] border border-cyan-500/30 space-y-1.5 text-xs">
                      <div className="flex justify-between border-b border-cyan-900/60 pb-1">
                        <span className="text-cyan-400/80">
                          Radar Cross Section (RCS):
                        </span>
                        <span className="font-bold text-cyan-200">
                          {selectedIncident.sensorData.radarCrossSection}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-cyan-900/60 pb-1">
                        <span className="text-cyan-400/80">
                          Thermal IR Signature:
                        </span>
                        <span className="font-bold text-cyan-200">
                          {selectedIncident.sensorData.thermalSignature}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-cyan-900/60 pb-1">
                        <span className="text-cyan-400/80">
                          Radio Frequency Emission:
                        </span>
                        <span className="font-bold text-cyan-200">
                          {selectedIncident.sensorData.radioFrequency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-400/80">
                          Acoustic / Hydro Signature:
                        </span>
                        <span className="font-bold text-cyan-200">
                          {selectedIncident.sensorData.acousticEmitter}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Live Radar Anomaly Sweep */}
      {activeTab === "radar" && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#020b14] border-2 border-cyan-500/40 alien-block-cut space-y-4 shadow-2xl relative">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div className="hud-corner-br" />

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/30 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest block">
                WAR.GOV // NORAD MULTI-SPECTRUM RADAR ARRAY
              </span>
              <h2 className="text-base sm:text-lg font-black text-cyan-100 mt-0.5 flex items-center gap-2 animate-periodic-text-glitch">
                <Radar className="w-5 h-5 text-emerald-400 animate-spin-slow" />
                ACTIVE US AIRSPACE & TRANS-MEDIUM SWEEP
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 border border-emerald-500/40 alien-block-cut-sm">
              SWEEP FREQUENCY: 2.99 GHz AESA
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Canvas Radar Screen */}
            <div className="relative shrink-0 flex items-center justify-center p-2 rounded-3xl bg-[#010810] border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20">
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                className="rounded-2xl cursor-pointer"
                onClick={(e) => {
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const rect = canvas.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;

                  // Find closest incident
                  let closest: UapIncident | null = null;
                  let minDist = 999;
                  UAP_INCIDENTS.forEach((inc) => {
                    const dist = Math.hypot(
                      inc.radarPos.x - x,
                      inc.radarPos.y - y,
                    );
                    if (dist < minDist) {
                      minDist = dist;
                      closest = inc;
                    }
                  });

                  if (closest && minDist < 25) {
                    triggerHaptic("medium");
                    setSelectedIncident(closest);
                  }
                }}
              />
            </div>

            {/* Selected Target Radar Card */}
            <div className="flex-1 w-full space-y-3">
              <span className="text-[10px] font-bold uppercase text-amber-300 tracking-wider block">
                Target Selected on Radar Array
              </span>

              {selectedIncident && (
                <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-400/60 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-amber-300">
                      {selectedIncident.id}
                    </span>
                    <span className="text-[10px] text-cyan-400">
                      {selectedIncident.branch}
                    </span>
                  </div>
                  <h4 className="font-black text-cyan-100 text-sm animate-periodic-text-glitch">
                    {selectedIncident.title}
                  </h4>
                  <p className="text-[11px] text-neutral-300 leading-snug">
                    {selectedIncident.summary}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-cyan-900 text-[10px]">
                    <span className="text-emerald-300 font-bold">
                      Speed: {selectedIncident.speedMach}
                    </span>
                    <span className="text-amber-300 font-bold">
                      G-Force: {selectedIncident.accelerationG}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Defense & Aerospace Equities */}
      {activeTab === "equities" && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#020b14] border-2 border-cyan-500/40 alien-block-cut space-y-4 shadow-2xl relative">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div className="hud-corner-br" />

          <div>
            <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest block">
              AEROSPACE & DEFENSE CONTRACTORS WATCHLIST
            </span>
            <h2 className="text-base sm:text-lg font-black text-cyan-100 mt-0.5 animate-periodic-text-glitch">
              DEFENSE CONTRACTORS LINKED TO EXOTIC PROPULSION & UAP SENSOR TECH
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEFENSE_EQUITIES.map((stock) => {
              const matchedInWatchlist = allStocks?.find(
                (s) => s.symbol.toUpperCase() === stock.symbol,
              );
              return (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    triggerHaptic("light");
                    if (matchedInWatchlist && onSelectStock) {
                      onSelectStock(matchedInWatchlist);
                    }
                  }}
                  className="p-3.5 rounded-2xl bg-[#030e18]/80 hover:bg-cyan-950/60 border border-cyan-500/30 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-cyan-300 group-hover:text-amber-300 transition-colors">
                        ${stock.symbol}
                      </span>
                      <span className="text-[9px] font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 border border-cyan-500/30 alien-block-cut-sm">
                        {stock.clearanceLevel}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-xs text-cyan-100">
                        ${stock.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] font-black block ${stock.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {stock.changePercent >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-cyan-200/90 font-medium leading-snug">
                    {stock.name}
                  </p>

                  <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[10px] text-cyan-300/80 leading-snug">
                    <span className="font-bold text-amber-300 block mb-0.5">
                      UAP / Defense Role:
                    </span>
                    {stock.uapFocusRole}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: Observed Physics */}
      {activeTab === "physics" && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#020b14] border-2 border-cyan-500/40 alien-block-cut space-y-4 shadow-2xl relative">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div className="hud-corner-br" />

          <div>
            <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest block">
              PENTAGON AARO OBSERVATION MATRIX
            </span>
            <h2 className="text-base sm:text-lg font-black text-cyan-100 mt-0.5 animate-periodic-text-glitch">
              THE 5 OBSERVABLE ANOMALOUS CAPABILITIES
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                title: "1. Instantaneous Acceleration & Hypersonic Velocity",
                description:
                  "Objects achieving speeds exceeding Mach 20 without generating sonic booms, aerodynamic shockwaves, or thermal friction blooms.",
              },
              {
                title: "2. Trans-Medium Travel (Space, Air, Ocean)",
                description:
                  "Seamless transition between orbital outer space, open atmosphere, and deep ocean underwater environments at several hundred knots with zero cavitation or splash.",
              },
              {
                title: "3. Anti-Gravity & Positive Lift Control",
                description:
                  "Ability to remain stationary in hurricane-force 120kt winds without wings, rotors, control surfaces, or visible engine exhaust.",
              },
              {
                title: "4. Signature Reduction & Optical Cloaking",
                description:
                  "Low-to-zero radar cross sections, active microwave radar jamming, and bending of visible light or thermal infrared emissions.",
              },
              {
                title: "5. Advanced Metamaterials & Zero-Point Fields",
                description:
                  "Exotic engineered isotope lattices capable of manipulating gravitational mass and vacuum energy fields.",
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#030e18] border border-cyan-500/30 space-y-1"
              >
                <h3 className="font-black text-amber-300 text-sm">{p.title}</h3>
                <p className="text-neutral-300 leading-relaxed font-sans">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: Whistleblower & Congressional Briefings */}
      {activeTab === "whistleblower" && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#020b14] border-2 border-cyan-500/40 alien-block-cut space-y-4 shadow-2xl relative">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div className="hud-corner-br" />

          <div>
            <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest block">
              US CONGRESSIONAL OVERSIGHT & TESTIMONY
            </span>
            <h2 className="text-base sm:text-lg font-black text-cyan-100 mt-0.5 animate-periodic-text-glitch">
              DECLASSIFIED LEGISLATIVE BRIEFINGS & TESTIMONY
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#030e18] border border-cyan-500/30 space-y-1.5">
              <span className="text-[10px] font-bold text-amber-300 uppercase bg-amber-950 px-2 py-0.5 border border-amber-500/40 alien-block-cut-sm">
                David Grusch (Former NGA / NRO Intelligence Officer)
              </span>
              <p className="text-cyan-100 font-bold">
                116-Page Classified ICIG Complaint & Public Hearing
              </p>
              <p className="text-neutral-300 leading-relaxed font-sans">
                Testified under oath regarding multi-decade legacy crash
                retrieval programs and exotic materials held by private
                aerospace defense contractors outside Congressional oversight.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#030e18] border border-cyan-500/30 space-y-1.5">
              <span className="text-[10px] font-bold text-cyan-300 uppercase bg-cyan-950 px-2 py-0.5 border border-cyan-500/40 alien-block-cut-sm">
                Commander David Fravor (Black Aces F/A-18F Squadron Commander)
              </span>
              <p className="text-cyan-100 font-bold">
                USS Nimitz Strike Group Intercept Testimony
              </p>
              <p className="text-neutral-300 leading-relaxed font-sans">
                Eyewitness pilot account of engaging the 40-foot Tic-Tac craft
                that actively jammed radar and mimicked flight path maneuvers
                before accelerating out of visual range in under two seconds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
