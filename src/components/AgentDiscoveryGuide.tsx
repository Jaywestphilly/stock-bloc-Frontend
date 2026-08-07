import React, { useState } from "react";
import {
  Globe,
  Code2,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Bot,
  Zap,
  Cpu,
  FileText,
  Network,
  Terminal,
} from "lucide-react";
import { triggerHaptic } from "../utils/haptics";

export const AgentDiscoveryGuide: React.FC = () => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [activeTestEndpoint, setActiveTestEndpoint] = useState<string>("/api/v1/agent/leaderboard");
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);

  const handleCopy = (path: string) => {
    triggerHaptic("selection");
    navigator.clipboard.writeText(`https://stock-bloc.ai.studio${path}`);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleRunApiTest = async (endpoint: string) => {
    setIsLoadingTest(true);
    setActiveTestEndpoint(endpoint);
    triggerHaptic("selection");

    try {
      const res = await fetch(endpoint);
      if (endpoint.endsWith(".txt")) {
        const text = await res.text();
        setTestResponse(text);
      } else {
        const json = await res.json();
        setTestResponse(JSON.stringify(json, null, 2));
      }
    } catch {
      setTestResponse("// Error fetching endpoint. Ensure server is running on port 3000.");
    } finally {
      setIsLoadingTest(false);
    }
  };

  const discoveryEndpoints = [
    {
      title: "Pipeline Data Status & Freshness",
      path: "/api/v1/data-status",
      type: "Status JSON",
      status: "200 OK",
      description: "Unified pipeline updated_at timestamps and stale boolean flags for market, 13F, dyson, and news feeds.",
    },
    {
      title: "Market Watchlist & Price Proxy",
      path: "/api/data/market",
      type: "CDN Proxy JSON",
      status: "200 OK",
      description: "Fast local Express CDN proxy endpoint for market watchlist quotes, sparklines, and sector data.",
    },
    {
      title: "SEC 13F Whale Holdings Proxy",
      path: "/api/data/sec",
      type: "CDN Proxy JSON",
      status: "200 OK",
      description: "Fast local Express CDN proxy endpoint for SEC Form 13F institutional whale holdings & quarter filings.",
    },
    {
      title: "Agent Plugin Manifest",
      path: "/.well-known/ai-plugin.json",
      type: "JSON / Plugin Spec",
      status: "200 OK",
      description: "Standard OpenAI & ChatGPT Plugin manifest detailing server authentication, capabilities, and openapi URL.",
    },
    {
      title: "LLM Web Context Discovery",
      path: "/llms.txt",
      type: "Markdown / Plaintext",
      status: "200 OK",
      description: "Standard machine context file for Anthropic, Claude Projects, Perplexity, and agent web crawlers.",
    },
    {
      title: "OpenAPI 3.0 Specification",
      path: "/api/v1/openapi.json",
      type: "OpenAPI 3.0 JSON",
      status: "200 OK",
      description: "Structured REST API schema ready for LangChain, AutoGPT, CrewAI, or custom Python agent ingestion.",
    },
  ];

  return (
    <div className="bg-[#020a16] border-2 border-emerald-500/50 alien-block-cut p-6 shadow-2xl relative space-y-6 mt-10 font-mono">
      <div className="hud-corner-tl border-emerald-400" />
      <div className="hud-corner-tr border-emerald-400" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-400 rounded alien-block-cut-sm text-emerald-300">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                Machine-Readable Standards
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Autonomous Discovery Ready
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-tech text-white uppercase tracking-wide mt-1">
              HOW AI AGENTS FIND & INTEGRATE WITH STOCK BLOC
            </h2>
            <p className="text-xs text-neutral-300 font-sans max-w-2xl mt-0.5">
              Stock Bloc implements all major machine-readable protocol standards so ChatGPT GPTs, Claude Projects, Gemini Extensions, LangChain, and AutoGPT can discover, crawl, and query our financial terminal automatically.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black font-tech text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-400/20"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open /llms.txt</span>
          </a>
        </div>
      </div>

      {/* Discovery Architecture Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-black/80 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-tech text-xs uppercase">
            <Globe className="w-4 h-4" />
            <span>1. Agent Web Discovery</span>
          </div>
          <p className="text-xs text-neutral-300 font-sans leading-relaxed">
            AI web crawlers like <span className="text-emerald-300 font-mono">GPTBot</span> and <span className="text-emerald-300 font-mono">ClaudeBot</span> inspect <span className="text-cyan-300 font-mono">/llms.txt</span> and <span className="text-cyan-300 font-mono">robots.txt</span> upon domain request to build system context.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-black/80 border border-cyan-500/30 space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-bold font-tech text-xs uppercase">
            <Cpu className="w-4 h-4" />
            <span>2. MCP Server Protocol</span>
          </div>
          <p className="text-xs text-neutral-300 font-sans leading-relaxed">
            Connect Claude Desktop, Cursor, and Windsurf via Model Context Protocol tools (<span className="text-cyan-300 font-mono">/mcp.json</span> or <span className="text-cyan-300 font-mono">mcp-server.js</span>).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-black/80 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold font-tech text-xs uppercase">
            <Zap className="w-4 h-4" />
            <span>3. Autonomous Execution</span>
          </div>
          <p className="text-xs text-neutral-300 font-sans leading-relaxed">
            Agents make zero-auth REST or MCP tool calls to <span className="text-amber-300 font-mono">/api/v1/agent/leaderboard</span> or <span className="text-amber-300 font-mono">/api/v1/agent/quant-sim</span> to execute quantitative backtests.
          </p>
        </div>
      </div>

      {/* Model Context Protocol (MCP) Server Integration Section */}
      <div className="bg-[#031326] border-2 border-cyan-500/60 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest bg-cyan-950 border border-cyan-500/50 px-2 py-0.5 rounded">
                  MODEL CONTEXT PROTOCOL (MCP)
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 rounded font-mono">
                  READY FOR CLAUDE & CURSOR
                </span>
              </div>
              <h3 className="text-lg font-black font-tech text-white uppercase tracking-wide mt-0.5">
                STOCK BLOC MCP SERVER PACKAGING
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic("selection");
              const config = {
                mcpServers: {
                  "stock-bloc": {
                    command: "node",
                    args: ["./mcp-server.js"],
                    env: { STOCK_BLOC_URL: "https://stock-bloc.ai.studio" }
                  }
                }
              };
              navigator.clipboard.writeText(JSON.stringify(config, null, 2));
              setCopiedPath("mcp-config-json");
              setTimeout(() => setCopiedPath(null), 2000);
            }}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black font-tech text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 shrink-0"
          >
            {copiedPath === "mcp-config-json" ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>COPIED CLAUDE CONFIG!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-black" />
                <span>COPY CLAUDE DESKTOP CONFIG</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-neutral-300 font-sans leading-relaxed">
          Stock Bloc APIs are packaged into an official Model Context Protocol (MCP) server. Paste this snippet into your <code className="text-cyan-300 font-mono bg-black/60 px-1.5 py-0.5 rounded">claude_desktop_config.json</code> or Cursor MCP settings to allow Claude to run live stock queries, quant backtests, and 13F whale filings searches!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[11px] font-tech font-bold text-cyan-300 uppercase tracking-wider block">
              claude_desktop_config.json
            </span>
            <pre className="p-3 bg-black/90 border border-cyan-500/40 rounded-xl text-[10px] font-mono text-cyan-200/90 leading-tight overflow-x-auto select-all">
{`{
  "mcpServers": {
    "stock-bloc": {
      "command": "node",
      "args": ["./mcp-server.js"],
      "env": {
        "STOCK_BLOC_URL": "https://stock-bloc.ai.studio"
      }
    }
  }
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-tech font-bold text-amber-300 uppercase tracking-wider block">
              EXPOSED MCP TOOLS & CAPABILITIES
            </span>
            <div className="p-3 bg-black/90 border border-amber-500/40 rounded-xl space-y-1.5 text-[11px] font-mono text-neutral-300">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span><strong className="text-white">get_stock_quote</strong> (Live stock quotes & valuation)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span><strong className="text-white">run_quant_simulation</strong> (Quant portfolio backtests)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span><strong className="text-white">get_agent_leaderboard</strong> (Rankings & trade signals)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span><strong className="text-white">search_13f_whale_filings</strong> (Institutional SEC filings)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span><strong className="text-white">analyze_stock_ai</strong> (AI fundamental analysis)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span><strong className="text-white">get_ebook_playbook</strong> (Direct PDF playbooks)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Endpoints Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-black font-tech text-emerald-300 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>LIVE MACHINE-READABLE DISCOVERY ENDPOINTS</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {discoveryEndpoints.map((ep) => (
            <div
              key={ep.path}
              className="p-4 bg-black/70 border border-emerald-500/30 hover:border-emerald-400/80 rounded-xl flex flex-col justify-between space-y-3 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-black font-tech text-white uppercase">{ep.title}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {ep.status}
                  </span>
                </div>
                <div className="text-xs text-cyan-300 font-mono bg-neutral-950 px-2.5 py-1 rounded border border-neutral-800 font-bold mb-2 break-all">
                  {ep.path}
                </div>
                <p className="text-xs text-neutral-300 font-sans">{ep.description}</p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                <button
                  onClick={() => handleRunApiTest(ep.path)}
                  className="text-[11px] font-tech font-bold text-amber-300 hover:text-amber-200 uppercase flex items-center gap-1 cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Test Output</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(ep.path)}
                    className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPath === ep.path ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <a
                    href={ep.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Test Console */}
      <div className="bg-black/90 border border-amber-500/40 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2 text-amber-300 font-tech font-black text-xs uppercase">
            <Terminal className="w-4 h-4" />
            <span>LIVE AGENT API TEST CONSOLE: {activeTestEndpoint}</span>
          </div>
          <span className="text-[10px] text-neutral-400">Real-Time Endpoint Inspector</span>
        </div>

        {isLoadingTest ? (
          <div className="p-6 text-center text-amber-400 font-mono text-xs animate-pulse">
            // FETCHING LIVE PAYLOAD FROM SERVER PORT 3000...
          </div>
        ) : testResponse ? (
          <pre className="p-3 bg-[#010812] border border-neutral-800 rounded-lg text-[11px] font-mono text-emerald-300/90 whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar select-all">
            {testResponse}
          </pre>
        ) : (
          <div className="p-4 text-center text-neutral-400 font-mono text-xs">
            Click "Test Output" on any endpoint above to inspect the live machine payload returned to AI agents.
          </div>
        )}
      </div>
    </div>
  );
};
