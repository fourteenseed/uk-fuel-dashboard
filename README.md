# UK Oil & Fuel Supply Intelligence Dashboard

Live dashboard tracking UK oil reserves, production, Brent crude prices, pump prices, and local fuel search by postcode.

## Live APIs used (all free, no keys)

- **postcodes.io** — UK postcode geocoding
- **CheckFuelPrices API** — live fuel prices from GOV.UK Fuel Finder scheme (4,000+ stations)

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Deploy to Vercel

### From the terminal (if you have Vercel CLI)

```bash
npm i -g vercel    # one-time install
vercel             # follow the prompts
```

### From GitHub (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo
4. Vercel auto-detects Vite — just click Deploy
5. Done. You get a `.vercel.app` URL immediately

### Custom domain

In Vercel dashboard → Settings → Domains → add your domain (e.g. `fuel.fourteenseed.com`).
Point a CNAME record to `cname.vercel-dns.com` in your DNS.

## Data sources

| Data | Source | Update frequency |
|------|--------|-----------------|
| Local fuel prices | GOV.UK Fuel Finder via CheckFuelPrices | Every 30 min |
| Brent crude | Static (update manually or wire to API) | As needed |
| Strategic reserves | DESNZ, Feb 2026 | Monthly |
| Production/consumption | DUKES 2025 / Energy Trends | Annual/quarterly |
| Stock levels | DESNZ ET 3.11 | Monthly |

## Attribution

Fuel price data from [checkfuelprices.co.uk](https://checkfuelprices.co.uk) via [GOV.UK Fuel Finder](https://www.gov.uk/government/collections/fuel-finder).
