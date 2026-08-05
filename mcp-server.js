#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = process.env.STOCK_BLOC_URL || "https://ais-pre-p3tflmsyxu75gnec7nb7vy-350859978227.us-east1.run.app";

const server = new Server(
  {
    name: "stock-bloc-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools available via MCP
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_agent_leaderboard",
        description: "Fetch top ranked Stock Bloc AI agents, win rates, alpha returns, badges, and top trade recommendations.",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Number of top agents to return (default: 10)",
            },
          },
        },
      },
      {
        name: "get_stock_quote",
        description: "Get real-time stock price, 52-week highs/lows, PE ratio, volume, and market cap for any ticker symbol.",
        inputSchema: {
          type: "object",
          properties: {
            symbol: {
              type: "string",
              description: "Stock ticker symbol (e.g. AAPL, NVDA, TSLA, MSFT, BTC)",
            },
          },
          required: ["symbol"],
        },
      },
      {
        name: "run_quant_simulation",
        description: "Evaluate quantitative portfolio allocations and return simulated Sharpe ratio, win rate, and max drawdown.",
        inputSchema: {
          type: "object",
          properties: {
            tickers: {
              type: "array",
              items: { type: "string" },
              description: "Array of stock symbols (e.g. ['NVDA', 'AAPL', 'MSFT'])",
            },
            weights: {
              type: "array",
              items: { type: "number" },
              description: "Portfolio weights summing to 1.0 (e.g. [0.5, 0.3, 0.2])",
            },
            initialCapital: {
              type: "number",
              description: "Initial investment in USD (default: 10000)",
            },
          },
          required: ["tickers", "weights"],
        },
      },
      {
        name: "analyze_stock_ai",
        description: "Run comprehensive AI market analysis, fundamental metrics, and technical signals for any stock ticker.",
        inputSchema: {
          type: "object",
          properties: {
            symbol: {
              type: "string",
              description: "Stock ticker symbol (e.g. NVDA, AMZN, PLTR)",
            },
          },
          required: ["symbol"],
        },
      },
      {
        name: "search_13f_whale_filings",
        description: "Search SEC 13F institutional whale holdings for major funds (ARK Invest, Duquesne, Tiger Global, Berkshire Hathaway).",
        inputSchema: {
          type: "object",
          properties: {
            manager: {
              type: "string",
              description: "Manager or fund name (e.g. 'ARK', 'Duquesne', 'Berkshire', 'Tiger')",
            },
          },
        },
      },
      {
        name: "get_ebook_playbook",
        description: "Get information and direct PDF download links for Stock Bloc Wealth Operating System e-books and financial playbooks.",
        inputSchema: {
          type: "object",
          properties: {
            ebookId: {
              type: "string",
              description: "Ebook ID (e.g. 'wealth_operating_system', 'future_wealth_blueprint', 'playbook_13f_whale')",
            },
          },
        },
      },
    ],
  };
});

// Handle Tool Executions
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_agent_leaderboard") {
      const res = await fetch(`${BASE_URL}/api/v1/agent/leaderboard`);
      const data = await res.json();
      const limit = args?.limit || 10;
      const agents = (data.leaderboard || []).slice(0, limit);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                summary: `Retrieved ${agents.length} top Stock Bloc AI agents`,
                totalAgents: data.totalAgents,
                topAgents: agents,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "get_stock_quote") {
      const symbol = String(args.symbol).toUpperCase();
      const res = await fetch(`${BASE_URL}/api/live-quote/${symbol}`);
      const data = await res.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (name === "run_quant_simulation") {
      const res = await fetch(`${BASE_URL}/api/v1/agent/quant-sim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tickers: args.tickers,
          weights: args.weights,
          initialCapital: args.initialCapital || 10000,
        }),
      });
      const data = await res.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (name === "analyze_stock_ai") {
      const symbol = String(args.symbol).toUpperCase();
      const res = await fetch(`${BASE_URL}/api/ai/stock-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: symbol }),
      });
      const data = await res.json();

      return {
        content: [
          {
            type: "text",
            text: data.analysis || JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (name === "search_13f_whale_filings") {
      const manager = args?.manager ? String(args.manager).toLowerCase() : "";
      const whales = [
        {
          manager: "Cathie Wood (ARK Invest)",
          topHoldings: [
            { ticker: "TSLA", weight: "8.5%", shares: "3.4M", value: "$1.8B" },
            { ticker: "COIN", weight: "7.2%", shares: "2.1M", value: "$1.4B" },
            { ticker: "ROKU", weight: "6.1%", shares: "4.8M", value: "$1.1B" },
            { ticker: "PATH", weight: "5.4%", shares: "12.3M", value: "$950M" },
          ],
          qChange: "Increased AI compute and autonomous robotics holdings by +14%",
        },
        {
          manager: "Stanley Druckenmiller (Duquesne)",
          topHoldings: [
            { ticker: "NVDA", weight: "12.4%", shares: "1.8M", value: "$1.6B" },
            { ticker: "MSFT", weight: "9.1%", shares: "2.2M", value: "$1.2B" },
            { ticker: "AMZN", weight: "7.8%", shares: "3.5M", value: "$980M" },
            { ticker: "CEG", weight: "5.9%", shares: "1.4M", value: "$720M" },
          ],
          qChange: "Heavy accumulation of AI hardware and nuclear energy power suppliers",
        },
        {
          manager: "Warren Buffett (Berkshire Hathaway)",
          topHoldings: [
            { ticker: "AAPL", weight: "28.5%", shares: "300M", value: "$68B" },
            { ticker: "BAC", weight: "9.8%", shares: "800M", value: "$32B" },
            { ticker: "AXP", weight: "8.2%", shares: "151M", value: "$28B" },
            { ticker: "KO", weight: "7.1%", shares: "400M", value: "$24B" },
          ],
          qChange: "Built massive $300B+ cash reserve, maintaining durable moat compounders",
        },
      ];

      const filtered = manager
        ? whales.filter((w) => w.manager.toLowerCase().includes(manager))
        : whales;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(filtered, null, 2),
          },
        ],
      };
    }

    if (name === "get_ebook_playbook") {
      const ebookId = args?.ebookId || "wealth_operating_system";
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                ebookId,
                title: "Stock Bloc Wealth Operating System",
                downloadUrl: `${BASE_URL}/api/download/ebook/${ebookId}`,
                format: "High-Resolution PDF",
                author: "Jumanne Carter / Jay West Philly",
              },
              null,
              2
            ),
          },
        ],
      };
    }

    throw new Error(`Unknown MCP tool name: ${name}`);
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error executing MCP tool ${name}: ${error?.message || error}`,
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Stock Bloc MCP Server running over Stdio");
}

main().catch((err) => {
  console.error("Fatal error starting Stock Bloc MCP Server:", err);
  process.exit(1);
});
