# Stock Bloc — Autonomous Financial Market Terminal & Quant AI Agent Engine

[![Canonical Live Production URL](https://img.shields.io/badge/Production%20Terminal-https%3A%2F%2Fstock--bloc.ai.studio-cyan?style=for-the-badge)](https://stock-bloc.ai.studio)
[![OpenAPI Spec](https://img.shields.io/badge/OpenAPI-3.0.1-blue?style=for-the-badge)](https://stock-bloc.ai.studio/api/v1/openapi.json)
[![LLM Specification](https://img.shields.io/badge/LLMs.txt-Agent%20Ready-emerald?style=for-the-badge)](https://stock-bloc.ai.studio/llms.txt)

**Stock Bloc** is an autonomous financial market intelligence terminal, SEC 13F whale tracker, quant AI agent arena, credit repair generator, and wealth operating system.

---

## 🌐 Canonical URLs & Agent Endpoints

- **Canonical Live Application**: [https://stock-bloc.ai.studio](https://stock-bloc.ai.studio)
- **Machine LLM Specification**: [https://stock-bloc.ai.studio/llms.txt](https://stock-bloc.ai.studio/llms.txt)
- **OpenAPI 3.0.1 Schema**: [https://stock-bloc.ai.studio/api/v1/openapi.json](https://stock-bloc.ai.studio/api/v1/openapi.json)
- **AI Plugin Manifest**: [https://stock-bloc.ai.studio/.well-known/ai-plugin.json](https://stock-bloc.ai.studio/.well-known/ai-plugin.json)
- **MCP Tool Configuration**: [https://stock-bloc.ai.studio/api/v1/mcp-config.json](https://stock-bloc.ai.studio/api/v1/mcp-config.json)
- **Data Status & Freshness API**: [https://stock-bloc.ai.studio/api/v1/data-status](https://stock-bloc.ai.studio/api/v1/data-status)

---

## 💻 Local Development & Commands

### Prerequisites
- Node.js (v18 or v20 recommended)
- npm or bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
Starts the Express proxy + Vite server on `http://localhost:3000` with TypeScript execution:
```bash
npm run dev
```

### 3. Build for Production
Bundles frontend static assets with Vite into `dist/` and compiles `server.ts` into a bundled CommonJS backend at `dist/server.cjs`:
```bash
npm run build
```

### 4. Start Production Server
Runs the standalone compiled Node server on port 3000:
```bash
npm run start
```

### 5. Run Model Context Protocol (MCP) Server
Runs the Model Context Protocol stdio server for Claude Desktop, Gemini, or custom AI agents:
```bash
node mcp-server.js
```

---

## 📡 Public Backend Data Contract & Raw JSON Feeds

Stock Bloc feeds market quotes, 13F whale filings, Dyson swarm orbital telemetry, and intelligence news from public, verified JSON feeds:

1. **Market Watchlist & Price Feed**:
   - `https://raw.githubusercontent.com/Jaywestphilly/stock-bloc-backend/main/market_watchlist_data.json`
2. **SEC Form 13F Institutional Holdings**:
   - `https://raw.githubusercontent.com/Jaywestphilly/stock-bloc-backend/main/sec_intel_data.json`
3. **Dyson Swarm AI Telemetry**:
   - `https://raw.githubusercontent.com/Jaywestphilly/stock-bloc-backend/main/dyson_swarm_data.json`
4. **Intelligence News & Podcast Feed**:
   - `https://raw.githubusercontent.com/Jaywestphilly/stock-bloc-backend/main/intel_news_feed.json`

---

## 🛠 Model Context Protocol (MCP) Tools

The `mcp-server.js` provides AI agents with the following tools (all returning ISO `data_as_of` timestamps):
- `get_agent_leaderboard`: Ranks community AI quant agents.
- `get_live_quote`: Fetch real-time stock prices & 52-week metrics.
- `run_quant_simulation`: Run an algorithmic portfolio backtest.
- `get_ai_stock_analysis`: Grounded stock analysis via Gemini AI.
- `search_13f_whale_filings`: SEC Form 13F-HR institutional holdings parser.
- `get_data_status`: System pipeline freshness & `updated_at` status for all 4 backend data feeds.
- `get_ebook_playbook`: PDF playbook download links (`/public/playbooks/`).

---

## 📂 Repository Layout

- `/src`: React components, stores, hooks, and feature hubs.
- `/server.ts`: Full-stack Express backend with Vite integration & API proxies.
- `/mcp-server.js`: MCP server script.
- `/public`: Static web assets, `llms.txt`, `.well-known/`, and `/public/playbooks` (educational PDFs).
- `/scripts`: Internal utility scripts and data backups.
