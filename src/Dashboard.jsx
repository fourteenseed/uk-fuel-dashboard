import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./styles.css";

const FALLBACK_PRICES = {
  latest: { date: "2026-07-27", petrol: 156.13, diesel: 173.97 },
  previous: { date: "2026-07-20", petrol: 152.29, diesel: 167.08 },
  history: [
    { date: "2026-05-11", petrol: 156.81, diesel: 188.14 },
    { date: "2026-05-18", petrol: 157.39, diesel: 186.56 },
    { date: "2026-05-25", petrol: 158.78, diesel: 185.07 },
    { date: "2026-06-01", petrol: 158.74, diesel: 184.11 },
    { date: "2026-06-08", petrol: 157.95, diesel: 181.79 },
    { date: "2026-06-15", petrol: 155.54, diesel: 176.71 },
    { date: "2026-06-22", petrol: 153.26, diesel: 172.47 },
    { date: "2026-06-29", petrol: 151.02, diesel: 167.12 },
    { date: "2026-07-06", petrol: 149.8, diesel: 164.77 },
    { date: "2026-07-13", petrol: 150.53, diesel: 164.52 },
    { date: "2026-07-20", petrol: 152.29, diesel: 167.08 },
    { date: "2026-07-27", petrol: 156.13, diesel: 173.97 },
  ],
  sourceUrl: "https://www.gov.uk/government/statistics/weekly-road-fuel-prices",
};

const FALLBACK_NEWS = [
  {
    title: "Summer holiday fuel costs rise as petrol climbs again",
    source: "The AA",
    date: "2026-07-29T00:00:00Z",
    url: "https://www.theaa.com/about-us/newsroom/summer-holiday-fuel-costs-rise",
  },
  {
    title: "Fuel prices rise as oil-market disruption returns",
    source: "MoneyWeek",
    date: "2026-07-27T00:00:00Z",
    url: "https://moneyweek.com/personal-finance/will-petrol-prices-rise",
  },
  {
    title: "Latest official weekly road fuel prices published",
    source: "GOV.UK",
    date: "2026-07-28T08:30:00Z",
    url: "https://www.gov.uk/government/statistics/weekly-road-fuel-prices",
  },
];

const LINKS = [
  {
    eyebrow: "Live comparisons",
    title: "GOV.UK Fuel Finder",
    body: "Search the government service directly for nearby forecourt prices.",
    url: "https://www.fuel-finder.service.gov.uk/",
  },
  {
    eyebrow: "Official averages",
    title: "Weekly road fuel prices",
    body: "The national petrol and diesel series, published by DESNZ each week.",
    url: "https://www.gov.uk/government/statistics/weekly-road-fuel-prices",
  },
  {
    eyebrow: "Driver context",
    title: "RAC Fuel Watch",
    body: "Commentary on pump-price movements and retailer margins.",
    url: "https://www.rac.co.uk/drive/advice/fuel-watch/",
  },
];

const formatDate = (value, options = {}) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: options.year ? "numeric" : undefined,
  }).format(new Date(value));

const formatChartDate = (value) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(
    new Date(`${value}T12:00:00Z`),
  );

const postcodePattern = /^(GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i;

function PriceChange({ current, previous }) {
  const change = Number((current - previous).toFixed(2));
  const direction = change > 0 ? "up" : change < 0 ? "down" : "flat";

  return (
    <span className={`price-change price-change--${direction}`}>
      {direction === "flat" ? (
        <>No change <span>on last week</span></>
      ) : (
        <>{direction === "up" ? "↑" : "↓"} {Math.abs(change).toFixed(2)}p <span>on last week</span></>
      )}
    </span>
  );
}

function FuelSearch() {
  const [postcode, setPostcode] = useState("");
  const [submittedPostcode, setSubmittedPostcode] = useState("");
  const [error, setError] = useState("");
  const [locationState, setLocationState] = useState("idle");

  const runSearch = (value = postcode) => {
    const clean = value.trim().toUpperCase();
    if (!postcodePattern.test(clean)) {
      setError("Enter a full UK postcode, for example TR13 8NN.");
      return;
    }

    setError("");
    setPostcode(clean);
    setSubmittedPostcode(clean.replace(/\s+/g, ""));
  };

  const useLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not available in this browser. Try a postcode instead.");
      return;
    }

    setError("");
    setLocationState("locating");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          setLocationState("postcode");
          const params = new URLSearchParams({
            lon: String(coords.longitude),
            lat: String(coords.latitude),
            limit: "1",
          });
          const response = await fetch(`https://api.postcodes.io/postcodes?${params}`);
          if (!response.ok) throw new Error("Postcode lookup failed");
          const data = await response.json();
          const nearestPostcode = data?.result?.[0]?.postcode;
          if (!nearestPostcode) throw new Error("No nearby postcode found");
          setPostcode(nearestPostcode);
          runSearch(nearestPostcode);
          setLocationState("idle");
        } catch {
          setLocationState("idle");
          setError("That location didn’t return a nearby postcode. Try entering one instead.");
        }
      },
      (locationError) => {
        setLocationState("idle");
        if (locationError.code === locationError.PERMISSION_DENIED) {
          setError("Location permission was declined. You can still search by postcode.");
        } else {
          setError("Your browser couldn’t share a location. Try entering a postcode instead.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  const locationLabel =
    locationState === "locating"
      ? "Finding you…"
      : locationState === "postcode"
        ? "Matching postcode…"
        : "Use my current location";

  const iframeSrc = submittedPostcode
    ? `https://checkfuelprices.co.uk/widget/embed?postcode=${encodeURIComponent(submittedPostcode)}&theme=dark&sort=price_low&radius=10&limit=10&search=false&filters=true`
    : "";

  return (
    <section className="search-card" aria-labelledby="search-title">
      <div className="search-card__intro">
        <p className="eyebrow">Live local prices</p>
        <h2 id="search-title">What are prices like near you?</h2>
        <p>Search a postcode, or let your browser find the nearest one. The cheapest prices come first.</p>
      </div>

      <form
        className="search-form"
        onSubmit={(event) => {
          event.preventDefault();
          runSearch();
        }}
        noValidate
      >
        <label htmlFor="postcode">UK postcode</label>
        <div className="search-form__row">
          <input
            id="postcode"
            name="postcode"
            type="text"
            value={postcode}
            onChange={(event) => setPostcode(event.target.value.toUpperCase())}
            placeholder="e.g. TR13 8NN"
            autoComplete="postal-code"
            inputMode="text"
            aria-describedby={error ? "postcode-error" : "postcode-help"}
            aria-invalid={Boolean(error)}
          />
          <button className="button button--primary" type="submit">Find fuel</button>
        </div>
        <div className="search-form__divider"><span>or</span></div>
        <button
          className="button button--location"
          type="button"
          onClick={useLocation}
          disabled={locationState !== "idle"}
        >
          <span className="location-mark" aria-hidden="true">◎</span>
          {locationLabel}
        </button>
        {error ? (
          <p className="form-message form-message--error" id="postcode-error" role="alert">{error}</p>
        ) : (
          <p className="form-message" id="postcode-help">
            If you choose location, it is used once to find a nearby postcode and is not stored by this site.
          </p>
        )}
      </form>

      {iframeSrc ? (
        <div className="results" aria-live="polite">
          <div className="results__header">
            <div>
              <p className="eyebrow">Cheapest first</p>
              <h3>Fuel near {postcode}</h3>
            </div>
            <button className="text-button" type="button" onClick={() => setSubmittedPostcode("")}>Change search</button>
          </div>
          <div className="results__frame">
            <iframe src={iframeSrc} title={`Fuel prices near ${postcode}`} loading="lazy" />
          </div>
        </div>
      ) : (
        <div className="search-card__promise" aria-hidden="true">
          <span>Nearby stations</span>
          <span>Current pump prices</span>
          <span>Cheapest first</span>
        </div>
      )}
    </section>
  );
}

function NationalPrices({ data }) {
  const { latest, previous, history, sourceUrl } = data;
  const chartData = useMemo(
    () => history.map((point) => ({ ...point, label: formatChartDate(point.date) })),
    [history],
  );

  return (
    <section className="section national-section" aria-labelledby="national-title">
      <div className="section-heading section-heading--split">
        <div>
          <p className="eyebrow">The national picture</p>
          <h2 id="national-title">UK average pump prices</h2>
        </div>
        <p className="source-note">
          Week of {formatDate(`${latest.date}T12:00:00Z`, { year: true })}<br />
          <a href={sourceUrl} target="_blank" rel="noreferrer">Official DESNZ data ↗</a>
        </p>
      </div>

      <div className="national-grid">
        <div className="price-cards">
          <article className="price-card price-card--petrol">
            <div className="price-card__top">
              <span className="fuel-dot" />
              <span>Unleaded petrol</span>
            </div>
            <div className="price-card__value">{latest.petrol.toFixed(2)}<small>p/l</small></div>
            <PriceChange current={latest.petrol} previous={previous.petrol} />
          </article>
          <article className="price-card price-card--diesel">
            <div className="price-card__top">
              <span className="fuel-dot" />
              <span>Diesel</span>
            </div>
            <div className="price-card__value">{latest.diesel.toFixed(2)}<small>p/l</small></div>
            <PriceChange current={latest.diesel} previous={previous.diesel} />
          </article>
        </div>

        <div className="chart-card">
          <div className="chart-card__heading">
            <span>Last 12 weeks</span>
            <div className="legend"><span className="legend__petrol">Petrol</span><span className="legend__diesel">Diesel</span></div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#d8d7cf" strokeDasharray="3 5" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6b6c66", fontSize: 11 }} minTickGap={24} />
                <YAxis domain={["dataMin - 4", "dataMax + 4"]} axisLine={false} tickLine={false} tick={{ fill: "#6b6c66", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#171b18", border: 0, borderRadius: 10, color: "#fff" }}
                  labelStyle={{ color: "#bfc8bd", marginBottom: 5 }}
                  formatter={(value, name) => [`${Number(value).toFixed(2)}p/l`, name === "petrol" ? "Petrol" : "Diesel"]}
                />
                <Line dataKey="petrol" type="monotone" stroke="#176b4a" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Line dataKey="diesel" type="monotone" stroke="#df7c3b" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <p className="fine-print">The national average is a useful benchmark. The postcode search shows what individual forecourts have reported.</p>
    </section>
  );
}

function FuelNews({ items, isLive }) {
  return (
    <section className="section" aria-labelledby="news-title">
      <div className="section-heading section-heading--split">
        <div>
          <p className="eyebrow">UK fuel news</p>
          <h2 id="news-title">What’s moving at the pump</h2>
        </div>
        <span className="feed-status"><i />{isLive ? "Feed refreshed hourly" : "Latest reviewed headlines"}</span>
      </div>

      <div className="news-list">
        {items.slice(0, 6).map((item) => (
          <a className="news-item" href={item.url} target="_blank" rel="noreferrer" key={`${item.url}-${item.date}`}>
            <div className="news-item__meta">
              <span>{item.source}</span>
              <time dateTime={item.date}>{formatDate(item.date)}</time>
            </div>
            <h3>{item.title}</h3>
            <span className="news-item__arrow" aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function UsefulLinks() {
  return (
    <section className="section" aria-labelledby="links-title">
      <div className="section-heading">
        <p className="eyebrow">Useful sources</p>
        <h2 id="links-title">Go straight to the data</h2>
      </div>
      <div className="link-grid">
        {LINKS.map((link) => (
          <a href={link.url} target="_blank" rel="noreferrer" className="link-card" key={link.title}>
            <p>{link.eyebrow}</p>
            <h3>{link.title}</h3>
            <span>{link.body}</span>
            <strong>Open source ↗</strong>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function UKFuelTracker() {
  const [priceData, setPriceData] = useState(FALLBACK_PRICES);
  const [news, setNews] = useState(FALLBACK_NEWS);
  const [newsIsLive, setNewsIsLive] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/national-prices", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Price feed unavailable");
        return response.json();
      })
      .then((data) => setPriceData(data))
      .catch(() => {});

    fetch("/api/news", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("News feed unavailable");
        return response.json();
      })
      .then((data) => {
        if (data.items?.length) {
          setNews(data.items);
          setNewsIsLive(true);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="UK Fuel Tracker home">
          <span className="brand__mark">UK</span>
          <span>Fuel Tracker</span>
        </a>
        <a className="header-link" href="#news-title">Fuel news</a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__copy">
            <div className="live-label"><span /> Local prices updated throughout the day</div>
            <h1>Find cheaper fuel <em>before you set off.</em></h1>
            <p>Compare petrol and diesel prices around any UK postcode. Or use your current location.</p>
          </div>
          <div className="hero__aside" aria-label="About this tracker">
            <span>Why this exists</span>
            <p>I built this over an evening when fuel prices suddenly started climbing. The useful bit is still the same: find the cheapest nearby.</p>
          </div>
        </section>

        <FuelSearch />
        <NationalPrices data={priceData} />
        <FuelNews items={news} isLive={newsIsLive} />
        <UsefulLinks />
      </main>

      <footer className="site-footer">
        <div>
          <strong>UK Fuel Tracker</strong>
          <p>Local prices via CheckFuelPrices and the GOV.UK Fuel Finder data service. National averages from DESNZ.</p>
        </div>
        <div className="site-footer__right">
          <a href="https://fourteenseed.com" target="_blank" rel="noreferrer">A Fourteen Seed side project ↗</a>
          <span>Prices can change at any time. Check the pump before filling.</span>
        </div>
      </footer>
    </div>
  );
}
