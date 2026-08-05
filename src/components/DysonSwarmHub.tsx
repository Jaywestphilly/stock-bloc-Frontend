import React, { useState, useEffect, useRef } from "react";
import {
  SPACEX_LAUNCHES,
  PLANET_LABS_MISSIONS,
  STARLINK_SHELLS,
  DYSON_POWER_METRICS,
  SPACEX_HISTORY_ROADMAP,
  SPACE_DOCUMENTARIES,
  NASA_ARTEMIS_MISSIONS,
  DYSON_SWARM_EXPLAINER_CONCEPTS,
  SPACEX_OFFICIAL_PORTALS,
  SpaceXLaunch,
  PlanetLabsMission,
  StarlinkShell,
} from "../data/dysonSpaceData";
import {
  Orbit,
  Rocket,
  Satellite,
  Zap,
  Globe,
  Radio,
  RefreshCw,
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  ShieldAlert,
  Shield,
  TrendingUp,
  Activity,
  Info,
  ArrowUpRight,
  ChevronRight,
  Wifi,
  Target,
  Bell,
  BellRing,
  Calendar,
  CalendarCheck,
  Flame,
  Check,
  Share2,
  BookOpen,
  Film,
  Moon,
  Lightbulb,
  History,
  Play,
  Video,
  Award,
  Compass,
  Cpu,
  Layers as LayersIcon,
  X,
  Youtube,
} from "lucide-react";
import { triggerHaptic } from "../utils/haptics";
import { DysonLiveData, DysonLaunch, DysonStory } from "../types";

type DysonSubTab =
  | "launch_countdown"
  | "spacex_portals"
  | "dyson_101"
  | "spacex_history"
  | "space_docs"
  | "artemis_moon"
  | "starlink_tracker"
  | "spacex_launches"
  | "planet_labs"
  | "dyson_power";

interface SpaceUpdatesResponse {
  summary: string;
  bulletPoints: string[];
  starlinkCountEstimate: string;
  nextMajorLaunch: string;
  lastUpdated: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

const calculateTimeRemaining = (targetIsoDate: string): TimeRemaining => {
  const target = new Date(targetIsoDate).getTime();
  const now = new Date().getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
};

const generateGoogleCalendarUrl = (launch: SpaceXLaunch) => {
  const startDate = new Date(launch.targetIsoDate);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const title = encodeURIComponent(
    `🚀 ${launch.provider}: ${launch.missionName} Rocket Launch`,
  );
  const details = encodeURIComponent(
    `${launch.summary}\n\nRocket: ${launch.rocket}\nSite: ${launch.launchSite}\nWebcast: ${launch.webcastUrl}`,
  );
  const location = encodeURIComponent(launch.launchSite);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(startDate)}/${fmt(endDate)}&details=${details}&location=${location}`;
};

const downloadIcsFile = (launch: SpaceXLaunch) => {
  const startDate = new Date(launch.targetIsoDate);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dyson Swarm Hub//Rocket Launch Countdown//EN",
    "BEGIN:VEVENT",
    `UID:launch-${launch.id}@dysonswarm.hub`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(startDate)}`,
    `DTEND:${fmt(endDate)}`,
    `SUMMARY:🚀 ${launch.provider}: ${launch.missionName}`,
    `DESCRIPTION:${launch.summary} | Rocket: ${launch.rocket} | Site: ${launch.launchSite}`,
    `LOCATION:${launch.launchSite}`,
    `URL:${launch.webcastUrl}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Rocket Launch T-minus 15 Minutes!",
    "TRIGGER:-PT15M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${launch.missionName.replace(/[^a-z0-9]/gi, "_")}_Launch.ics`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const SPACE_ECONOMY_STOCKS = [
  {
    symbol: "ASTS",
    name: "AST SpaceMobile",
    role: "Direct-to-Cell Space Broadband",
    relation: "Deploys massive phased-array BlueBird satellites on SpaceX Falcon 9 to connect unmodified smartphone handsets globally.",
    bulletin: "Key Partner with SpaceX & Telecom Giants (AT&T, Verizon, Vodafone).",
    marketTag: "Direct-to-Cell Leader",
    color: "cyan",
  },
  {
    symbol: "RKLB",
    name: "Rocket Lab USA",
    role: "Smallsat Launch & Space Systems",
    relation: "Builds solar panels, satellite buses, and Electron/Neutron medium-lift reusable rockets.",
    bulletin: "Major supplier of solar cell technology for commercial satellite megaconstellations.",
    marketTag: "SmallSat & Solar Systems",
    color: "amber",
  },
  {
    symbol: "PL",
    name: "Planet Labs PBC",
    role: "Daily Earth Imaging Fleet",
    relation: "Operates 240+ Earth-scanning satellites launched on SpaceX Transporter rideshare missions.",
    bulletin: "Provides real-time geospatial intelligence feeds for agricultural, climate, and defense AI.",
    marketTag: "Geospatial AI Fleet",
    color: "emerald",
  },
  {
    symbol: "LUNR",
    name: "Intuitive Machines",
    role: "Artemis Lunar Logistics Contractor",
    relation: "Nova-C commercial landers delivered to the Lunar South Pole on SpaceX Falcon 9 rockets.",
    bulletin: "Building NASA lunar surface communications & power infrastructure.",
    marketTag: "Lunar Surface Logistics",
    color: "purple",
  },
  {
    symbol: "SATS",
    name: "EchoStar / HughesNet",
    role: "Satellite Communications & Spectrum",
    relation: "Commercial satcom provider holding key global satellite spectrum and enterprise hybrid networks.",
    bulletin: "Adapting to direct LEO internet competition and hybrid satellite mesh routing.",
    marketTag: "SatCom & Spectrum",
    color: "rose",
  },
  {
    symbol: "DXYZ",
    name: "Destiny Tech100",
    role: "Public Pre-IPO Equity Fund",
    relation: "Publicly traded fund holding significant pre-IPO equity allocations in SpaceX private shares.",
    bulletin: "Provides retail investors public market valuation exposure to SpaceX & Starlink growth.",
    marketTag: "SpaceX Equity Exposure",
    color: "blue",
  },
];

const DYSON_EVOLUTION_STAGES = [
  {
    stage: "Stage 1",
    title: "LEO Megaconstellations",
    era: "2020s - Present",
    tech: "Starlink v2 Mini/v3, OneWeb, Amazon Kuiper",
    powerCap: "15 - 50 Megawatts",
    color: "border-cyan-500/40 bg-cyan-950/20 text-cyan-300",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    description: "Deployment of 10,000+ automated low-Earth orbit satellites. Establishes mass-production orbital manufacturing, automated collision avoidance, and direct-to-cellular space broadband."
  },
  {
    stage: "Stage 2",
    title: "Lunar Foundry & Wireless Beaming",
    era: "2030s - 2040s",
    tech: "Starship Moon Logistics, Regolith Photovoltaic Foundry, Laser Power Links",
    powerCap: "100+ Gigawatts",
    color: "border-amber-500/40 bg-amber-950/20 text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    description: "Extracting silicon and aluminum from lunar regolith to construct thin-film solar reflectors without gravity well launch penalties. Beaming microwave solar power to orbital stations."
  },
  {
    stage: "Stage 3",
    title: "Geostationary Solar Swarm Ring",
    era: "2050s - 2080s",
    tech: "Self-Assembling Orbital Solar Reflectors, Space Datacenters, Microwave Energy Depots",
    powerCap: "10+ Terawatts",
    color: "border-emerald-500/40 bg-emerald-950/20 text-emerald-300",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    description: "An orbiting equatorial ring of millions of autonomous photovoltaic solar mirrors beaming continuous 24/7 zero-carbon power directly to planetary AI compute hubs."
  },
  {
    stage: "Stage 4",
    title: "Full Kardashev Type II Dyson Swarm",
    era: "2100+",
    tech: "Sun-Encircling Solar Sails, Light Pressure Propulsion, Interstellar Compute Grid",
    powerCap: "384 Yottawatts (10²⁶ Watts)",
    color: "border-purple-500/40 bg-purple-950/20 text-purple-300",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    description: "A dense, non-solid swarm of millions of solar collector satellites encircling the Sun. Captures total stellar energy output, powering planetary terraforming and deep space exploration."
  }
];

import { StockTicker } from "../types";

interface DysonSwarmHubProps {
  stocks?: StockTicker[];
}

export const DysonSwarmHub: React.FC<DysonSwarmHubProps> = ({ stocks = [] }) => {
  const [timezoneMode, setTimezoneMode] = useState<"local" | "utc" | "site">("local");
  const [activeSubTab, setActiveSubTab] =
    useState<DysonSubTab>("launch_countdown");
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [showEmbeddedSatelliteMap, setShowEmbeddedSatelliteMap] =
    useState(false);
  const [dysonLiveData, setDysonLiveData] = useState<DysonLiveData | null>(null);
  
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/Jaywestphilly/stock-bloc-backend/main/dyson_swarm_data.json")
      .then((res) => res.json())
      .then((data) => setDysonLiveData(data))
      .catch((err) => console.error("Error fetching dyson live data:", err));
  }, []);

  const [spaceUpdates, setSpaceUpdates] = useState<SpaceUpdatesResponse | null>(
    null,
  );
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);
  const [selectedShellId, setSelectedShellId] = useState<string>("all");
  const [selectedRocketFilter, setSelectedRocketFilter] =
    useState<string>("all");
  const [launchProviderFilter, setLaunchProviderFilter] = useState<
    "all" | "SpaceX" | "Planet Labs"
  >("all");
  const [notifiedLaunchIds, setNotifiedLaunchIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("dyson_launch_notifications");
      return saved ? JSON.parse(saved) : ["spx-2", "pl-launch-1"];
    } catch {
      return ["spx-2", "pl-launch-1"];
    }
  });

  // Timezone display formatter for launch windows
  const formatLaunchTime = (
    isoDate: string,
    timeUTC: string,
    siteName: string,
    mode: "local" | "utc" | "site",
  ): string => {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return `${timeUTC} UTC`;

    if (mode === "utc") {
      return `${timeUTC} UTC`;
    }

    if (mode === "local") {
      const timeStr = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateStr = d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
      return `${dateStr}, ${timeStr} (Your Local Time)`;
    }

    // Site Local Time Mode
    let targetTz = "America/New_York"; // Default ET
    let tzLabel = "EDT";
    if (
      siteName.includes("Starbase") ||
      siteName.includes("Boca Chica") ||
      siteName.includes("Texas")
    ) {
      targetTz = "America/Chicago";
      tzLabel = "CDT";
    } else if (
      siteName.includes("Vandenberg") ||
      siteName.includes("California")
    ) {
      targetTz = "America/Los_Angeles";
      tzLabel = "PDT";
    } else if (siteName.includes("Kwajalein")) {
      targetTz = "Pacific/Kwajalein";
      tzLabel = "MHT";
    }

    try {
      const timeStr = d.toLocaleTimeString("en-US", {
        timeZone: targetTz,
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateStr = d.toLocaleDateString("en-US", {
        timeZone: targetTz,
        month: "short",
        day: "numeric",
      });
      return `${dateStr}, ${timeStr} ${tzLabel}`;
    } catch {
      return `${timeUTC} UTC`;
    }
  };

  // Custom Mission Search State for Live Web Grounding Verification
  const [missionSearchQuery, setMissionSearchQuery] = useState("");
  const [isSearchingMission, setIsSearchingMission] = useState(false);
  const [missionSearchResult, setMissionSearchResult] = useState<{
    query: string;
    result: string;
    sources: { title: string; url: string }[];
  } | null>(null);

  const handleSearchMission = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!missionSearchQuery.trim()) return;
    setIsSearchingMission(true);
    triggerHaptic("medium");
    try {
      const res = await fetch("/api/dyson/search-mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: missionSearchQuery.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMissionSearchResult(data);
        triggerHaptic("success");
      }
    } catch (err) {
      console.error("Search mission error:", err);
    } finally {
      setIsSearchingMission(false);
    }
  };

  // T-Minus Live Ticking Clock State
  const [, setClockTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleNotification = (launch: SpaceXLaunch) => {
    const exists = notifiedLaunchIds.includes(launch.id);
    let updated: string[];
    if (exists) {
      updated = notifiedLaunchIds.filter((id) => id !== launch.id);
      triggerHaptic("selection");
    } else {
      updated = [...notifiedLaunchIds, launch.id];
      triggerHaptic("success");
      // Export device .ics calendar file
      downloadIcsFile(launch);
    }
    setNotifiedLaunchIds(updated);
    try {
      localStorage.setItem(
        "dyson_launch_notifications",
        JSON.stringify(updated),
      );
    } catch (err) {
      console.warn("LocalStorage error:", err);
    }
  };

  // Interactive Orbit Simulator Animation State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);

  // Fetch Live Space Updates via Gemini Google Search Grounding
  const fetchSpaceUpdates = async () => {
    setIsLoadingUpdates(true);
    triggerHaptic("refresh");
    try {
      const res = await fetch("/api/dyson/space-updates");
      if (res.ok) {
        const data = await res.json();
        setSpaceUpdates(data);
        triggerHaptic("success");
      }
    } catch (err) {
      console.warn("Could not fetch Dyson space updates:", err);
    } finally {
      setIsLoadingUpdates(false);
    }
  };

  useEffect(() => {
    fetchSpaceUpdates();
  }, []);

  // Orbit Canvas Simulator Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    // Generate pseudo satellite coordinates for 60 orbital nodes
    const satNodes = Array.from({ length: 60 }, (_, i) => ({
      radius: 80 + (i % 4) * 22,
      speed: (0.005 + (i % 3) * 0.003) * (i % 2 === 0 ? 1 : -1),
      baseAngle: i * ((Math.PI * 2) / 60),
      color:
        i % 4 === 0
          ? "#38bdf8"
          : i % 4 === 1
            ? "#10b981"
            : i % 4 === 2
              ? "#f59e0b"
              : "#a855f7",
    }));

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw Earth at Center
      const earthRadius = 45;
      const earthGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        5,
        centerX,
        centerY,
        earthRadius,
      );
      earthGrad.addColorStop(0, "#0284c7");
      earthGrad.addColorStop(0.7, "#0369a1");
      earthGrad.addColorStop(1, "#0f172a");

      ctx.beginPath();
      ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
      ctx.fillStyle = earthGrad;
      ctx.fill();
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Earth Atmosphere Glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, earthRadius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw Orbital Shell Rings
      const shellRadii = [80, 102, 124, 146];
      shellRadii.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle =
          idx === 2 ? "rgba(245, 158, 11, 0.35)" : "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw Satellites Orbiting
      angle += 0.01;
      satNodes.forEach((node) => {
        const currentAngle = node.baseAngle + angle * (node.speed * 100);
        const x = centerX + Math.cos(currentAngle) * node.radius;
        const y = centerY + Math.sin(currentAngle) * (node.radius * 0.75); // slight inclination perspective

        // Draw satellite dot
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Laser link connection to neighboring satellite
        if (node.radius > 100 && Math.random() > 0.85) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            centerX + Math.cos(currentAngle + 0.3) * node.radius,
            centerY + Math.sin(currentAngle + 0.3) * (node.radius * 0.75),
          );
          ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      if (isSimulating) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSimulating]);

  // Filter SpaceX Launches
  const filteredLaunches = SPACEX_LAUNCHES.filter((l) => {
    if (selectedRocketFilter === "all") return true;
    if (selectedRocketFilter === "starship")
      return l.rocket.includes("Starship");
    if (selectedRocketFilter === "falcon9")
      return l.rocket.includes("Falcon 9");
    if (selectedRocketFilter === "falcon_heavy")
      return l.rocket.includes("Falcon Heavy");
    return true;
  });

  // Filter Starlink Shells
  const filteredShells = STARLINK_SHELLS.filter((s) => {
    if (selectedShellId === "all") return true;
    return s.id === selectedShellId;
  });

  // Filter upcoming countdown launches
  const activeLaunches = (dysonLiveData?.upcoming_launches || []).map((l: DysonLaunch, i: number) => ({
    id: `dyson-live-${i}`,
    missionName: l.name,
    rocket: l.provider === "SpaceX" ? "Falcon / Starship" : "Rocket",
    targetIsoDate: l.net_launch_time,
    launchTimeUTC: new Date(l.net_launch_time || Date.now()).toLocaleTimeString('en-US', { timeZone: 'UTC' }) + ' UTC',
    launchSite: l.location,
    provider: l.provider,
    missionType: "Exploration",
    description: l.description,
    status: l.status,
    streamUrl: l.stream_url
  }));

  const sortedUpcomingLaunches = [...activeLaunches]
    .filter((l: { provider?: string }) => {
      if (launchProviderFilter === "all") return true;
      return l.provider === launchProviderFilter;
    })
    .sort(
      (a: { net_launch_time?: string; targetIsoDate?: string }, b: { net_launch_time?: string; targetIsoDate?: string }) =>
        new Date(a.net_launch_time || a.targetIsoDate || "").getTime() -
        new Date(b.net_launch_time || b.targetIsoDate || "").getTime(),
    );

  // Next primary immediate launch
  const nextImmediateLaunch =
    sortedUpcomingLaunches.find(
      (l) => !calculateTimeRemaining(l.targetIsoDate).isPast,
    ) || sortedUpcomingLaunches[0];

  return (
    <div className="w-full px-4 pt-3 pb-36 sm:pb-40 space-y-5 text-white">
      {/* Dyson Swarm Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-white/15 p-5 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-md">
                <Orbit className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-amber-200 bg-clip-text text-transparent animate-periodic-text-glitch">
                    Dyson Swarm
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                    Orbital Hub
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-medium">
                  SpaceX & Planet Labs Launch Windows, Constellations & Solar
                  Metrology
                </p>
              </div>
            </div>

            <button
              onClick={fetchSpaceUpdates}
              disabled={isLoadingUpdates}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingUpdates ? "animate-spin" : ""}`}
              />
              <span>
                {isLoadingUpdates
                  ? "Syncing Grounding..."
                  : "Refresh Space Intel"}
              </span>
            </button>
          </div>

          {/* 1. TOP EMBED (3D LIVE CONSTELLATION MAP) */}
          <div className="w-full my-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300">
                  Live 3D Satellite Constellation Globe (Starlink.sx)
                </h2>
              </div>
              <a
                href="https://starlink.sx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Fullscreen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <iframe
              src="https://starlink.sx"
              title="Live 3D Starlink Satellite Map"
              className="w-full h-[450px] md:h-[600px] rounded-2xl border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20 my-2"
              allow="fullscreen"
            />
          </div>

          {/* 2. REAL METRICS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
            <div className="p-4 rounded-2xl bg-[#080d1a]/90 border border-cyan-500/30 backdrop-blur-md shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-400 text-[10px] font-extrabold uppercase tracking-wider">
                <span>STARLINK FLEET</span>
                <Wifi className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-base sm:text-lg font-black text-white mt-2 break-words leading-tight">
                {dysonLiveData?.fleet_metrics?.starlink_active || "Loading..."}
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Live LEO Constellation
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d0a1a]/90 border border-amber-500/30 backdrop-blur-md shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-400 text-[10px] font-extrabold uppercase tracking-wider">
                <span>PHOTOVOLTAIC HARVEST</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base sm:text-lg font-black text-amber-300 mt-2 break-words leading-tight">
                {dysonLiveData?.fleet_metrics?.photovoltaic_capacity || "Loading..."}
              </div>
              <div className="text-[10px] text-amber-400/80 font-semibold mt-2">
                Orbital Solar Power
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#030e14]/90 border border-emerald-500/30 backdrop-blur-md shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-400 text-[10px] font-extrabold uppercase tracking-wider">
                <span>PLANET LABS FLEET</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-300 mt-2 break-words leading-tight">
                {dysonLiveData?.fleet_metrics?.planet_labs_fleet || "Loading..."}
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-2">
                Active Imaging Sats
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f0714]/90 border border-purple-500/30 backdrop-blur-md shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-400 text-[10px] font-extrabold uppercase tracking-wider">
                <span>NEXT MAJOR LAUNCH</span>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-base sm:text-lg font-black text-purple-300 mt-2 break-words leading-tight">
                {dysonLiveData?.fleet_metrics?.next_launch_title || "Loading..."}
              </div>
              <div className="text-[10px] text-purple-400 font-semibold mt-2">
                Upcoming Mission
              </div>
            </div>
          </div>

          {/* 3. PHOTO DOSSIER & SPACEX EARNINGS STORIES GRID */}
          {dysonLiveData?.dyson_stories && dysonLiveData.dyson_stories.length > 0 && (
            <div className="space-y-4 my-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                    Photo Dossier & SpaceX Earnings Stories
                  </h2>
                </div>
                <span className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-black rounded-lg uppercase tracking-wider">
                  Grounded Intel
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dysonLiveData.dyson_stories.map((story: DysonStory, idx: number) => (
                  <article
                    key={story.id || idx}
                    className="bg-[#050b14]/90 border border-cyan-500/30 hover:border-cyan-500/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl shadow-cyan-500/5 group flex flex-col"
                  >
                  <div className="relative h-64 w-full overflow-hidden bg-neutral-900">
                    <img
                      src={story.image_url}
                      alt={story.title}
                      className="w-full h-64 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    {/* Badge Overlays */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md border border-cyan-400/50 text-cyan-300 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-md">
                        {story.category || "Q2 2026 Financials"}
                      </span>
                      {(story.stat_callout || story.statCallout) && (
                        <span className="px-2.5 py-1 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider rounded-lg shadow-md">
                          {story.stat_callout || story.statCallout}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 text-[11px] font-mono font-bold text-neutral-300 bg-black/70 px-2.5 py-0.5 rounded-md border border-white/10">
                      {story.date}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-cyan-300 transition-colors">
                        {story.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-2 font-medium">
                        {story.story_summary || story.summary || story.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        Verified Telemetry
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        SpaceX / Starlink Data
                      </span>
                    </div>
                  </div>
                </article>
              ))}
              </div>
            </div>
          )}

          {/* Official SpaceX Website & YouTube Channel Quick Access Bar */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400">
              <Rocket className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verified Portals & Livestreams:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://www.spacex.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold flex items-center gap-1.5 transition-all text-xs border border-white/10 active:scale-95 shadow-md"
              >
                <Rocket className="w-3.5 h-3.5 text-cyan-400" />
                <span>SpaceX Official</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>

              <a
                href="https://www.youtube.com/@SpaceX"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/35 text-red-200 font-extrabold flex items-center gap-1.5 transition-all text-xs border border-red-500/40 active:scale-95 shadow-md"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500 fill-current" />
                <span>SpaceX YouTube</span>
                <ExternalLink className="w-3 h-3 text-red-400" />
              </a>

              <a
                href="https://x.com/SpaceX"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-neutral-200 font-bold flex items-center gap-1.5 transition-all text-xs border border-white/10 active:scale-95"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Live X Broadcasts</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>

              <a
                href="https://satellitemap.space/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-300 font-black flex items-center gap-1.5 transition-all text-xs border border-emerald-500/40 active:scale-95 shadow-md shadow-emerald-500/10"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>SatelliteMap.Space (3D)</span>
                <ExternalLink className="w-3 h-3 text-emerald-400" />
              </a>

              <a
                href="https://www.starlink.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold flex items-center gap-1.5 transition-all text-xs border border-cyan-500/20 active:scale-95"
              >
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span>Starlink.com</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Real time Search Grounded Live Space Bulletins */}
      {spaceUpdates && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-neutral-900 to-amber-950/40 border border-cyan-500/20 backdrop-blur-md space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">
                Google Search Grounded Space Intelligence
              </span>
            </div>
            <span className="text-[10px] text-neutral-400">
              Synced:{" "}
              {new Date(spaceUpdates.lastUpdated).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <p className="text-xs text-neutral-200 font-medium leading-relaxed">
            {spaceUpdates.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {spaceUpdates.bulletPoints.map((bp, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-neutral-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{bp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Grounded Mission Search Verification Bar */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/30 backdrop-blur-md space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
              Verify Launch Manifests with Google Search Grounding
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            Real time Verification
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Cross-examine any SpaceX launch, Planet Labs satellite fleet, or
          Starlink shell against live 2026 web intelligence.
        </p>

        <form
          onSubmit={handleSearchMission}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={missionSearchQuery}
              onChange={(e) => setMissionSearchQuery(e.target.value)}
              placeholder="e.g. SpaceX Starship Flight 7, Starlink Group 10-15, Planet Labs Pelican..."
              className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 shadow-lg shadow-amber-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSearchingMission || !missionSearchQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {isSearchingMission ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>Verify Live</span>
              </>
            )}
          </button>
        </form>

        {/* Search Result Card */}
        {missionSearchResult && (
          <div className="mt-3 p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300 border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Live Grounded Search Results for "{missionSearchResult.query}"
              </span>
              <span className="text-[10px] text-neutral-400">
                Gemini 3.6 Flash + Google Search
              </span>
            </div>

            <div className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line font-medium">
              {missionSearchResult.result}
            </div>

            {missionSearchResult.sources &&
              missionSearchResult.sources.length > 0 && (
                <div className="pt-2 border-t border-white/10 space-y-1">
                  <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                    Citations & Web Sources:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {missionSearchResult.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-[10px] text-cyan-300 border border-white/10 transition-all"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span className="max-w-[200px] truncate">
                          {src.title}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Primary Sub-Tab Selector Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: "launch_countdown", label: "Launch Countdown", icon: Clock },
          { id: "spacex_portals", label: "SpaceX & Official Portals", icon: Globe },
          { id: "dyson_101", label: "Dyson Swarm 101", icon: Lightbulb },
          {
            id: "spacex_history",
            label: "SpaceX History & Plans",
            icon: History,
          },
          { id: "space_docs", label: "Documentaries & Vault", icon: Film },
          { id: "artemis_moon", label: "NASA Artemis & Moon", icon: Moon },
          {
            id: "starlink_tracker",
            label: "Starlink Orbit Tracker",
            icon: Wifi,
          },
          { id: "spacex_launches", label: "SpaceX Manifest", icon: Rocket },
          { id: "planet_labs", label: "Planet Labs Fleet", icon: Satellite },
          { id: "dyson_power", label: "Dyson Power Metrology", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic("selection");
                setActiveSubTab(tab.id as DysonSubTab);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-amber-400 text-black shadow-lg shadow-amber-500/30 font-extrabold"
                  : "bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-white/10"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-black" : "text-amber-400"}`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB: LAUNCH COUNTDOWN & CALENDAR SYNC */}
      {activeSubTab === "launch_countdown" && (
        <div className="space-y-5">
          {/* Timezone Toggle Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-900/90 p-3.5 rounded-2xl border border-white/10 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="font-extrabold text-white uppercase tracking-wider text-[11px]">
                Launch Window Timezone Display:
              </span>
            </div>
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
              {[
                { id: "local", label: "Browser Local" },
                { id: "utc", label: "UTC Universal" },
                { id: "site", label: "Launch Site Local" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    triggerHaptic("selection");
                    setTimezoneMode(m.id as any);
                  }}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    timezoneMode === m.id
                      ? "bg-amber-400 text-black font-extrabold shadow-md shadow-amber-400/20"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Immediate Rocket Launch Hero Clock */}
          {nextImmediateLaunch &&
            (() => {
              const tr = calculateTimeRemaining(
                nextImmediateLaunch.targetIsoDate,
              );
              const isSubscribed = notifiedLaunchIds.includes(
                nextImmediateLaunch.id,
              );

              return (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-amber-950/40 border border-amber-500/30 p-5 shadow-2xl space-y-4">
                  <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                    <Rocket className="w-48 h-48 text-amber-400" />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                        Next Major Launch Window
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          nextImmediateLaunch.provider === "SpaceX"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {nextImmediateLaunch.provider}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleNotification(nextImmediateLaunch)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSubscribed
                            ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                            : "bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-500/20"
                        }`}
                      >
                        {isSubscribed ? (
                          <>
                            <CalendarCheck className="w-3.5 h-3.5" />
                            <span>Reminders Active</span>
                          </>
                        ) : (
                          <>
                            <BellRing className="w-3.5 h-3.5 animate-bounce" />
                            <span>Notify Me & Sync Calendar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white animate-periodic-text-glitch">
                      {nextImmediateLaunch.missionName}
                    </h3>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {nextImmediateLaunch.rocket} •{" "}
                      {nextImmediateLaunch.launchSite}
                    </p>
                  </div>

                  {/* Big T-Minus Digital Clock Display */}
                  <div className="grid grid-cols-4 gap-2 bg-black/60 p-3.5 rounded-2xl border border-white/10 text-center">
                    <div className="p-2 rounded-xl bg-white/5">
                      <div className="text-2xl md:text-3xl font-black text-amber-300 tracking-tight">
                        {String(tr.days).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mt-0.5">
                        DAYS
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5">
                      <div className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        {String(tr.hours).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mt-0.5">
                        HOURS
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5">
                      <div className="text-2xl md:text-3xl font-black text-cyan-300 tracking-tight">
                        {String(tr.minutes).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mt-0.5">
                        MINS
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5">
                      <div className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight animate-pulse">
                        {String(tr.seconds).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mt-0.5">
                        SECS
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="text-neutral-300 font-medium space-y-1">
                      <div>
                        <span className="text-neutral-400">
                          Scheduled Window:
                        </span>{" "}
                        <strong className="text-amber-300">
                          {formatLaunchTime(
                            nextImmediateLaunch.targetIsoDate,
                            nextImmediateLaunch.launchTimeUTC,
                            nextImmediateLaunch.launchSite,
                            timezoneMode,
                          )}
                        </strong>
                      </div>
                      <div className="text-[10px] text-cyan-300 font-mono">
                        Source: {nextImmediateLaunch.sourceCitation || "StockBloc Live Dyson API"}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          triggerHaptic("medium");
                          setActiveVideo({
                            youtubeId: "pP44EPBM380",
                            title: `${nextImmediateLaunch.provider}: ${nextImmediateLaunch.missionName} Live Stream`,
                            thumbnailBadge: nextImmediateLaunch.rocket,
                            platform: "SpaceX Official Live Stream",
                            year: "2026",
                            duration: "Live Stream",
                            rating: "Official Launch Stream",
                            summary: nextImmediateLaunch.summary,
                            whyItMattersToDysonSwarm: `Mission ${nextImmediateLaunch.missionName} expands orbital deployment infrastructure and constellation capacity.`,
                            keyTakeaways: [
                              `Rocket: ${nextImmediateLaunch.rocket}`,
                              `Site: ${nextImmediateLaunch.launchSite}`,
                              `Booster: ${nextImmediateLaunch.boosterSerial || "TBD"}`,
                              `Payload Mass: ${nextImmediateLaunch.payloadMassKg ? (nextImmediateLaunch.payloadMassKg / 1000).toFixed(1) + " metric tons" : "Satellite Payload"}`,
                            ],
                            trailerUrl: nextImmediateLaunch.webcastUrl,
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-200 border border-red-500/40 text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Youtube className="w-3.5 h-3.5 text-red-500 fill-current" />
                        <span>Stream Modal</span>
                      </button>

                      <a
                        href={nextImmediateLaunch.streamUrl || nextImmediateLaunch.webcastUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-extrabold flex items-center gap-1 transition-all"
                      >
                        <Youtube className="w-3 h-3 text-cyan-400" />
                        <span>Watch Stream</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <a
                        href={generateGoogleCalendarUrl(nextImmediateLaunch)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 text-[11px] font-bold flex items-center gap-1 transition-all"
                      >
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        <span>Google Cal</span>
                      </a>

                      <button
                        onClick={() => downloadIcsFile(nextImmediateLaunch)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>.ICS File</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* Provider Filter Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="font-extrabold text-base text-white">
                Upcoming Rocket Launch Windows
              </h3>
            </div>

            <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-white/10 text-xs">
              {(["all", "SpaceX", "Planet Labs"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setLaunchProviderFilter(p)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    launchProviderFilter === p
                      ? "bg-amber-400 text-black font-extrabold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* List of Upcoming Rocket Launches */}
          <div className="space-y-3">
            {sortedUpcomingLaunches.map((launch) => {
              const tr = calculateTimeRemaining(launch.targetIsoDate);
              const isSubscribed = notifiedLaunchIds.includes(launch.id);

              return (
                <div
                  key={launch.id}
                  className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 hover:border-amber-500/40 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wider ${
                            launch.provider === "SpaceX"
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {launch.provider}
                        </span>
                        <span className="text-xs font-extrabold text-amber-300">
                          {launch.rocket}
                        </span>
                        <span className="text-[10px] text-cyan-300 font-medium">
                          • {formatLaunchTime(launch.targetIsoDate, launch.launchTimeUTC, launch.launchSite, timezoneMode)}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-white mt-1">
                        {launch.missionName}
                      </h4>
                      <p className="text-xs text-neutral-400 font-medium">
                        {launch.launchSite}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {/* Notify Me Switch Toggle */}
                      <button
                        onClick={() => toggleNotification(launch)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                          isSubscribed
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-white/10 hover:bg-white/20 text-neutral-300 border border-white/15"
                        }`}
                      >
                        {isSubscribed ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Notify Active</span>
                          </>
                        ) : (
                          <>
                            <Bell className="w-3.5 h-3.5 text-amber-400" />
                            <span>Notify Me</span>
                          </>
                        )}
                      </button>

                      <a
                        href={generateGoogleCalendarUrl(launch)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Google Cal</span>
                      </a>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 font-medium leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                    {launch.description || launch.summary}
                  </p>

                  {/* Explicit Data Source Citation Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200">
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      <strong>Data Citation:</strong> {launch.sourceCitation || "StockBloc Live Dyson API"}
                    </span>
                  </div>

                  {/* T-Minus Countdown Banner & Direct Webcast Links for each card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-black/50 border border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-neutral-400 font-bold">
                        Countdown T-Minus:
                      </span>
                      {tr.isPast ? (
                        <span className="font-bold text-emerald-400">
                          Launch Completed / In Flight
                        </span>
                      ) : (
                        <span className="font-black text-amber-300">
                          {tr.days}d {tr.hours}h {tr.minutes}m {tr.seconds}s
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          triggerHaptic("medium");
                          setActiveVideo({
                            youtubeId: "pP44EPBM380",
                            title: `${launch.provider}: ${launch.missionName} Live Stream`,
                            thumbnailBadge: launch.rocket,
                            platform: "SpaceX Official Live Broadcast",
                            year: "2026",
                            duration: "Live Stream",
                            rating: "Official Stream",
                            summary: launch.summary,
                            whyItMattersToDysonSwarm: `Mission ${launch.missionName} expands orbital deployment infrastructure and launch cadence.`,
                            keyTakeaways: [
                              `Rocket: ${launch.rocket}`,
                              `Site: ${launch.launchSite}`,
                              `Booster: ${launch.boosterSerial || "TBD"}`,
                              `Payload: ${launch.payloadMassKg ? (launch.payloadMassKg / 1000).toFixed(1) + " metric tons" : "Satellite Payload"}`,
                            ],
                            trailerUrl: launch.webcastUrl,
                          });
                        }}
                        className="text-[11px] text-red-200 hover:text-white font-extrabold flex items-center gap-1 bg-red-600/20 px-2.5 py-1 rounded-lg border border-red-500/40 cursor-pointer active:scale-95"
                      >
                        <Youtube className="w-3.5 h-3.5 text-red-500 fill-current" />
                        <span>Stream Modal</span>
                      </button>

                      <button
                        onClick={() => downloadIcsFile(launch)}
                        className="text-[11px] text-neutral-400 hover:text-white font-semibold flex items-center gap-1 cursor-pointer bg-white/5 px-2 py-1 rounded-lg border border-white/10"
                      >
                        <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>.ics</span>
                      </button>

                      <a
                        href={launch.streamUrl || launch.webcastUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-cyan-300 hover:text-cyan-200 font-extrabold flex items-center gap-1 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30"
                      >
                        <Youtube className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Watch Stream</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Financial & Market Impact Correlation Matrix */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-cyan-950/40 border border-cyan-500/30 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white animate-periodic-text-glitch">
                    Space Economy & Defense Stock Market Correlations
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    Publicly traded equities with direct commercial, launch payload, or solar hardware exposure to SpaceX & Dyson Swarm expansion.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                6 Grounded Equities
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {SPACE_ECONOMY_STOCKS.map((stock) => {
                const liveStock = stocks?.find(s => s.symbol === stock.symbol);
                return (
                <div
                  key={stock.symbol}
                  className="p-3.5 rounded-2xl bg-black/60 border border-white/10 hover:border-cyan-400/50 transition-all space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 font-mono">
                          ${stock.symbol}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-[130px]">
                          {stock.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {stock.marketTag}
                      </span>
                    </div>

                    {liveStock && (
                      <div className="flex items-center gap-2 font-mono text-sm">
                        <span className="text-white">${liveStock.price.toFixed(2)}</span>
                        <span className={liveStock.change >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {liveStock.change >= 0 ? "+" : ""}{liveStock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-cyan-200 font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{stock.role}</span>
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-relaxed font-medium">
                      {stock.relation}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                    <span className="text-amber-400 font-extrabold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {stock.bulletin}
                    </span>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: SPACEX & OFFICIAL PORTALS */}
      {activeSubTab === "spacex_portals" && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-neutral-900 to-cyan-950/40 border border-red-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-red-400" />
              <h3 className="font-black text-base text-white animate-periodic-text-glitch">
                Official SpaceX Website, YouTube Channel & Space Portals
              </h3>
            </div>
            <p className="text-xs text-neutral-300 font-medium leading-relaxed">
              Direct, verified links to official SpaceX web domains, YouTube webcast channels, Starlink constellation portals, Planet Labs fleets, and NASA Artemis spaceflight resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPACEX_OFFICIAL_PORTALS.map((portal) => (
              <div
                key={portal.id}
                className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 hover:border-red-500/40 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${
                        portal.category === "SpaceX"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : portal.category === "YouTube"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : portal.category === "Starlink"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {portal.badge || portal.category}
                    </span>

                    {portal.category === "YouTube" ? (
                      <Youtube className="w-5 h-5 text-red-500 fill-current" />
                    ) : (
                      <Rocket className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">
                      {portal.name}
                    </h4>
                    <p className="text-xs text-neutral-400 font-medium mt-1 leading-relaxed">
                      {portal.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md ${
                      portal.category === "YouTube"
                        ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/20"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                    }`}
                  >
                    <span>Visit {portal.name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: DYSON SWARM 101 (HIGH SCHOOL EXPLAINER) */}
      {activeSubTab === "dyson_101" && (
        <div className="space-y-5">
          {/* Hero Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-neutral-900 to-cyan-950/60 border border-amber-500/30 space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Conceptual Overview
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Intuitive Guide
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white animate-periodic-text-glitch leading-tight">
              Why Is a Dyson Swarm So Important & How Big Is This Concept?
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed">
              Every second, the Sun produces <strong>384 Yottawatts</strong> of
              energy, enough power to boil Earth’s oceans millions of times
              over! But Earth only catches <strong>1 billionth</strong> of that
              energy. The rest is lost in empty space. A{" "}
              <strong>Dyson Swarm</strong> is a floating network of millions of
              solar panel satellites orbiting the Sun to harvest infinite clean
              power for humanity, supercomputers, and space travel.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20">
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Sun Power Furnace
                </div>
                <div className="text-lg font-black text-white mt-0.5">
                  384,000,000,000,000 GW
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Total clean energy output radiated every second into space.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-cyan-500/20">
                <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  Earth Slice Captured
                </div>
                <div className="text-lg font-black text-white mt-0.5">
                  0.000000001%
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Tiny fraction of solar power that hits our planet's surface.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                  Target Launch Cost
                </div>
                <div className="text-lg font-black text-white mt-0.5">
                  &lt; $100 / kg
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Starship reusability cost needed to build megastructures in
                  space.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Roadmap: Transition from Megaconstellations to Dyson Swarm */}
          <div className="p-5 rounded-3xl bg-neutral-900/90 border border-white/10 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-black text-base text-white animate-periodic-text-glitch">
                    Evolution Roadmap: Megaconstellations to Dyson Swarm
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    The 4 technological phases transforming LEO satellite internet into a Kardashev Type II solar energy collector.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DYSON_EVOLUTION_STAGES.map((item, idx) => (
                <div
                  key={item.stage}
                  className={`p-4 rounded-2xl border ${item.color} space-y-2.5 relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wider border ${item.badgeColor}`}>
                      {item.stage} • {item.era}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-white">
                      Phase 0{idx + 1}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-white">
                    {item.title}
                  </h4>

                  <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400 font-mono">
                      Tech: <strong className="text-white">{item.tech}</strong>
                    </span>
                    <span className="font-black text-amber-300">
                      {item.powerCap}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Concept Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DYSON_SWARM_EXPLAINER_CONCEPTS.map((concept) => (
              <div
                key={concept.id}
                className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 hover:border-amber-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-black rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                    {concept.difficultyRating}
                  </span>
                  <BookOpen className="w-4 h-4 text-amber-400" />
                </div>

                <div>
                  <h3 className="text-base font-black text-white">
                    {concept.title}
                  </h3>
                  <p className="text-xs text-amber-300/90 font-bold">
                    {concept.subtitle}
                  </p>
                </div>

                {/* Simple Analogy Box */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Layman's Terms:</span>
                  </div>
                  <p className="text-xs text-neutral-200 italic font-medium leading-relaxed">
                    "{concept.simpleAnalogy}"
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-red-400 font-bold block text-[11px]">
                      ⚠️ The Big Engineering Problem:
                    </span>
                    <p className="text-neutral-300 font-medium">
                      {concept.theBigProblem}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-emerald-400 font-bold block text-[11px]">
                      ⚡ The SpaceX / NASA Solution:
                    </span>
                    <p className="text-neutral-300 font-medium">
                      {concept.theEngineeringSolution}
                    </p>
                  </div>
                </div>

                {/* Key Stats Bar */}
                <div className="flex overflow-x-auto gap-2 pt-2 border-t border-white/10 text-center">
                  {concept.keyStats.map((st, i) => (
                    <div key={i} className="p-1.5 rounded-lg bg-white/5 whitespace-nowrap min-w-max flex-1">
                      <span className="text-[9px] text-neutral-400 font-bold block">
                        {st.label}
                      </span>
                      <span className="text-xs font-black text-cyan-300 block">
                        {st.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: SPCX HISTORY & PLANS ROADMAP */}
      {activeSubTab === "spacex_history" && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-neutral-900 to-amber-950/40 border border-cyan-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <h3 className="font-black text-base text-cyan-200 animate-periodic-text-glitch">
                SpaceX Evolutionary Roadmap: Falcon 1 to Dyson Precursors
              </h3>
            </div>
            <p className="text-xs text-neutral-300 font-medium leading-relaxed">
              How a small private rocket startup turned space exploration from
              an expensive government monopoly into an affordable commercial
              high frequency orbital transit system.
            </p>
          </div>

          <div className="space-y-4">
            {SPACEX_HISTORY_ROADMAP.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 hover:border-cyan-500/40 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-black font-mono">
                      {item.year}
                    </span>
                    <span className="text-xs font-bold text-neutral-400">
                      {item.phase}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${
                      item.status === "Completed"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : item.status === "Current Focus"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-neutral-300 font-medium mt-1 leading-relaxed">
                    {item.milestone}
                  </p>
                </div>

                {/* High School Analogy */}
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-300 text-[11px] font-black uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                    <span>The Breakdown:</span>
                  </div>
                  <p className="text-xs text-neutral-200 font-medium leading-relaxed">
                    {item.highSchoolAnalogy}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs space-y-1">
                  <span className="text-amber-300 font-bold block text-[11px]">
                    💡 Historical & Economic Significance:
                  </span>
                  <p className="text-neutral-300 font-medium leading-relaxed">
                    {item.significance}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.techSpecs.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-200"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: SPACE DOCUMENTARIES & VAULT */}
      {activeSubTab === "space_docs" && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-neutral-900 to-amber-950/40 border border-purple-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-400" />
              <h3 className="font-black text-base text-purple-200 animate-periodic-text-glitch">
                SpaceX & Orbital Revolution Documentaries Vault
              </h3>
            </div>
            <p className="text-xs text-neutral-300 font-medium leading-relaxed">
              Curated streaming documentaries, feature walkthroughs, and
              engineering series breaking down SpaceX, Starlink, and the
              commercial space race.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPACE_DOCUMENTARIES.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 hover:border-purple-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-black bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 uppercase tracking-wider">
                      {doc.thumbnailBadge}
                    </span>
                    <h4 className="font-black text-base text-white mt-1.5">
                      {doc.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 mt-0.5">
                      <span>{doc.year}</span>
                      <span>•</span>
                      <span>{doc.platform}</span>
                      <span>•</span>
                      <span>{doc.duration}</span>
                    </div>
                  </div>

                  <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-300 shrink-0">
                    {doc.rating}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                  {doc.summary}
                </p>

                {/* Key Takeaways */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-neutral-400 text-[11px] block">
                    Key Documentary Insights:
                  </span>
                  <ul className="space-y-1 pl-1">
                    {doc.keyTakeaways.map((point, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1.5 text-neutral-300 text-[11px]"
                      >
                        <CheckCircle2 className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Why It Matters */}
                <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs">
                  <span className="font-bold text-purple-300 block text-[11px]">
                    🚀 Connection to Dyson Swarm:
                  </span>
                  <p className="text-neutral-300 font-medium text-[11px] mt-0.5">
                    {doc.whyItMattersToDysonSwarm}
                  </p>
                </div>

                {doc.youtubeId ? (
                  <button
                    onClick={() => {
                      triggerHaptic("medium");
                      setActiveVideo(doc);
                    }}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch Webcast in Hub</span>
                  </button>
                ) : (
                  <a
                    href={doc.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Stream / Watch Official Feature</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: NASA ARTEMIS & MOON MISSIONS */}
      {activeSubTab === "artemis_moon" && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-neutral-900 to-cyan-950/40 border border-blue-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-cyan-400" />
              <h3 className="font-black text-base text-cyan-200 animate-periodic-text-glitch">
                NASA Artemis & Lunar South Pole Exploration
              </h3>
            </div>
            <p className="text-xs text-neutral-300 font-medium leading-relaxed">
              Humanity is returning to the Moon to stay. NASA Artemis and SpaceX
              Starship HLS will mine water ice and deploy surface solar grids,
              the ultimate staging ground for building a Dyson Swarm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NASA_ARTEMIS_MISSIONS.map((art) => (
              <div
                key={art.id}
                className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 hover:border-cyan-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                  <div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${
                        art.status === "Completed"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse"
                      }`}
                    >
                      {art.status}
                    </span>
                    <h4 className="font-black text-base text-white mt-1.5">
                      {art.missionName}
                    </h4>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {art.targetDate}
                    </span>
                  </div>

                  <Compass className="w-5 h-5 text-cyan-400 shrink-0" />
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs space-y-1">
                  <span className="text-neutral-400 font-bold block text-[10px]">
                    🚀 Rocket & Spacecraft:
                  </span>
                  <p className="text-cyan-300 font-extrabold">
                    {art.rocketAndVehicle}
                  </p>
                </div>

                {/* Concept Breakdown */}
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-300 text-[11px] font-black uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Concept Breakdown:</span>
                  </div>
                  <p className="text-xs text-neutral-200 font-medium leading-relaxed">
                    {art.highSchoolBreakdown}
                  </p>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-neutral-400 text-[10px] uppercase">
                    Astronaut Crew:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {art.crew.map((member, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-neutral-300 font-medium"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs">
                  <span className="font-bold text-amber-300 block text-[11px]">
                    🌕 Role in Dyson Swarm Construction:
                  </span>
                  <p className="text-neutral-300 font-medium text-[11px] mt-0.5">
                    {art.roleInDysonFuture}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 1: STARLINK ORBIT TRACKER & SIMULATOR */}
      {activeSubTab === "starlink_tracker" && (
        <div className="space-y-4">
          {/* Featured Live 3D Orbit Tracker: SatelliteMap.space */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-cyan-950/60 border border-emerald-500/40 space-y-4 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse">
                    Live 3D Globe Tracker
                  </span>
                  <span className="text-xs font-bold text-neutral-400">
                    Real-Time Orbit Mapping
                  </span>
                </div>
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <span>SatelliteMap.Space — Live Starlink 3D Tracker</span>
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowEmbeddedSatelliteMap(!showEmbeddedSatelliteMap)}
                  className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-extrabold text-xs border border-emerald-500/40 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>{showEmbeddedSatelliteMap ? "Hide Interactive Frame" : "Preview 3D Map Inline"}</span>
                </button>

                <a
                  href="https://satellitemap.space/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  <span>Launch SatelliteMap.Space</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <p className="text-xs text-neutral-200 font-medium leading-relaxed">
              <strong>SatelliteMap.Space</strong> provides a stunning real-time 3D simulation of Earth encircled by active Starlink, OneWeb, GPS, and commercial satellite constellations. Rotate the globe, click individual satellites to analyze orbital altitude, speed, and launch history, and watch laser inter-satellite mesh networks route bandwidth around the globe.
            </p>

            {/* Embedded iFrame Option */}
            {showEmbeddedSatelliteMap && (
              <div className="space-y-2 pt-2 border-t border-emerald-500/20">
                <div className="flex items-center justify-between text-xs text-emerald-300 font-bold px-1">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
                    Live 3D Satellite Map Frame (satellitemap.space)
                  </span>
                  <a
                    href="https://satellitemap.space/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-cyan-300 hover:underline flex items-center gap-1"
                  >
                    Open in Full Window <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="w-full h-[500px] rounded-2xl border border-emerald-500/30 overflow-hidden bg-black shadow-2xl relative">
                  <iframe
                    src="https://satellitemap.space/"
                    title="SatelliteMap.space 3D Orbit Tracker"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Orbital Radar Simulator Canvas Card */}
          <div className="p-4 rounded-3xl bg-neutral-900/90 border border-white/15 space-y-3 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-ping" />
                <h3 className="font-extrabold text-sm text-white">
                  Low Earth Orbit Constellation Simulator
                </h3>
              </div>
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-neutral-300 hover:text-white"
              >
                {isSimulating ? "Pause Radar" : "Resume Radar"}
              </button>
            </div>

            <div className="relative w-full h-64 bg-black/80 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={360}
                height={250}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 left-3 bg-neutral-950/80 px-2.5 py-1 rounded-md border border-white/10 text-[10px] text-neutral-300 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />{" "}
                  Shell 1 (550km)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />{" "}
                  Shell 2 (540km)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{" "}
                  Direct-to-Cell (350km)
                </span>
              </div>
            </div>
          </div>

          {/* Starlink Shell Cards */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Active Starlink Orbital Shells</span>
            </h3>
            <span className="text-xs text-neutral-400 font-semibold">
              4 Primary Shells Tracked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredShells.map((shell) => (
              <div
                key={shell.id}
                className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-cyan-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white">
                        {shell.shellName}
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 rounded-md border border-cyan-500/30">
                        {shell.version}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {shell.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar of shell deployment */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-neutral-400">
                      Deployed Satellites
                    </span>
                    <span className="text-cyan-300">
                      {shell.activeSatellitesCount} /{" "}
                      {shell.targetSatellitesCount}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                      style={{
                        width: `${Math.min(100, (shell.activeSatellitesCount / shell.targetSatellitesCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-white/5">
                  <div className="p-2 rounded-xl bg-white/5">
                    <div className="text-[10px] text-neutral-400 font-semibold">
                      Altitude
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {shell.altitudeKm} km
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <div className="text-[10px] text-neutral-400 font-semibold">
                      Latency
                    </div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">
                      {shell.latencyMs}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <div className="text-[10px] text-neutral-400 font-semibold">
                      Downlink
                    </div>
                    <div className="text-xs font-bold text-amber-300 mt-0.5">
                      {shell.downlinkSpeedMbps}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SPCX LAUNCH MANIFEST */}
      {activeSubTab === "spacex_launches" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: "All Rockets" },
                { id: "starship", label: "Starship" },
                { id: "falcon9", label: "Falcon 9" },
                { id: "falcon_heavy", label: "Falcon Heavy" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedRocketFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRocketFilter === f.id
                      ? "bg-amber-400 text-black font-extrabold"
                      : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-neutral-400 font-semibold shrink-0">
              {filteredLaunches.length} Missions
            </span>
          </div>

          <div className="space-y-3">
            {filteredLaunches.map((launch) => (
              <div
                key={launch.id}
                className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 hover:border-amber-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                          launch.status === "Success"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : launch.status === "Countdown"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        }`}
                      >
                        {launch.status}
                      </span>
                      <span className="text-xs font-bold text-amber-400">
                        {launch.rocket}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-base text-white mt-1">
                      {launch.missionName}
                    </h4>
                    <p className="text-xs text-neutral-400 font-medium">
                      {launch.launchSite}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        triggerHaptic("medium");
                        setActiveVideo({
                          youtubeId: "pP44EPBM380",
                          title: `${launch.provider}: ${launch.missionName} Live Stream`,
                          thumbnailBadge: launch.rocket,
                          platform: "SpaceX Official Live Broadcast",
                          year: "2026",
                          duration: "Live Stream",
                          rating: "Official Stream",
                          summary: launch.summary,
                          whyItMattersToDysonSwarm: `Mission ${launch.missionName} expands orbital deployment infrastructure and launch cadence.`,
                          keyTakeaways: [
                            `Rocket: ${launch.rocket}`,
                            `Site: ${launch.launchSite}`,
                            `Booster: ${launch.boosterSerial}`,
                            `Payload: ${(launch.payloadMassKg / 1000).toFixed(1)} metric tons`,
                          ],
                          trailerUrl: launch.webcastUrl,
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 transition-all active:scale-95 flex items-center gap-1 text-xs font-extrabold cursor-pointer"
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-500 fill-current" />
                      <span>Stream</span>
                    </button>

                    <a
                      href={launch.webcastUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 hover:text-white transition-all active:scale-95 flex items-center gap-1 text-xs font-bold"
                    >
                      <span>Webcast</span>
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    </a>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 font-medium leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                  {launch.summary}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[10px] text-neutral-400 font-bold block">
                      Launch Date
                    </span>
                    <span className="font-extrabold text-white">
                      {launch.launchDate} ({launch.launchTimeUTC})
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[10px] text-neutral-400 font-bold block">
                      Booster Reuse
                    </span>
                    <span className="font-extrabold text-cyan-300">
                      {launch.boosterSerial}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[10px] text-neutral-400 font-bold block">
                      Payload Mass
                    </span>
                    <span className="font-extrabold text-emerald-300">
                      {(launch.payloadMassKg / 1000).toFixed(1)} Metric Tons
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[10px] text-neutral-400 font-bold block">
                      Landing Target
                    </span>
                    <span className="font-extrabold text-amber-300">
                      {launch.landingTarget}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PLANET LABS FLEET */}
      {activeSubTab === "planet_labs" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-neutral-900 to-cyan-950/50 border border-emerald-500/20 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Satellite className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-sm text-emerald-300">
                Planet Labs PBC (NYSE: PL) Earth Observation Fleet
              </h3>
            </div>
            <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
              Operating the world’s largest fleet of Earth-imaging satellites,
              providing daily global optical scanning, sub-meter tactical video,
              and hyperspectral methane gas leak mapping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PLANET_LABS_MISSIONS.map((mission) => (
              <div
                key={mission.id}
                className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 hover:border-emerald-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30 uppercase tracking-wider">
                      {mission.status}
                    </span>
                    <h4 className="font-extrabold text-base text-white mt-1.5">
                      {mission.constellationName}
                    </h4>
                    <p className="text-xs text-neutral-400 font-medium">
                      {mission.satelliteFamily}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-300">
                      {mission.activeSatellites} Active
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      {mission.orbitAltitudeKm} km SSO
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                  {mission.description}
                </p>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-neutral-400">
                    Primary Industry Applications:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {mission.primaryUseCases.map((uc, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium text-neutral-300"
                      >
                        {uc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[10px] text-neutral-400 font-bold block">
                      Imaging Resolution
                    </span>
                    <span className="font-extrabold text-cyan-300">
                      {mission.imagingResolution}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[10px] text-neutral-400 font-bold block">
                      Spectral Bands
                    </span>
                    <span className="font-extrabold text-amber-300">
                      {mission.spectralBands}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DYSON POWER METROLOGY */}
      {activeSubTab === "dyson_power" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-purple-950/40 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-sm text-amber-300">
                Space-Based Solar Power & Orbital Swarm Metrology
              </h3>
            </div>
            <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
              Tracking the theoretical evolution of Low Earth Orbit
              mega-constellations into solar harvesting platforms with microwave
              power beaming and optical laser energy routing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DYSON_POWER_METRICS.map((metric, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-neutral-300">
                    {metric.title}
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                    {metric.change}
                  </span>
                </div>

                <div className="text-2xl font-black text-white">
                  {metric.value}
                </div>
                <div className="text-[11px] text-amber-400 font-semibold">
                  {metric.unit}
                </div>

                <p className="text-xs text-neutral-400 font-medium leading-relaxed pt-1">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAILED INTERACTIVE WEBCAST / VIDEO MODAL */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="w-full max-w-3xl bg-neutral-950 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative text-white space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                triggerHaptic("medium");
                setActiveVideo(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all z-10 cursor-pointer border border-white/10"
              title="Close Player"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Video Header / Category */}
            <div className="flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
                SpaceX & Orbital Swarm Broadcast • {activeVideo.thumbnailBadge}
              </span>
            </div>

            {/* Video Player Frame */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Video Metadata & Info */}
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                {activeVideo.title}
              </h3>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-400 font-mono border-b border-white/10 pb-3">
                <span className="text-purple-400 font-bold">{activeVideo.platform}</span>
                <span>•</span>
                <span>{activeVideo.year}</span>
                <span>•</span>
                <span>{activeVideo.duration}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{activeVideo.rating}</span>
              </div>

              {/* Summary */}
              <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                {activeVideo.summary}
              </p>

              {/* Swarm Connection */}
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs">
                <span className="font-bold text-purple-300 block text-[11px]">
                  🚀 Connection to Dyson Swarm:
                </span>
                <p className="text-neutral-300 font-medium text-[11px] mt-0.5">
                  {activeVideo.whyItMattersToDysonSwarm}
                </p>
              </div>

              {/* Insights */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-neutral-400 text-[11px] block">
                  Key Technical Insights:
                </span>
                <ul className="space-y-1 pl-1">
                  {activeVideo.keyTakeaways.map((point: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 text-neutral-300 text-[11px]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verified External Links Bar */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <a
                  href="https://www.youtube.com/@SpaceX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold flex items-center gap-1.5 transition-all cursor-pointer text-xs shadow-md shadow-red-600/20 active:scale-95"
                >
                  <Youtube className="w-3.5 h-3.5 fill-current" />
                  <span>SpaceX YouTube (@SpaceX)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={activeVideo.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer text-xs border border-white/10 active:scale-95"
                >
                  <span>Watch Direct on YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href="https://www.spacex.com/launches"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer text-xs border border-cyan-500/30 active:scale-95"
                >
                  <Rocket className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SpaceX.com Launches</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
