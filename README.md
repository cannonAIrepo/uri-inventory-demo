# URI Inventory Management

Sales-prototype SPA for **United Refrigeration Inc.**, an HVAC/R wholesale distributor. Mock data, two branches, no backend — built to demo Azure-hosted inventory workflows to a prospect.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS v3
- No external chart library — bar chart is plain SVG/CSS

## Run

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (usually http://localhost:5173).

## Build

```bash
npm run build
```

Outputs static assets to `dist/`. The included `staticwebapp.config.json` gives Azure Static Web Apps the SPA fallback rule.

## Features

- Branch switcher (Branch 001 Miami / Branch 007 Fort Lauderdale)
- Dashboard: total SKUs, in-stock / low-stock / critical counts, top 5 low-stock bar chart, activity feed
- Inventory: search, category filter, status badges, expandable detail rows
- Transfers & Orders: "Coming Soon" placeholders

## Notes

All inventory data lives in `src/data/inventory.ts`. Edit there to refresh the demo dataset.
