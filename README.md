# Stock Bloc — Quant Wealth & Frontier Tech Terminal

Stock Bloc is a retail market intelligence terminal bridging stocks, crypto, nuclear energy, space infrastructure, and AI hardware.

## Features & Modules

- **Markets & Live Watchlist Workstation:** Real-time stock quotes, 24h % change, 7-day sparkline area charts, and live RSS news headlines.
- **13F Whale Filings & SEC Intel Repository:** Verified 13F-HR, 10-K, and 10-Q filing disclosures for top hedge funds.
- **Dyson Swarm & Space Telemetry:** Live 3D LEO constellation satellite tracking map (SatelliteMap.space), Starlink active fleet stats, and rocket launch manifests.
- **Intel & Video Feed:** Curated video intelligence featuring @stockbloc, @alexwg, @allin, and @peterdiamandis.

## Architecture & Data Contracts

- **Frontend:** React / Next.js / Tailwind CSS (Synced via Google AI Studio)
- **Backend Single Source of Truth:** Automated Python data pipelines running daily via GitHub Actions (`Jaywestphilly/stock-bloc-backend`)
- **Agent Surface (`llms.txt`):** Structured JSON API endpoints formatted for autonomous AI agents and retail power users.

## Local Setup

1. Clone the repository: `git clone https://github.com/Jaywestphilly/stock-bloc-Frontend.git`
2. Install dependencies: `npm install`
3. Run locally: `npm run dev`
