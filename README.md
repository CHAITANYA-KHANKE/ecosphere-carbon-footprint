# EcoTrack AI

EcoTrack AI is a privacy-first carbon footprint awareness dashboard built with React, Vite, Tailwind CSS, Recharts, and browser storage.

## Why it exists

Carbon data is difficult to act on when it is abstract. EcoTrack turns daily travel, electricity, food, and waste activity into:

- A transparent CO2e estimate and source breakdown
- A sustainability score and impact category
- Daily, weekly, and monthly progress analytics
- Personalized, selectable eco goals
- Achievements and a demo community leaderboard
- Downloadable CSV and PDF summaries

No account or API key is required. Data stays in the current browser through `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Calculation methodology

The calculator uses configurable awareness estimates from `src/lib/carbon.js`:

| Source | Factor |
|---|---:|
| Car | 0.21 kg CO2e/km |
| Bus | 0.08 kg CO2e/km |
| Train | 0.05 kg CO2e/km |
| Flight | 0.25 kg CO2e/km |
| Electricity | 0.85 kg CO2e/kWh |
| Waste | 0.45 kg CO2e/kg |

Food uses a daily estimate: vegan `1.5`, vegetarian `2.5`, and non-vegetarian `5.5` kg CO2e.

The result is an educational estimate, not a certified lifecycle assessment. Factors vary by vehicle, occupancy, electricity grid, route, and region.
The tree estimate annualizes the daily footprint and divides it by an awareness assumption of `21 kg CO2` absorbed per mature tree per year.

## Architecture

```text
src/
  components/   Shared layout and UI
  context/      Theme, profile, and local activity state
  lib/          Calculation, recommendations, and aggregation
  pages/        Dashboard experiences
test/           Node-based unit tests for domain logic
```

## Accessibility

- Visible keyboard focus indicators
- Semantic forms, fieldsets, tables, and navigation labels
- Toggle state exposed with ARIA
- Text summaries for data visualizations
- Reduced-motion support

## Deployment

The project is a static single-page app. Vercel can deploy it with:

- Build command: `npm run build`
- Output directory: `dist`

`vercel.json` provides the SPA route fallback.
