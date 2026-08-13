export type TimeFrame = "1D" | "1W" | "1M" | "1Y" | "ALL";

export type SectorCategory =
  | "my_bloc" // My Bloc
  | "tsunami" // Super sonic Tsunami
  | "asymmetry" // Maximum Asymmetry
  | "reits" // Real Estate Investment Trusts
  | "credit_fin" // Credit Cards & FinTech
  | "ai_infra" // Infrastructure & Cloud
  | "memory" // Memory Chips & Hardware
  | "energy" // Energy, Grid & Power
  | "indexes"; // Major Indexes & Crypto

export interface PricePoint {
  time: string;
  price: number;
  volume?: number;
}

export interface StockTicker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  category: SectorCategory;
  sparkline: number[];
  history: Record<TimeFrame, PricePoint[]>;
  marketCap: string;
  peRatio?: string;
  dividendYield?: string;
  high52: number;
  low52: number;
  volume: string;
  description: string;
  rsi?: number;
  isPinned?: boolean;
  tags: string[];
  signalScore?: number;
  signalLabel?: string;
  volumeNum?: number;
  avgVolumeNum?: number;
  volumeVsAvgRatio?: number;
  lastUpdatedIso?: string;
  quantMetrics?: any;
  asymmetryPotentialStars?: number; // 1.0 to 5.0 rating scale
  targetPrice?: number;
  rating?: string;
  instHolders?: Array<{ name: string; value: string }>;
  headlines?: Array<{
    title: string;
    source: string;
    time?: string;
    sentiment?: string;
    url?: string;
  }>;
  probabilityOfSuccess?:
    | "Low"
    | "Medium-Low"
    | "Medium"
    | "Medium-High"
    | "High"
    | "Very High"
    | "Extremely High";
  news?: Array<{
    title: string;
    source: string;
    time?: string;
    sentiment?: string;
    url?: string;
  }>;
  institutionalOwnershipPercent?: number;
  institutionalData?: {
    ownershipPercent: number;
    holdersCount: number;
    sharesHeld: string;
    totalValue: string;
    quarterlyNetFlow: string;
    flowSentiment: "Accumulation" | "Distribution" | "Neutral";
    insiderOwnershipPercent: number;
    retailOwnershipPercent: number;
    buyersCount: number;
    sellersCount: number;
    topHolders: Array<{
      name: string;
      shares: string;
      value: string;
      portfolioWeight: string;
      changeType: "INCREASED" | "DECREASED" | "NEW" | "UNCHANGED";
      changePercent: string;
    }>;
  };
}

export interface StockNews {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  url: string;
  relatedSymbol: string;
  sentiment: "positive" | "negative" | "neutral";
}

export type SortField =
  | "price"
  | "changePercent"
  | "signal"
  | "name"
  | "marketCap"
  | "volatility"
  | "volume"
  | "rsi"
  | "asymmetry";

export interface PaperTrade {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  entryPrice: number;
  entryDate: string;
  type: "BUY" | "SHORT";
}

export type ViewTab =
  | "watchlist"
  | "community"
  | "macro"
  | "war_gov_ufo"
  | "intelligence"
  | "dyson_swarm"
  | "satellite_map"
  | "podcasts"
  | "real_estate"
  | "vacancy_empire"
  | "small_business"
  | "credit"
  | "youtube"
  | "ipos"
  | "ma"
  | "regulatory"
  | "earnings"
  | "rankings"
  | "heatmap"
  | "ai_insights"
  | "ai_revolution"
  | "hedge_funds"
  | "investopedia"
  | "terminal_guide"
  | "brand"
  | "my_bloc"
  | "playbooks"
  | "pricing"
  | "checkout_success"
  | "news"
  | "docs"
  | "mit_courses"
  | "apple_watch";

export interface ApiKeyDetails {
  key: string;
  createdAt: string;
  status: "active" | "revoked";
  creditsRemaining: number;
  totalCreditsPurchased: number;
  tier: "free" | "pro" | "enterprise";
}

export interface AgentApiKeyRecord {
  keyId: string;
  agentId: string;
  ownerUid: string;
  keyPrefix: string;
  keyHash: string;
  createdAt: any;
  lastUsedAt: any | null;
  expiresAt: any | null;
  revokedAt: any | null;
  scopes: string[];
}

export interface StoreProduct {
  id: string;
  title: string;
  category: "playbook" | "subscription" | "api_bundle";
  price: number;
  displayPrice: string;
  billingPeriod?: "monthly" | "yearly" | "one_time";
  description: string;
  features: string[];
  isPopular?: boolean;
  downloadUrl?: string;
  creditsGranted?: number;
}


// 13F Hedge Fund Filings Interfaces
export interface HedgeFundProfile {
  id: string;
  fundName: string;
  managerName: string;
  aum: string;
  focusArea: string;
  thesisSummary: string;
  topHoldings: {
    symbol: string;
    name: string;
    weightPercent: number;
    changeType: "NEW BUY" | "INCREASED" | "REDUCED" | "HOLD";
  }[];
  convictionScore: number;
  badgeTag: string;
}

export interface Filing13FItem {
  id: string;
  fundId: string;
  fundName: string;
  managerName: string;
  symbol: string;
  companyName: string;
  sharesHeld: string;
  portfolioValueMillions: number;
  portfolioPercent: number;
  quarterlyChangeType:
    "NEW BUY" | "INCREASED" | "REDUCED" | "SOLD OUT" | "HOLD";
  quarterlyChangePercent: number;
  reportPeriod: string;
  convictionRating: "Extreme" | "High" | "Core Hold";
  aiThesis: string;
}

// Earnings Calendar & Report Summaries Interfaces
export interface EarningsReport {
  id: string;
  symbol: string;
  companyName: string;
  reportDate: string;
  timing: "Before Market Open" | "After Market Close" | "Confirmed";
  fiscalQuarter: string;
  epsEstimate: string;
  epsActual?: string;
  revenueEstimate: string;
  revenueActual?: string;
  guidanceHighlight: string;
  summaryText: string;
  aiKeyTakeaways: string[];
  beatOrMiss?: "Beat" | "Miss" | "Inline" | "Upcoming";
}

// Annual Revenue & Net Profit Rankings Interfaces
export interface CompanyFinancialRank {
  id: string;
  symbol: string;
  name: string;
  revenueBillions: number;
  netProfitBillions: number;
  netMarginPercent: number;
  revenueGrowthYoY: string;
  sector: string;
  summaryNote: string;
}

// IPO Tracking Interfaces
export interface IpoTrackerItem {
  id: string;
  companyName: string;
  symbolPlaceholder: string;
  expectedValuation: string;
  status: "Filed S-1" | "Rumored" | "Priced" | "Expected Q3/Q4";
  filingDate: string;
  sector: string;
  leadUnderwriters: string[];
  description: string;
  keyMetrics: { label: string; value: string }[];
  strategicRationale: string;
  signal: "Bullish" | "Watchlist" | "High Volatility";
}

// Merger & Acquisition Interfaces
export interface MaTrackerItem {
  id: string;
  acquirerName: string;
  acquirerSymbol: string;
  targetName: string;
  targetSymbol?: string;
  dealValue: string;
  dealType: "All-Stock" | "Cash & Stock" | "All-Cash";
  status:
    | "Pending Regulatory Approval"
    | "Under FTC/DOJ Review"
    | "Completed"
    | "Proposed Offer";
  expectedClose: string;
  arbitrageSpreadPercent?: number;
  regulatoryBodies: string[];
  strategicRationale: string;
  antitrustRiskLevel: "Low" | "Moderate" | "High";
}

// Regulatory Capture & Policy Moat Interfaces
export interface RegulatoryCaptureItem {
  id: string;
  companyName: string;
  symbol: string;
  regulatoryAgencies: string[]; // e.g. FTC, DOJ, SEC, NRC, FERC, BIS
  regulatoryMoatRating: number; // 1-10
  moatType:
    | "Licensing Barrier"
    | "Export Controls"
    | "Federal Defense Contracts"
    | "Government Mandate"
    | "Antitrust Defense";
  description: string;
  keyPolicyDevelopments: string[];
  lobbyingImpactScore:
    "High Protection" | "Dominant Moat" | "Regulatory Pressure";
  govContractValue?: string;
}

// Podcast News Feed Interfaces
export type SubjectCategoryId =
  "macro_ai" | "exponential_tech" | "wealth_mindset";

export interface PodcastNewsArticle {
  id: string;
  subjectCategory: SubjectCategoryId;
  subjectName: string;
  episodeTitle: string;
  episodeNumber?: string;
  publishedDate: string;
  readTime: string;
  summary: string;
  keyTopics: string[];
  relatedTickers: string[];
  sentiment: "Bullish" | "Bearish" | "Neutral";
  imageUrl: string;
  sourceUrl: string;
  keyTakeaways: string[];
}

// Real Estate Calculator Interfaces
export interface RealEstateCalcInput {
  propertyPrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  monthlyRent: number;
  propertyTaxAnnual: number;
  insuranceAnnual: number;
  maintenancePercent: number;
  vacancyPercent: number;
  propertyManagementPercent: number;
}

export interface RealEstateCalcResult {
  downPaymentAmount: number;
  loanAmount: number;
  monthlyMortgage: number;
  grossMonthlyIncome: number;
  monthlyExpenses: number;
  netMonthlyCashFlow: number;
  netAnnualCashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
  totalInvestment: number;
}

// Credit Building Interfaces
export interface CreditFactor {
  id: string;
  name: string;
  weightPercent: number;
  status: "Excellent" | "Good" | "Fair" | "Needs Work";
  scoreImpact: string;
  userValue: string;
  targetValue: string;
  description: string;
  tip: string;
}

export interface CreditCardItem {
  id: string;
  name: string;
  issuer: string;
  type: "Secured" | "Rewards" | "Business" | "0% APR";
  minScoreNeeded: number;
  annualFee: string;
  introApr: string;
  perks: string[];
  recommendedFor: string;
  applyUrl: string;
}

// YouTube Media Hub Interfaces
export interface YouTubeVideo {
  id: string;
  youtubeId: string; // for video embeds or links
  title: string;
  channelName: string;
  category:
    | "Real Estate"
    | "Credit Building"
    | "Stock Market"
    | "Wealth Blueprint"
    | "Real Life Shorts";
  duration: string;
  views: string;
  publishedDate: string;
  thumbnailUrl: string;
  description: string;
  keyTakeaways: string[];
  isShort?: boolean;
  videoUrl?: string;
  timestamp?: number;
}

export interface YouTubeChannel {
  id: string;
  channelName: string;
  handle: string;
  subscribers: string;
  videoCount: string;
  avatarUrl: string;
  bannerUrl: string;
  channelUrl: string;
  description: string;
}

// Backend Watchlist & Financial Types
export interface BackendWatchlistStock {
  symbol: string;
  price: number;
  change?: number;
  percent_change?: number;
  sparkline?: number[];
  market_cap?: string;
  analysis_summary?: string;
  sector?: SectorCategory;
  pinned?: boolean;
  target_price?: number;
  rating?: string;
  inst_holders?: Array<{ name: string; value: string }>;
  headlines?: Array<{
    title: string;
    source: string;
    time?: string;
    sentiment?: string;
    url?: string;
  }>;
}

// Chart Candle Data
export interface CandleDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  isUp?: boolean;
  changePercent?: number;
}

// Intel Feed Item
export interface IntelFeedItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  url: string;
  relatedSymbol?: string;
  sentiment: "positive" | "negative" | "neutral";
  category?: string;
  timestamp?: number;
}

// Report Repository Raw Items
export interface ReportRawItem {
  symbol?: string;
  companyName?: string;
  name?: string;
  quarterlyChangeType?: string;
  portfolioPercent?: string | number;
  weightPercent?: string | number;
  epsActual?: string | number;
  sharesHeld?: string | number;
  aiThesis?: string;
  notes?: string;
  [key: string]: any;
}

// Dyson Swarm Data Interfaces
export interface DysonVideo {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  channelName?: string;
}

export interface DysonLaunch {
  id: string;
  name: string;
  provider: string;
  date?: string;
  payload?: string;
  status: string;
  location?: string;
  net_launch_time?: string;
  description?: string;
  stream_url?: string;
  [key: string]: any;
}

export interface DysonStory {
  id: string;
  title: string;
  summary?: string;
  source?: string;
  url?: string;
  date?: string;
  image_url?: string;
  category?: string;
  stat_callout?: string;
  statCallout?: string;
  story_summary?: string;
  description?: string;
  [key: string]: any;
}

export interface DysonLiveData {
  upcoming_launches?: DysonLaunch[];
  dyson_stories?: DysonStory[];
  videos?: DysonVideo[];
  updated_at?: string;
}

// StockDetailModal SubComponent Shared Props
export interface StockDetailSubProps {
  stock: StockTicker;
  activeStock: StockTicker;
  displayStock: StockTicker | null;
  onClose: () => void;
  onTogglePin?: (symbol: string) => void;
  onShare?: (stock: StockTicker) => void;
  onOpenBloombergTerminal?: () => void;
  onOpenBrokerages?: (stock: StockTicker) => void;
  timeframe: TimeFrame;
  setTimeframe: (tf: TimeFrame) => void;
  hoverIndex: number | null;
  setHoverIndex: (idx: number | null) => void;
  aiAnalysis: string | null;
  setAiAnalysis: (val: string | null) => void;
  isAiLoading: boolean;
  setIsAiLoading: (val: boolean) => void;
  aiError: string | null;
  setAiError: (val: string | null) => void;
  chartMode: "candle" | "line";
  setChartMode: (mode: "candle" | "line") => void;
  zoomLevel: number;
  setZoomLevel: (val: number | ((prev: number) => number)) => void;
  panOffset: number;
  setPanOffset: (val: number | ((prev: number) => number)) => void;
  showSMA: boolean;
  setShowSMA: (val: boolean) => void;
  showVWAP: boolean;
  setShowVWAP: (val: boolean) => void;
  showRSI: boolean;
  setShowRSI: (val: boolean) => void;
  [key: string]: any;
}

