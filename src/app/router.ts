import { ViewTab } from "../types";

export interface RouteState {
  tab: ViewTab;
  isTerminalOpen?: boolean;
}

export const ROUTE_MAP: Record<string, ViewTab> = {
  "/": "news",
  "/news": "news",
  "/feed": "news",
  "/brand": "brand",
  "/terminal": "watchlist", // opens terminal modal over watchlist
  "/macro": "macro",
  "/watchlist": "watchlist",
  "/13f-intel": "hedge_funds",
  "/credit-hub": "credit",
  "/real-estate": "real_estate",
  "/my-bloc": "my_bloc",
  "/labs": "playbooks",
  "/podcasts": "podcasts",
  "/youtube": "youtube",
  "/small-business": "small_business",
  "/ai-insights": "ai_insights",
  "/ai-revolution": "ai_revolution",
  "/dyson-swarm": "dyson_swarm",
  "/war-gov-ufo": "war_gov_ufo",
  "/investopedia": "investopedia",
  "/terminal-guide": "terminal_guide",
  "/ipos": "ipos",
  "/ma": "ma",
  "/regulatory": "regulatory",
  "/earnings": "earnings",
  "/rankings": "rankings",
  "/heatmap": "heatmap",
  "/pricing": "pricing",
  "/playbooks": "playbooks",
  "/docs": "docs",
  "/checkout/success": "checkout_success",
};

export const TAB_TO_ROUTE: Record<ViewTab, string> = {
  brand: "/",
  macro: "/macro",
  watchlist: "/watchlist",
  hedge_funds: "/13f-intel",
  intelligence: "/13f-intel",
  credit: "/credit-hub",
  real_estate: "/real-estate",
  my_bloc: "/my-bloc",
  playbooks: "/playbooks",
  pricing: "/pricing",
  news: "/news",
  docs: "/docs",
  checkout_success: "/checkout/success",
  dyson_swarm: "/dyson-swarm",
  war_gov_ufo: "/war-gov-ufo",
  podcasts: "/podcasts",
  youtube: "/youtube",
  small_business: "/small-business",
  ai_insights: "/ai-insights",
  ai_revolution: "/ai-revolution",
  investopedia: "/investopedia",
  terminal_guide: "/terminal-guide",
  ipos: "/ipos",
  ma: "/ma",
  regulatory: "/regulatory",
  earnings: "/earnings",
  rankings: "/rankings",
  heatmap: "/heatmap",
};

export const TAB_TITLES: Partial<Record<ViewTab | "terminal", string>> = {
  brand: "Stock Bloc | Quant Wealth Matrix",
  macro: "Stock Bloc | AI Macro Briefing Hub",
  terminal: "Stock Bloc | SB Quant Workstation Terminal",
  watchlist: "Stock Bloc | Quant Watchlist",
  hedge_funds: "Stock Bloc | 13F Hedge Fund Intel",
  credit: "Stock Bloc | Credit 800+ Bureau Dispute Hub",
  real_estate: "Stock Bloc | Real Estate Deal Analyzer",
  my_bloc: "Stock Bloc | Personal Portfolio & Tracker",
  playbooks: "Stock Bloc | Digital Store & Playbooks",
  pricing: "Stock Bloc | Product Store & API Key Pricing",
  news: "Stock Bloc | 𝕏 & YouTube Intelligence Feed",
  checkout_success: "Stock Bloc | Order Success & Digital Delivery",
  dyson_swarm: "Stock Bloc | Dyson Swarm Infra Labs",
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
};

export const TAB_DESCRIPTIONS: Partial<Record<ViewTab | "terminal", string>> = {
  brand: "Quant Wealth Matrix & Terminal for real-time stock market momentum, 13F hedge fund intelligence, credit dispute strategy, and real estate cash flow analysis.",
  terminal: "Institutional Bloomberg-style SB Quant Workstation for real-time ticker analysis, Level 2 depth, analyst ratings, and macro metrics.",
  watchlist: "Track high-momentum stock tickers, RSI signals, market caps, and quant alpha setups in real-time.",
  hedge_funds: "Track institutional quarterly 13F filings, smart money accumulation, and hedge fund portfolio shifts.",
  credit: "Master credit score optimization, FCRA bureau dispute letters, line strategy, and 800+ credit building.",
  real_estate: "Analyze rental cash flow, cap rates, mortgage financing, and REIT dividend intelligence.",
  my_bloc: "Your private wealth workstation: saved watchlists, custom real estate deal notes, and credit dispute tracker.",
  playbooks: "Quantitative strategy playbooks, macro risk frameworks, and high-probability wealth strategies.",
  dyson_swarm: "Dyson Swarm orbital solar power infrastructure, clean energy megaprojects, and space quant labs.",
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
};

export const TAB_IMAGES: Partial<Record<ViewTab | "terminal", string>> = {
  brand: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  terminal: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  watchlist: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
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
    return { tab: "news", isTerminalOpen: false };
  }
  const path = window.location.pathname.toLowerCase().replace(/\/$/, "") || "/";

  if (path === "/terminal") {
    return { tab: "watchlist", isTerminalOpen: true };
  }

  const tab = ROUTE_MAP[path] || "news";
  return { tab, isTerminalOpen: false };
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
  const title =
    TAB_TITLES[routeKey] || "Stock Bloc | Quant Wealth Terminal";
  const description =
    TAB_DESCRIPTIONS[routeKey] || TAB_DESCRIPTIONS.brand!;
  const image =
    TAB_IMAGES[routeKey] || TAB_IMAGES.brand!;

  if (window.location.pathname !== targetPath) {
    window.history.pushState({ tab, isTerminalOpen }, "", targetPath);
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
