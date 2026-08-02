# UK Fuel Tracker

A focused UK fuel-price finder with postcode search, current-location lookup, live local results, automatically refreshed national averages, and a rolling UK fuel-news feed.

## Live APIs used (all free, no keys)

- **postcodes.io** converts browser location to the nearest UK postcode
- **CheckFuelPrices** provides local forecourt prices from the GOV.UK Fuel Finder scheme
- **DESNZ / GOV.UK** provides official weekly national petrol and diesel averages
- **Google News RSS** supplies rolling UK fuel-price headlines, with reviewed fallbacks

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
4. Vercel auto-detects Vite. Just click Deploy.
5. Done. You get a `.vercel.app` URL immediately

### Custom domain

In Vercel dashboard → Settings → Domains → add your domain (e.g. `fuel.fourteenseed.com`).
Point a CNAME record to `cname.vercel-dns.com` in your DNS.

## Data sources

| Data | Source | Update frequency |
|------|--------|-----------------|
| Local fuel prices | GOV.UK Fuel Finder via CheckFuelPrices | Throughout the day |
| National averages | DESNZ weekly road fuel prices | Weekly |
| UK fuel headlines | Google News RSS | Hourly cache |

## Attribution

Fuel price data from [checkfuelprices.co.uk](https://checkfuelprices.co.uk) via [GOV.UK Fuel Finder](https://www.gov.uk/government/collections/fuel-finder).
