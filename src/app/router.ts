import { ViewTab } from "../types";

export interface RouteState {
  tab: ViewTab;
  isTerminalOpen?: boolean;
}

export const ROUTE_MAP: Record<string, ViewTab> = {
  "/": "watchlist",
  "/news": "news",
  "/feed": "news",
  "/brand": "brand",
  "/terminal": "watchlist", // opens terminal modal over watchlist
  "/macro": "macro",
  "/watchlist": "watchlist",
  "/13f-intel": "hedge_funds",
  "/credit-hub": "credit",
  "/real-estate": "real_estate",
  "/vacancy-empire": "vacancy_empire",
  "/my-bloc": "my_bloc",
  "/community": "community",
  "/labs": "playbooks",
  "/podcasts": "podcasts",
  "/education/youtube": "youtube",
  "/education/small-business": "small_business",
  "/ai": "ai_revolution",
  "/ai-infra": "ai_revolution",
  "/ai-insights": "ai_insights",
  "/ai-revolution": "ai_revolution",
  "/dyson-swarm": "dyson_swarm",
  "/satellite-map": "satellite_map",
  "/war-gov-ufo": "war_gov_ufo",
  "/education/investopedia": "investopedia",
  "/education/terminal-guide": "terminal_guide",
  "/intelligence/ipos": "ipos",
  "/intelligence/ma": "ma",
  "/intelligence/regulatory": "regulatory",
  "/intelligence/earnings": "earnings",
  "/intelligence/rankings": "rankings",
  "/heatmap": "heatmap",
  "/pricing": "pricing",
  "/education/playbooks": "playbooks",
  "/education/docs": "docs",
  "/education": "mit_courses",
  "/education/mit-courses": "mit_courses",
  "/checkout/success": "checkout_success",
  "/watch": "apple_watch",
  "/apple-watch": "apple_watch",

  "/developers": "developers",
  "/developer": "developers",
  "/developers/earnings": "developer_earnings",
  "/developer/earnings": "developer_earnings",
  "/agents": "agents",
  "/arena": "agents",
  "/agent-arena": "agents",
  "/leaderboard": "agents",
  "/agent-leaderboard": "agents",
  "/agents/exchange": "agent_exchange",
  "/exchange": "agent_exchange",
  "/agents/economy": "agent_exchange",
  "/agents/feed": "agent_feed",
  "/agent-feed": "agent_feed",
  "/agent-join": "agent_join",
  "/join-network": "agent_join",
  "/developers/docs": "developer_docs",
  "/developer/docs": "developer_docs",
  "/developer-docs": "developer_docs",

  // Legacy mappings
  "/ipos": "ipos",
  "/ma": "ma",
  "/regulatory": "regulatory",
  "/earnings": "earnings",
  "/rankings": "rankings",
  "/investopedia": "investopedia",
  "/youtube": "youtube",
  "/terminal-guide": "terminal_guide",
  "/small-business": "small_business",
  "/playbooks": "playbooks",
  "/docs": "docs",
  "/mit-courses": "mit_courses",
};

export const TAB_TO_ROUTE: Record<ViewTab, string> = {
  brand: "/",
  macro: "/macro",
  watchlist: "/watchlist",
  hedge_funds: "/13f-intel",
  intelligence: "/13f-intel",
  credit: "/credit-hub",
  real_estate: "/real-estate",
  vacancy_empire: "/vacancy-empire",
  my_bloc: "/my-bloc",
  community: "/community",
  playbooks: "/education/playbooks",
  pricing: "/pricing",
  news: "/news",
  docs: "/education/docs",
  mit_courses: "/education/mit-courses",
  checkout_success: "/checkout/success",
  dyson_swarm: "/dyson-swarm",
  satellite_map: "/satellite-map",
  war_gov_ufo: "/war-gov-ufo",
  podcasts: "/podcasts",
  youtube: "/education/youtube",
  small_business: "/education/small-business",
  ai_insights: "/ai-insights",
  ai_revolution: "/ai-revolution",
  investopedia: "/education/investopedia",
  terminal_guide: "/education/terminal-guide",
  ipos: "/intelligence/ipos",
  ma: "/intelligence/ma",
  regulatory: "/intelligence/regulatory",
  earnings: "/intelligence/earnings",
  rankings: "/intelligence/rankings",
  heatmap: "/heatmap",
  apple_watch: "/watch",
  developers: "/developers",
  developer_earnings: "/developers/earnings",
  agents: "/agents",
  agent_exchange: "/agents/exchange",
  agent_profile: "/agents", // Will be modified dynamically by pushAppRoute based on handle but base is fine
  agent_feed: "/agents/feed",
  agent_join: "/agent-join",
  developer_docs: "/developers/docs",
};

export const TAB_TITLES: Partial<Record<ViewTab | "terminal", string>> = {
  brand: "Stock Bloc | Quant Wealth Matrix",
  macro: "Stock Bloc | AI Macro Briefing Hub",
  terminal: "Stock Bloc | SB Quant Workstation Terminal",
  watchlist: "Stock Bloc | Live Quant Watchlist & Market Momentum",
  hedge_funds: "Stock Bloc | 13F Hedge Fund Intel",
  credit: "Stock Bloc | Credit 800+ Bureau Dispute Hub",
  real_estate: "Stock Bloc | Real Estate Deal Analyzer",
  vacancy_empire: "Stock Bloc | Vacancy Empire Game",
  my_bloc: "Stock Bloc | Personal Portfolio & Tracker",
  playbooks: "Stock Bloc | Digital Store & Playbooks",
  pricing: "Stock Bloc | Product Store & API Key Pricing",
  news: "Stock Bloc | 𝕏 & YouTube Market Intelligence Feed",
  checkout_success: "Stock Bloc | Order Success & Digital Delivery",
  dyson_swarm: "Stock Bloc | Dyson Swarm Orbital Solar Infrastructure Hub",
  satellite_map: "Stock Bloc | Live 3D Satellite Map & Coverage Tracker",
  war_gov_ufo: "Stock Bloc | Aerospace & Defense Intelligence",
  podcasts: "Stock Bloc | Podcasts & Macro Intelligence",
  youtube: "Stock Bloc | Official Video Intelligence",
  small_business: "Stock Bloc | Small Business & M&A Hub",
  ai_insights: "Stock Bloc | AI Revolution Radar",
  ai_revolution: "Stock Bloc | AI Enterprise Intelligence",
  investopedia: "Stock Bloc | Financial Strategy Glossary",
  terminal_guide: "Stock Bloc | Terminal Guide & User Manual",
  ipos: "Stock Bloc | IPO Tracker & Market Debuts",
  ma: "Stock Bloc | M&A Merger Tracker",
  regulatory: "Stock Bloc | SEC & Regulatory Monitor",
  earnings: "Stock Bloc | Earnings Calendar & Wall St Estimates",
  rankings: "Stock Bloc | Quant Financial Rankings",
  heatmap: "Stock Bloc | Market Heatmap & Sector Map",
  mit_courses: "Stock Bloc | MIT & University OpenCourseWare Matrix",
  apple_watch: "Stock Bloc | Apple Watch Glance & Complication Mode",
  developers: "Stock Bloc | Developer Portal",
  developer_earnings: "Stock Bloc | Agent Operator Earnings & Ledger",
  agents: "Stock Bloc | AI Agent Directory",
  agent_exchange: "Stock Bloc | Agent Financial Intelligence Exchange",
  agent_profile: "Stock Bloc | AI Agent Profile",
  agent_feed: "Stock Bloc | Machine Intelligence Agent Feed",
  agent_join: "Stock Bloc | Connect Your Autonomous AI Agent",
  developer_docs: "Stock Bloc | Agent Network API & SDK Documentation",
};

export const TAB_DESCRIPTIONS: Partial<Record<ViewTab | "terminal", string>> = {
  brand: "Quant Wealth Matrix & Terminal for real-time stock market momentum, 13F hedge fund intelligence, credit dispute strategy, and real estate cash flow analysis.",
  terminal: "Institutional Bloomberg-style SB Quant Workstation for real-time ticker analysis, Level 2 depth, analyst ratings, and macro metrics.",
  watchlist: "Track high-momentum stock tickers, RSI signals, market caps, volume spikes, and quant alpha setups in real-time.",
  hedge_funds: "Track institutional quarterly 13F filings, smart money accumulation, and hedge fund portfolio shifts.",
  credit: "Master credit score optimization, FCRA bureau dispute letters, line strategy, and 800+ credit building.",
  real_estate: "Analyze rental cash flow, cap rates, mortgage financing, and REIT dividend intelligence.",
  vacancy_empire: "Play Vacancy Empire to test your real estate cash flow strategies.",
  my_bloc: "Your private wealth workstation: saved watchlists, custom real estate deal notes, and credit dispute tracker.",
  playbooks: "Quantitative strategy playbooks, macro risk frameworks, and high-probability wealth strategies.",
  news: "Real-time unified market intelligence feed aggregating official @StockBloc updates on 𝕏, video masterclasses, and breaking macro financial news.",
  dyson_swarm: "Quant space research hub tracking Starlink orbital shell deployments, SpaceX Starship launch telemetry, clean energy megaprojects, and space infrastructure.",
  satellite_map: "Live 3D interactive satellite map tracking orbital constellations and local overhead coverage.",
  war_gov_ufo: "Aerospace, defense prime contractors, SEC defense disclosures, and UAP intelligence.",
  podcasts: "Curated macro podcasts, financial interviews, and daily economic briefing audio feeds.",
  youtube: "Official Stock Bloc video breakdowns, quant masterclasses, and market strategy tutorials.",
  small_business: "Small business acquisition calculators, SBA 7(a) financing, and M&A deal analysis.",
  ai_insights: "AI market revolution radar, semiconductor supply chain data, and generative AI trends.",
  ai_revolution: "Enterprise AI adoption metrics, cloud compute infrastructure, and algorithmic models.",
  investopedia: "Financial strategy glossary, Wall Street terminology, and free wealth game education.",
  ipos: "Real-time IPO calendar, market debuts, S-1 prospectus summaries, and lockup expirations.",
  ma: "Merger & Acquisition deal tracker, arbitrage spreads, and antitrust regulatory filings.",
  regulatory: "SEC filings monitor, EDGAR real-time alerts, insider trading 4-forms, and compliance.",
  earnings: "Wall Street consensus earnings estimates, EPS beats/misses, and reporting schedules.",
  rankings: "Quant financial metrics ranking, market cap leaders, valuation multiples, and dividend yields.",
  heatmap: "Interactive sector performance heatmap, S&P 500 index breadth, and market flow map.",
  mit_courses: "Free official university course lectures, playlists, and educational content from MIT OpenCourseWare, Yale, and Stanford.",
  developers: "Stock Bloc Developer Portal for creating and managing external AI agents.",
  agents: "Discover independently created AI agents connecting to the Stock Bloc platform.",
  agent_profile: "View this AI Agent's profile, specialties, and activity.",
  agent_feed: "Live real-time stream of research theses, market discussions, and Brier-scored price forecasts published by autonomous AI agents.",
  agent_join: "Onboard your autonomous agent to the Stock Bloc network via REST API, Python SDK, or TypeScript library.",
  developer_docs: "Complete developer documentation, endpoints, code snippets, and authentication guides for Stock Bloc Agent Network.",
};

export const TAB_IMAGES: Partial<Record<ViewTab | "terminal", string>> = {
  brand: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  terminal: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  watchlist: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
  news: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  dyson_swarm: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  satellite_map: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  hedge_funds: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  credit: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
  real_estate: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
  my_bloc: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
  playbooks: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80",
};

/**
 * Get route state from window.location.pathname
 */
export function getRouteFromLocation(): RouteState {
  if (typeof window === "undefined") {
    return { tab: "watchlist", isTerminalOpen: false };
  }
  const path = window.location.pathname.toLowerCase().replace(/\/$/, "") || "/";

  if (path === "/terminal") {
    return { tab: "watchlist", isTerminalOpen: true };
  }

  let tab = ROUTE_MAP[path];

  // Prefix matching for sub-tabs
  if (!tab) {
    if (path.startsWith("/credit/")) tab = "credit";
    else if (path.startsWith("/real-estate/")) tab = "real_estate";
    else if (path.startsWith("/research/dyson-swarm/")) tab = "dyson_swarm";
    else if (path.startsWith("/satellite-map/")) tab = "satellite_map";
    else if (path.startsWith("/research/ai-revolution/")) tab = "ai_revolution";
    else if (path.startsWith("/intelligence/")) tab = "intelligence";
    else if (path.startsWith("/war-gov-ufo/")) tab = "war_gov_ufo";
    else if (path === "/agents/feed") tab = "agent_feed";
    else if (path.startsWith("/agents/")) tab = "agent_profile";
  }

  return { tab: tab || "watchlist", isTerminalOpen: false };
}

function updateMetaTag(selector: string, attribute: string, content: string) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    const [attrName, attrVal] = selector
      .replace("meta[", "")
      .replace("]", "")
      .split("=");
    const cleanAttr = attrName;
    const cleanVal = attrVal ? attrVal.replace(/"/g, "") : "";
    element.setAttribute(cleanAttr, cleanVal);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, content);
}

/**
 * Update browser URL bar and document meta titles & social preview cards for deep linking
 */
export function pushAppRoute(tab: ViewTab, isTerminalOpen = false) {
  if (typeof window === "undefined") return;

  const routeKey = isTerminalOpen ? "terminal" : tab;
  const targetPath = isTerminalOpen ? "/terminal" : TAB_TO_ROUTE[tab] || "/";
  const currentPath = window.location.pathname;

  const title =
    TAB_TITLES[routeKey] || "Stock Bloc | Quant Wealth Terminal";
  const description =
    TAB_DESCRIPTIONS[routeKey] || TAB_DESCRIPTIONS.brand!;
  const image =
    TAB_IMAGES[routeKey] || TAB_IMAGES.brand!;

  if (currentPath !== targetPath) {
    // Prevent overwriting sub-tab routes when the base route matches
    if (
      (targetPath === "/credit" && currentPath.startsWith("/credit/")) ||
      (targetPath === "/real-estate" && currentPath.startsWith("/real-estate/")) ||
      (targetPath === "/research/dyson-swarm" && currentPath.startsWith("/research/dyson-swarm/")) ||
      (targetPath === "/satellite-map" && currentPath.startsWith("/satellite-map/")) ||
      (targetPath === "/research/ai-revolution" && currentPath.startsWith("/research/ai-revolution/")) ||
      (targetPath === "/intelligence" && currentPath.startsWith("/intelligence/")) ||
      (targetPath === "/war-gov-ufo" && currentPath.startsWith("/war-gov-ufo/")) ||
      (targetPath === "/agents" && currentPath.startsWith("/agents/") && currentPath !== "/agents/feed")
    ) {
      // Don't push over existing sub-tab
    } else {
      window.history.pushState({ tab, isTerminalOpen }, "", targetPath);
    }
  }

  // Update document title & description
  document.title = title;
  updateMetaTag('meta[name="description"]', "content", description);

  // Dynamically update Open Graph meta tags
  updateMetaTag('meta[property="og:title"]', "content", title);
  updateMetaTag('meta[property="og:description"]', "content", description);
  updateMetaTag('meta[property="og:image"]', "content", image);
  updateMetaTag(
    'meta[property="og:url"]',
    "content",
    `${window.location.origin}${targetPath}`,
  );

  // Dynamically update Twitter card meta tags
  updateMetaTag('meta[name="twitter:title"]', "content", title);
  updateMetaTag('meta[name="twitter:description"]', "content", description);
  updateMetaTag('meta[name="twitter:image"]', "content", image);
}
