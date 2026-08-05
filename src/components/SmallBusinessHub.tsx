import React, { useState } from "react";
import {
  Briefcase,
  Scale,
  FileText,
  Building2,
  CreditCard,
  TrendingUp,
  Rocket,
  ShieldCheck,
  ExternalLink,
  ArrowUpRight,
  Calculator,
  Award,
  CheckCircle2,
  DollarSign,
  Globe,
  HelpCircle,
  Sparkles,
  BookOpen,
  Users,
  Landmark,
  Copy,
  Check,
  Zap,
  AlertCircle,
} from "lucide-react";

export const SmallBusinessHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "formation" | "business_credit" | "startup_roadmap" | "valuation_calc"
  >("formation");
  const [copiedEinSteps, setCopiedEinSteps] = useState(false);

  // Cap Table / SAFE Dilution Estimator States
  const [preMoneyValuation, setPreMoneyValuation] = useState<number>(5000000); // $5M
  const [safeInvestmentAmount, setSafeInvestmentAmount] =
    useState<number>(1000000); // $1M
  const [optionPoolPercent, setOptionPoolPercent] = useState<number>(10); // 10%
  const [initialFounderShares, setInitialFounderShares] =
    useState<number>(10000000); // 10M shares

  // Calculations
  const postMoneyValuation = preMoneyValuation + safeInvestmentAmount;
  const safeInvestorOwnership =
    (safeInvestmentAmount / postMoneyValuation) * 100;
  const founderPostOwnership = 100 - safeInvestorOwnership - optionPoolPercent;
  const pricePerShare = preMoneyValuation / initialFounderShares;
  const founderEquityValue = (postMoneyValuation * founderPostOwnership) / 100;

  const handleCopyEinSteps = () => {
    const guideText = `FREE IRS EIN APPLICATION STEPS:
1. Visit official irs.gov/ein (Mon-Fri 7am 10pm ET). Never pay 3rd parties $100-$300!
2. Select your structure (LLC, Corporation, Sole Proprietorship).
3. Input Responsible Party details (SSN or ITIN).
4. Provide Business Name, Physical Address, and Start Date.
5. Download your official CP 575 EIN Confirmation Letter PDF instantly.`;
    navigator.clipboard.writeText(guideText);
    setCopiedEinSteps(true);
    setTimeout(() => setCopiedEinSteps(false), 2500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-4 text-white font-sans">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-neutral-900 to-cyan-950 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-500/15 px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            Startup & Enterprise Command Center
          </span>
          <span className="text-xs font-mono font-bold text-cyan-400">
            Incorporation to IPO Matrix
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white flex items-center gap-2 animate-periodic-text-glitch">
          Small Business & Startup Accelerator
        </h2>
        <p className="text-xs font-tech text-neutral-300 uppercase tracking-wide leading-relaxed max-w-2xl mt-1">
          Complete legal formation guides, official free IRS EIN portal, FinCEN
          BOI compliance, business credit building (DUNS & Net-30s), SBA loans,
          and the 4-stage startup roadmap from Seed SAFE to M&A / Nasdaq IPO.
        </p>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("formation")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "formation"
                ? "bg-cyan-400 text-black font-extrabold shadow-lg shadow-cyan-400/30"
                : "bg-white/10 text-neutral-300 hover:bg-white/20"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Legal Formation & EIN
          </button>

          <button
            onClick={() => setActiveTab("business_credit")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "business_credit"
                ? "bg-cyan-400 text-black font-extrabold shadow-lg shadow-cyan-400/30"
                : "bg-white/10 text-neutral-300 hover:bg-white/20"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-indigo-300" />
            Business Credit & Loans
          </button>

          <button
            onClick={() => setActiveTab("startup_roadmap")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "startup_roadmap"
                ? "bg-cyan-400 text-black font-extrabold shadow-lg shadow-cyan-400/30"
                : "bg-white/10 text-neutral-300 hover:bg-white/20"
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-300" />
            Startup to M&A / IPO
          </button>

          <button
            onClick={() => setActiveTab("valuation_calc")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "valuation_calc"
                ? "bg-cyan-400 text-black font-extrabold shadow-lg shadow-cyan-400/30"
                : "bg-white/10 text-neutral-300 hover:bg-white/20"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-amber-300" />
            Cap Table & SAFE Calc
          </button>
        </div>
      </div>

      {/* TAB 1: LEGAL FORMATION & EIN */}
      {activeTab === "formation" && (
        <div className="space-y-6">
          {/* FREE IRS EIN WARNING BANNER */}
          <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                CRITICAL WARNING: FREE IRS GOVERNMENT PORTAL
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                $0 Official Fee
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              Do NOT Pay $100 to $300 to Third-Party Filing Sites for an EIN!
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              The U.S. Internal Revenue Service (IRS) provides Employer
              Identification Numbers (EINs){" "}
              <strong className="text-amber-300">100% FREE</strong> online with
              instant download of your official CP 575 confirmation document.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber-500/20">
              <button
                onClick={handleCopyEinSteps}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1.5 border border-white/10"
              >
                {copiedEinSteps ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>
                  {copiedEinSteps
                    ? "EIN Guide Copied!"
                    : "Copy EIN Step Checklist"}
                </span>
              </button>

              <a
                href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Official IRS.gov Free EIN Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Entity Choice Matrix: LLC vs C-Corp vs S-Corp */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-cyan-400" />
              Entity Structure Selection Guide (LLC vs C-Corp vs S-Corp)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* LLC */}
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/15 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                      Best for Small Business & Real Estate
                    </span>
                    <Building2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white animate-periodic-text-glitch">
                      Limited Liability Company (LLC)
                    </h4>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      Flexible asset protection with pass-through taxation.
                      Avoids double taxation, requires minimal annual corporate
                      formalities, and allows single or multi-member ownership.
                    </p>
                  </div>
                  <ul className="text-[11px] text-neutral-400 space-y-1 pt-1 border-t border-white/10">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Pass-through tax on personal 1040</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Operating Agreement defines split</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <a
                    href="https://www.sba.gov/business-guide/launch-your-business/choose-business-structure"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>SBA LLC Structure Guide</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Delaware C-Corp */}
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/15 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                      Required for VC Funding & IPO
                    </span>
                    <Rocket className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white animate-periodic-text-glitch">
                      Delaware C-Corporation
                    </h4>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      Standard structure for tech startups seeking Venture
                      Capital, Y Combinator, stock options (ESOP), SAFEs, and
                      future Nasdaq/NYSE IPO listings.
                    </p>
                  </div>
                  <ul className="text-[11px] text-neutral-400 space-y-1 pt-1 border-t border-white/10">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Allows stock classes & SAFE notes</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>QSBS 100% Tax-Free capital gains</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center gap-3">
                  <a
                    href="https://corp.delaware.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Delaware Corp Portal</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* S-Corp Election */}
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/15 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                      Self-Employment Tax Savings
                    </span>
                    <Landmark className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white animate-periodic-text-glitch">
                      S-Corporation Election (Form 2553)
                    </h4>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      Tax status election for LLCs or C-Corps making $60k+ net
                      profit. Allows owners to pay themselves a reasonable W-2
                      salary and take remaining profits as dividends (saving
                      15.3% SE tax).
                    </p>
                  </div>
                  <ul className="text-[11px] text-neutral-400 space-y-1 pt-1 border-t border-white/10">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Saves 15.3% FICA on dividends</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Requires payroll setup (Gusto/ADP)</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <a
                    href="https://www.irs.gov/forms-pubs/about-form-2553"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>IRS Form 2553 S-Corp Instructions</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Mandatory FinCEN BOI Reporting Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-neutral-900 to-slate-900 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Mandatory FinCEN BOI (Beneficial Ownership Information) Filing
              </h3>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded border border-cyan-500/30">
                Corporate Transparency Act
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Under federal law, nearly all LLCs, Corporations, and foreign
              entities formed in the U.S. must submit a free Beneficial
              Ownership Information (BOI) report identifying 25%+ owners or
              direct control individuals to the Financial Crimes Enforcement
              Network (FinCEN).
            </p>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400 font-mono">
                FinCEN Official e-Filing Portal ($0 Fee)
              </span>
              <a
                href="https://boiefiling.fincen.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
              >
                <span>File FinCEN BOI Report</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Legal Checklist: From Name Search to Bank Account */}
          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/15 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Step by Step Business Legal Formation Checklist
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 flex flex-col justify-between">
                <div>
                  <strong className="text-cyan-300 font-bold block">
                    1. Business Name & Trademark Search
                  </strong>
                  <span className="text-neutral-400">
                    Verify Secretary of State name availability and search USPTO
                    trademark database.
                  </span>
                </div>
                <a
                  href="https://www.uspto.gov/trademarks/search"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 w-fit"
                >
                  <span>USPTO Trademark Search Portal</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 flex flex-col justify-between">
                <div>
                  <strong className="text-cyan-300 font-bold block">
                    2. Registered Agent & State Articles
                  </strong>
                  <span className="text-neutral-400">
                    Appoint a registered agent and file Certificate of
                    Incorporation or Articles of Organization.
                  </span>
                </div>
                <a
                  href="https://corp.delaware.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 w-fit"
                >
                  <span>Delaware Secretary of State</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 flex flex-col justify-between">
                <div>
                  <strong className="text-cyan-300 font-bold block">
                    3. Obtain Free IRS EIN Number
                  </strong>
                  <span className="text-neutral-400">
                    Get your official tax ID instantly from irs.gov for bank
                    account setup.
                  </span>
                </div>
                <a
                  href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 w-fit"
                >
                  <span>IRS Free EIN Application</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 flex flex-col justify-between">
                <div>
                  <strong className="text-cyan-300 font-bold block">
                    4. Operating Agreement / Corporate Bylaws
                  </strong>
                  <span className="text-neutral-400">
                    Draft internal rules governing equity splits, voting rights,
                    and partner buyout clauses.
                  </span>
                </div>
                <a
                  href="https://www.sba.gov/business-guide/launch-your-business/choose-business-structure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 w-fit"
                >
                  <span>SBA Governance Guide</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 flex flex-col justify-between">
                <div>
                  <strong className="text-cyan-300 font-bold block">
                    5. Dedicated Business Bank Account
                  </strong>
                  <span className="text-neutral-400">
                    Open a business checking account to preserve corporate veil
                    liability protection.
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href="https://mercury.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded hover:bg-cyan-500/30 font-bold flex items-center gap-1"
                  >
                    <span>Mercury Banking</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <a
                    href="https://www.chase.com/business"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded hover:bg-blue-500/30 font-bold flex items-center gap-1"
                  >
                    <span>Chase Business</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <a
                    href="https://relayfi.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded hover:bg-emerald-500/30 font-bold flex items-center gap-1"
                  >
                    <span>Relay Bank</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 flex flex-col justify-between">
                <div>
                  <strong className="text-cyan-300 font-bold block">
                    6. Local Licenses & Seller's Permits
                  </strong>
                  <span className="text-neutral-400">
                    Apply for municipal business licenses, state sales tax
                    permits, and local registrations.
                  </span>
                </div>
                <a
                  href="https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 w-fit"
                >
                  <span>SBA License & Permit Directory</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUSINESS CREDIT & LOANS */}
      {activeTab === "business_credit" && (
        <div className="space-y-6">
          {/* DUNS & Net-30 Starter Guide */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-neutral-900 to-cyan-950 border border-cyan-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30">
                Dun & Bradstreet DUNS Number
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                Paydex Score 80+
              </span>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">
                Building Corporate Credit Without Personal Guarantee
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed mt-1">
                Separate personal and business finances by establishing a
                corporate Dun & Bradstreet D-U-N-S number, reporting Net-30
                vendor accounts, and building an 80+ Paydex score on Experian
                Business and Equifax Commercial.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-cyan-500/20">
              <a
                href="https://www.dnb.com/duns-number/get-a-duns-number.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-400/20 cursor-pointer"
              >
                <span>Get Free D-U-N-S Number at DnB.com</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex items-center gap-2">
                <a
                  href="https://www.experian.com/small-business/business-credit-reports"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-bold flex items-center gap-1"
                >
                  <span>Experian Business</span>
                  <ExternalLink className="w-3 h-3 text-cyan-300" />
                </a>
                <a
                  href="https://www.equifax.com/business/commercial-credit-risk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-bold flex items-center gap-1"
                >
                  <span>Equifax Commercial</span>
                  <ExternalLink className="w-3 h-3 text-indigo-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Starter Net-30 Vendor Accounts */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Top Net-30 Vendor Accounts to Build Business Credit Fast
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-white/15 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <strong className="text-white font-black text-sm">
                      Uline
                    </strong>
                    <span className="text-[10px] text-cyan-300 font-mono">
                      Reports D&B
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Shipping supplies and packaging. Buy $50+ on credit, pay
                    invoice within 30 days to build positive payment reporting.
                  </p>
                </div>
                <a
                  href="https://www.uline.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer pt-2 border-t border-white/10"
                >
                  <span>Apply at Uline.com</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-white/15 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <strong className="text-white font-black text-sm">
                      Quill
                    </strong>
                    <span className="text-[10px] text-indigo-300 font-mono">
                      Reports D&B
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Office supplies, paper, cleaning products. Requires initial
                    $100 order to open Net-30 credit line.
                  </p>
                </div>
                <a
                  href="https://www.quill.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer pt-2 border-t border-white/10"
                >
                  <span>Apply at Quill.com</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-white/15 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <strong className="text-white font-black text-sm">
                      Grainger
                    </strong>
                    <span className="text-[10px] text-emerald-300 font-mono">
                      Reports D&B/Exp
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Industrial equipment and maintenance supplies. Reports trade
                    lines to Dun & Bradstreet and Experian Commercial.
                  </p>
                </div>
                <a
                  href="https://www.grainger.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer pt-2 border-t border-white/10"
                >
                  <span>Apply at Grainger.com</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-white/15 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <strong className="text-white font-black text-sm">
                      Nav Business
                    </strong>
                    <span className="text-[10px] text-amber-300 font-mono">
                      Credit Monitor
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Monitors D&B, Experian, and Equifax business credit scores
                    while reporting monthly subscription as a trade line.
                  </p>
                </div>
                <a
                  href="https://www.nav.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer pt-2 border-t border-white/10"
                >
                  <span>Nav Credit Platform</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Top Business Credit Cards & SBA Loans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Credit Cards */}
            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-white flex items-center gap-2 animate-periodic-text-glitch">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  Top Business Cards (0% APR & Capital)
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-cyan-300 block font-bold">
                      Chase Ink Business Cash / Unlimited
                    </strong>
                    <a
                      href="https://creditcards.chase.com/business-credit-cards"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-cyan-300 hover:underline flex items-center gap-0.5"
                    >
                      <span>Apply</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <span className="text-neutral-300">
                    0% intro APR for 12 months + $750 bonus cash back. Doesn't
                    report to personal credit bureau if kept in good standing.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-indigo-300 block font-bold">
                      Brex / Ramp Corporate Cards
                    </strong>
                    <div className="flex gap-2">
                      <a
                        href="https://www.brex.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-indigo-300 hover:underline flex items-center gap-0.5"
                      >
                        <span>Brex</span>
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </a>
                      <a
                        href="https://ramp.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-indigo-300 hover:underline flex items-center gap-0.5"
                      >
                        <span>Ramp</span>
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                  <span className="text-neutral-300">
                    Zero personal guarantee cards for venture-backed startups
                    based on bank account balances ($50k+). Automatic expense
                    management.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-emerald-300 block font-bold">
                      Amex Business Gold / Platinum
                    </strong>
                    <a
                      href="https://www.americanexpress.com/us/credit-cards/business/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-emerald-300 hover:underline flex items-center gap-0.5"
                    >
                      <span>Amex Business</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <span className="text-neutral-300">
                    High purchasing capacity charge cards for scaling operations
                    with flexible payment terms and rewards.
                  </span>
                </div>
              </div>
            </div>

            {/* SBA Loans & Line of Credit */}
            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-white flex items-center gap-2 animate-periodic-text-glitch">
                  <Landmark className="w-5 h-5 text-emerald-400" />
                  SBA Government Guaranteed Loans
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-emerald-300 block font-bold">
                      SBA 7(a) Loan Program (Up to $5M)
                    </strong>
                    <a
                      href="https://www.sba.gov/funding-programs/loans/7a"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-emerald-300 hover:underline flex items-center gap-0.5"
                    >
                      <span>Details</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <span className="text-neutral-300">
                    Primary SBA loan for working capital, equipment, debt
                    refinancing, and business acquisition. Terms up to 10-25
                    years.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-amber-300 block font-bold">
                      SBA 504 Loan (Commercial Real Estate)
                    </strong>
                    <a
                      href="https://www.sba.gov/funding-programs/loans/504"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-300 hover:underline flex items-center gap-0.5"
                    >
                      <span>Details</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <span className="text-neutral-300">
                    Long term, fixed-rate financing for purchasing
                    owner-occupied commercial real estate or major heavy
                    equipment.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-cyan-300 block font-bold">
                      SBA Microloans (Up to $50,000)
                    </strong>
                    <a
                      href="https://www.sba.gov/funding-programs/loans/microloans"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-cyan-300 hover:underline flex items-center gap-0.5"
                    >
                      <span>Details</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <span className="text-neutral-300">
                    Targeted loans for early-stage startups and small businesses
                    needing working capital, inventory, or supplies.
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <a
                  href="https://www.sba.gov/funding-programs/loans"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30 w-fit"
                >
                  <span>SBA Official Loan Finder Portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STARTUP TO M&A / IPO ROADMAP */}
      {activeTab === "startup_roadmap" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cyan-400" />
                The 4-Stage Startup Lifecycle: From Idea to Nasdaq IPO / M&A
                Exit
              </h3>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded border border-cyan-500/30">
                Venture Playbook
              </span>
            </div>

            {/* STAGE 1 */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded">
                  STAGE 1: FORMATION & IP PROTECTION
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Bootstrapped / Friends & Family
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">
                Delaware C-Corp, Founder Vesting & IP Assignment
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Incorporate as a Delaware C-Corp, execute 4-year founder vesting
                agreements with a 1-year cliff, assign all intellectual property
                (IP) to the company via CIIA agreements, file 83(b) tax
                elections within 30 days of stock issuance, and set up a
                standard 10% employee stock option pool (ESOP).
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
                <a
                  href="https://nvca.org/model-legal-documents/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-[11px] flex items-center gap-1 border border-cyan-500/30"
                >
                  <span>NVCA Model Legal Forms</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.irs.gov/forms-pubs/about-form-83b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-[11px] flex items-center gap-1 border border-purple-500/30"
                >
                  <span>IRS Section 83(b) Election</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* STAGE 2 */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                  STAGE 2: PRE-SEED / SEED & SAFEs
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  $500k to $3M Raised
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">
                YC Post-Money SAFE Notes & Accelerator Programs
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Raise initial seed capital using Y Combinator Post-Money SAFE
                (Simple Agreement for Future Equity) instruments. Avoid price
                negotiation early on by setting valuation caps (e.g. $5M to $12M
                cap). Build Minimum Viable Product (MVP), achieve product-market
                fit (PMF), and apply to top tier accelerators (YC, Techstars,
                AngelPad).
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
                <a
                  href="https://www.ycombinator.com/documents"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] flex items-center gap-1 border border-amber-500/30"
                >
                  <span>Y Combinator Official SAFE Documents</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.ycombinator.com/apply"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center gap-1 border border-emerald-500/30"
                >
                  <span>Apply to YC</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.techstars.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold text-[11px] flex items-center gap-1 border border-indigo-500/30"
                >
                  <span>Techstars Accelerators</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* STAGE 3 */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
                  STAGE 3: SERIES A, B, C SCALING
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  $10M to $100M+ Growth VCs
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">
                Priced Equity Rounds, Lead Term Sheets & Board Seats
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Transition from SAFEs to priced equity Series A rounds led by
                institutional VC firms (Sequoia, Andreessen Horowitz,
                Benchmark). Issue Preferred Stock, establish formal Board of
                Directors governance, maintain Cap Table management platforms
                (Carta, Pulley), and scale ARR (Annual Recurring Revenue)
                exponentially.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
                <a
                  href="https://carta.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold text-[11px] flex items-center gap-1 border border-indigo-500/30"
                >
                  <span>Carta Equity Management</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://pulley.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-[11px] flex items-center gap-1 border border-cyan-500/30"
                >
                  <span>Pulley Cap Table</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* STAGE 4 */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                  STAGE 4: EXIT STRATEGY (M&A OR IPO)
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Liquidity Event
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">
                M&A Strategic Acquisition or Nasdaq/NYSE S-1 Public Listing
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Execute a strategic liquidity exit. Option A: M&A buyout by a
                tech titan or Private Equity firm at 10x-30x ARR multiples.
                Option B: File Form S-1 registration statement with the SEC,
                retain investment bankers (Goldman Sachs, Morgan Stanley),
                conduct investor roadshows, and list on Nasdaq / NYSE.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
                <a
                  href="https://www.sec.gov/edgar/searchedgar/companysearch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-[11px] flex items-center gap-1 border border-cyan-500/30"
                >
                  <span>SEC EDGAR S-1 Filings Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.nasdaq.com/solutions/nasdaq-listing-center"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] flex items-center gap-1 border border-amber-500/30"
                >
                  <span>Nasdaq Listing Center</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.nyse.com/listings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center gap-1 border border-emerald-500/30"
                >
                  <span>NYSE Listings Guide</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CAP TABLE & SAFE DILUTION CALCULATOR */}
      {activeTab === "valuation_calc" && (
        <div className="p-6 rounded-3xl bg-neutral-900/90 border border-white/15 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                Startup Cap Table & SAFE Dilution Estimator
              </h3>
              <p className="text-xs text-neutral-400">
                Simulate investor equity dilution, post-money valuation, and
                founder equity retention after raising a SAFE investment round.
              </p>
            </div>
            <a
              href="https://www.ycombinator.com/documents"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1"
            >
              <span>Download YC SAFE Template</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pre-Money Valuation */}
            <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400 font-medium">
                  Pre-Money Valuation Cap:
                </span>
                <span className="font-mono font-black text-cyan-300">
                  ${preMoneyValuation.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={1000000}
                max={50000000}
                step={500000}
                value={preMoneyValuation}
                onChange={(e) => setPreMoneyValuation(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* SAFE Investment */}
            <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400 font-medium">
                  SAFE Round Investment Amount:
                </span>
                <span className="font-mono font-black text-emerald-300">
                  ${safeInvestmentAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={10000000}
                step={100000}
                value={safeInvestmentAmount}
                onChange={(e) =>
                  setSafeInvestmentAmount(Number(e.target.value))
                }
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Option Pool */}
            <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400 font-medium">
                  Unallocated Option Pool (ESOP):
                </span>
                <span className="font-mono font-black text-purple-300">
                  {optionPoolPercent}%
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={20}
                step={1}
                value={optionPoolPercent}
                onChange={(e) => setOptionPoolPercent(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            {/* Initial Founder Shares */}
            <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400 font-medium">
                  Initial Founder Shares Issued:
                </span>
                <span className="font-mono font-black text-amber-300">
                  {initialFounderShares.toLocaleString()} shares
                </span>
              </div>
              <input
                type="range"
                min={1000000}
                max={20000000}
                step={500000}
                value={initialFounderShares}
                onChange={(e) =>
                  setInitialFounderShares(Number(e.target.value))
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center font-mono">
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-1">
              <span className="text-[10px] text-cyan-300 uppercase font-bold block">
                Post-Money Valuation
              </span>
              <span className="text-xl font-black text-cyan-300">
                ${postMoneyValuation.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">
                SAFE Investor Ownership
              </span>
              <span className="text-xl font-black text-emerald-300">
                {safeInvestorOwnership.toFixed(1)}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
              <span className="text-[10px] text-indigo-300 uppercase font-bold block">
                Founder Retained Ownership
              </span>
              <span className="text-xl font-black text-indigo-300">
                {founderPostOwnership.toFixed(1)}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-1">
              <span className="text-[10px] text-amber-300 uppercase font-bold block">
                Est. Implied Share Price
              </span>
              <span className="text-xl font-black text-amber-300">
                ${pricePerShare.toFixed(3)}/sh
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
