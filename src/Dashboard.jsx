import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from "recharts";

// ─── STATIC DATA ────────────────────────────────────────────────────────
const PRODUCTION_VS_CONSUMPTION = [
  { year: "2015", production: 47.6, consumption: 72.8 },
  { year: "2016", production: 48.1, consumption: 73.2 },
  { year: "2017", production: 47.2, consumption: 74.1 },
  { year: "2018", production: 46.8, consumption: 73.9 },
  { year: "2019", production: 44.3, consumption: 72.6 },
  { year: "2020", production: 38.9, consumption: 58.1 },
  { year: "2021", production: 38.6, consumption: 64.8 },
  { year: "2022", production: 36.4, consumption: 67.2 },
  { year: "2023", production: 33.5, consumption: 59.8 },
  { year: "2024", production: 30.4, consumption: 61.0 },
];

const BRENT_CRUDE_2026 = [
  { week: "Jan W1", price: 76.2 }, { week: "Jan W2", price: 78.5 },
  { week: "Jan W3", price: 77.1 }, { week: "Jan W4", price: 79.8 },
  { week: "Feb W1", price: 78.3 }, { week: "Feb W2", price: 76.9 },
  { week: "Feb W3", price: 75.4 }, { week: "Feb W4", price: 80.2 },
  { week: "Mar W1", price: 95.6 }, { week: "Mar W2", price: 104.3 },
  { week: "Mar W3", price: 112.7 }, { week: "Mar W4", price: 108.9 },
];

const PUMP_PRICES = [
  { month: "Oct", petrol: 136.2, diesel: 141.8 },
  { month: "Nov", petrol: 134.8, diesel: 140.3 },
  { month: "Dec", petrol: 135.1, diesel: 139.7 },
  { month: "Jan", petrol: 136.9, diesel: 141.2 },
  { month: "Feb", petrol: 138.4, diesel: 143.6 },
  { month: "Mar", petrol: 152.1, diesel: 181.1 },
];

const STOCK_LEVELS = [
  { month: "Oct", crude: 6.2, products: 8.1 },
  { month: "Nov", crude: 5.9, products: 7.8 },
  { month: "Dec", crude: 5.7, products: 7.5 },
  { month: "Jan", crude: 5.5, products: 7.2 },
  { month: "Feb", crude: 5.3, products: 6.9 },
  { month: "Mar", crude: 4.8, products: 6.1 },
];

const SUPPLY_MIX = [
  { name: "Domestic Production", value: 30.4, color: "#D4A843" },
  { name: "Pipeline Imports", value: 18.2, color: "#8B6914" },
  { name: "Tanker Imports", value: 12.4, color: "#5C4A1E" },
];

const NEWS_ITEMS = [
  { date: "30 Mar", title: "Diesel-petrol gap hits 30p, widest in 20+ years", source: "Fleet News", url: "https://www.fleetnews.co.uk/news/disparity-between-diesel-and-petrol-prices-at-highest-in-20-plus-years", tag: "prices" },
  { date: "27 Mar", title: "Petrol passes 150p/litre ahead of Easter weekend", source: "Carwow", url: "https://www.carwow.co.uk/news/10377/fuel-prices-rising-how-to-save-money", tag: "prices" },
  { date: "24 Mar", title: "Diesel up 8.1p in single week, three consecutive record rises", source: "CheckFuelPrices", url: "https://checkfuelprices.co.uk/news/fuel-price-check-analysis-week-of-march-24-2026", tag: "analysis" },
  { date: "20 Mar", title: "IEA commitments reach 426M barrels, exceeding 400M target", source: "Rigzone", url: "https://www.rigzone.com/news/iea_oil_release_set_to_exceed_agreed_volume-20-mar-2026-183255-article/", tag: "reserves" },
  { date: "17 Mar", title: "UK pump prices see largest weekly rise since 2022 energy crisis", source: "Bloomberg", url: "https://www.bloomberg.com/news/articles/2026-03-17/uk-petrol-prices-surge-to-highest-in-1-1-2-years-amid-iran-war", tag: "prices" },
  { date: "11 Mar", title: "IEA launches largest ever emergency oil stock release: 400M barrels", source: "IEA", url: "https://www.iea.org/news/iea-member-countries-to-carry-out-largest-ever-oil-stock-release-amid-market-disruptions-from-middle-east-conflict", tag: "reserves" },
  { date: "11 Mar", title: "UK commits 13.5M barrels to IEA coordinated release", source: "Al Jazeera", url: "https://www.aljazeera.com/news/2026/3/11/iea-proposes-release-of-400m-barrels-of-oil-from-strategic-reserves", tag: "reserves" },
  { date: "28 Feb", title: "US and Israel launch strikes on Iran; Strait of Hormuz effectively closed", source: "Multiple", url: "https://www.iea.org/reports/oil-market-report-march-2026", tag: "crisis" },
];

const RESOURCES = [
  { name: "GOV.UK Fuel Finder", desc: "Official live pump prices", url: "https://www.fuel-finder.service.gov.uk/" },
  { name: "RAC Fuel Watch", desc: "Daily averages & trends", url: "https://www.rac.co.uk/drive/advice/fuel-watch/" },
  { name: "CheckFuelPrices", desc: "Cheapest near you", url: "https://checkfuelprices.co.uk/" },
  { name: "DESNZ Energy Trends", desc: "Official stocks & production", url: "https://www.gov.uk/government/statistics/oil-and-oil-products-section-3-energy-trends" },
  { name: "IEA Oil Stocks", desc: "Global reserve tracker", url: "https://www.iea.org/data-and-statistics/data-tools/oil-stocks-of-iea-countries" },
  { name: "IEA 2026 Crisis Tracker", desc: "Policy responses by country", url: "https://www.iea.org/data-and-statistics/data-tools/2026-energy-crisis-policy-response-tracker" },
];

// ─── SHARED COMPONENTS ──────────────────────────────────────────────────

const GaugeChart = ({ value, max, label, unit, color }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 150, height: 85, margin: "0 auto" }}>
        <svg viewBox="0 0 160 90" width="150" height="85">
          <path d="M 10 85 A 70 70 0 0 1 150 85" fill="none" stroke="#1E1E1E" strokeWidth="12" strokeLinecap="round" />
          <path d="M 10 85 A 70 70 0 0 1 150 85" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${pct * 2.2} 999`} style={{ filter: `drop-shadow(0 0 6px ${color}66)` }} />
        </svg>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
          <span style={{ fontSize: 26, fontWeight: 700, color, fontFamily: "var(--mono)" }}>{value}</span>
          <span style={{ fontSize: 12, color: "#B0A898", marginLeft: 2 }}>{unit}</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#9A9080", marginTop: 6 }}>{label}</div>
    </div>
  );
};

const MetricCard = ({ label, value, unit, change, changeLabel }) => {
  const isPos = change && change > 0;
  const isNeg = change && change < 0;
  return (
    <div style={{ background: "#131313", borderRadius: 8, padding: "14px 16px", border: "1px solid #252525", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 11, color: "#908878", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: "#F0E8D8", fontFamily: "var(--mono)", letterSpacing: "-1px" }}>{value}</span>
        <span style={{ fontSize: 12, color: "#908878" }}>{unit}</span>
      </div>
      {change !== undefined && (
        <div style={{ fontSize: 11, marginTop: 5, color: isPos ? "#E84C3D" : isNeg ? "#27AE60" : "#908878", display: "flex", alignItems: "center", gap: 3 }}>
          <span>{isPos ? "▲" : isNeg ? "▼" : "─"}</span><span>{Math.abs(change)}{changeLabel || ""}</span>
        </div>
      )}
    </div>
  );
};

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 14 }}>
    <h2 style={{ fontSize: 13, fontWeight: 600, color: "#D4A843", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0, fontFamily: "var(--mono)" }}>{children}</h2>
    {sub && <div style={{ fontSize: 12, color: "#8A7E6E", marginTop: 4, lineHeight: 1.4 }}>{sub}</div>}
  </div>
);

const ChartTooltip = ({ active, payload, label, suffix }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1A1A1A", border: "1px solid #383838", borderRadius: 6, padding: "8px 12px", fontSize: 13 }}>
      <div style={{ color: "#B0A898", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#D4A843", fontFamily: "var(--mono)" }}>{p.name}: {p.value}{suffix || ""}</div>
      ))}
    </div>
  );
};

const Panel = ({ children, style }) => (
  <div style={{ background: "#131313", borderRadius: 12, border: "1px solid #222", padding: "20px 22px", marginBottom: 20, ...style }}>{children}</div>
);

// ─── FUEL SEARCH ────────────────────────────────────────────────────────

function FuelSearch() {
  const [postcode, setPostcode] = useState("");
  const [fuelType, setFuelType] = useState("E10");
  const [radius, setRadius] = useState(5);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [lastCoords, setLastCoords] = useState(null);

  const fetchStations = async (lat, lng, fuel, rad, retries = 2) => {
    const url = `https://checkfuelprices.co.uk/api/widget/stations?lat=${lat}&lng=${lng}&fuel=${fuel}&radius=${rad}&limit=10&sort=price_low`;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url);
        const raw = await res.json();
        const data = Array.isArray(raw) ? raw
          : Array.isArray(raw?.stations) ? raw.stations
          : Array.isArray(raw?.data) ? raw.data
          : Array.isArray(raw?.results) ? raw.results
          : null;
        if (data && data.length > 0) return data;
        if (attempt < retries) { await new Promise(r => setTimeout(r, 500)); continue; }
        return null;
      } catch (err) {
        if (attempt < retries) { await new Promise(r => setTimeout(r, 500)); continue; }
        throw err;
      }
    }
    return null;
  };

  const search = async (overrideFuel, overrideRadius) => {
    const fuel = overrideFuel || fuelType;
    const rad = overrideRadius || radius;
    if (!postcode.trim()) return;
    setLoading(true); setError(null); setStations([]); setSearched(true);

    try {
      let lat, lng;

      // Reuse cached coords if we already geocoded this postcode
      if (lastCoords && lastCoords.postcode === postcode.replace(/\s+/g, "").toUpperCase()) {
        lat = lastCoords.lat;
        lng = lastCoords.lng;
      } else {
        const clean = postcode.replace(/\s+/g, "").toUpperCase();
        const geoRes = await fetch(`https://api.postcodes.io/postcodes/${clean}`);
        const geoData = await geoRes.json();
        if (geoData.status !== 200 || !geoData.result) { setError("Couldn't find that postcode. Check it and try again."); setLoading(false); return; }
        lat = geoData.result.latitude;
        lng = geoData.result.longitude;
        setAreaName(geoData.result.admin_district || "");
        setLastCoords({ postcode: clean, lat, lng });
      }

      const stationsData = await fetchStations(lat, lng, fuel, rad);

      if (stationsData) {
        setStations(stationsData);
      } else {
        setError(`No stations found within ${rad} miles. Try a larger radius, or search at checkfuelprices.co.uk directly.`);
        console.log("API response:", raw);
      }
    } catch (err) {
      console.error("Fuel search error:", err);
      setError("Couldn't connect to the fuel price service. This may be a cross-origin restriction. Try checkfuelprices.co.uk directly.");
    }
    setLoading(false);
  };

  const changeFuel = (ft) => {
    setFuelType(ft);
    if (searched && postcode.trim()) search(ft, radius);
  };

  const changeRadius = (r) => {
    setRadius(r);
    if (searched && postcode.trim()) search(fuelType, r);
  };

  const fuelLabel = { E10: "Petrol (E10)", E5: "Super (E5)", B7: "Diesel (B7)", SDV: "Super Diesel" };
  const fuelColors = { E10: "#4A9EDE", E5: "#9B59B6", B7: "#E84C3D", SDV: "#E67E22" };
  const fc = fuelColors[fuelType];

  return (
    <Panel>
      <SectionTitle sub="Live from GOV.UK Fuel Finder via CheckFuelPrices API + postcodes.io">Find Cheapest Fuel Near You</SectionTitle>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ flex: "1 1 150px" }}>
          <input type="text" value={postcode} onChange={e => setPostcode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && search()} placeholder="e.g. TR13 8NN"
            style={{ width: "100%", boxSizing: "border-box", background: "#0C0C0C", border: "1px solid #383838", borderRadius: 8, padding: "10px 14px", color: "#F0E8D8", fontSize: 15, fontFamily: "var(--mono)", letterSpacing: "0.05em", outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {["E10", "B7", "E5", "SDV"].map(ft => (
            <button key={ft} onClick={() => changeFuel(ft)} style={{
              background: fuelType === ft ? fuelColors[ft] + "22" : "#0C0C0C",
              border: `1px solid ${fuelType === ft ? fuelColors[ft] : "#383838"}`,
              borderRadius: 6, padding: "8px 10px", color: fuelType === ft ? fuelColors[ft] : "#908878",
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--mono)", transition: "all 0.15s",
            }}>{ft}</button>
          ))}
        </div>
        <select value={radius} onChange={e => changeRadius(Number(e.target.value))} style={{
          background: "#0C0C0C", border: "1px solid #383838", borderRadius: 8, padding: "8px 10px",
          color: "#F0E8D8", fontSize: 13, fontFamily: "var(--mono)", cursor: "pointer",
        }}>
          {[1, 3, 5, 10, 15, 25].map(r => <option key={r} value={r}>{r} mi</option>)}
        </select>
        <button onClick={search} disabled={loading} style={{
          background: loading ? "#383838" : "linear-gradient(135deg, #D4A843 0%, #B48830 100%)",
          border: "none", borderRadius: 8, padding: "10px 22px",
          color: loading ? "#908878" : "#0A0A0A", fontSize: 14, fontWeight: 700,
          cursor: loading ? "wait" : "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
        }}>{loading ? "Searching..." : "Search"}</button>
      </div>

      {error && (
        <div style={{ background: "#1F1210", border: "1px solid #6C3030", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#E08080", marginBottom: 12, lineHeight: 1.5 }}>
          {error}
          {searched && (
            <div style={{ marginTop: 8 }}>
              <a href={`https://checkfuelprices.co.uk/search?q=${postcode.replace(/\s+/g, "+")}`}
                target="_blank" rel="noopener noreferrer"
                style={{ color: "#D4A843", fontSize: 12 }}>
                Search directly on CheckFuelPrices →
              </a>
            </div>
          )}
        </div>
      )}

      {stations.length > 0 && (
        <>
          <div style={{ fontSize: 13, color: "#9A9080", marginBottom: 10 }}>
            Cheapest <span style={{ color: fc }}>{fuelLabel[fuelType]}</span> within {radius} mi of{" "}
            <span style={{ color: "#D4A843" }}>{postcode}</span>{areaName && ` (${areaName})`}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {stations.map((s, i) => {
              const price = s.prices?.[fuelType] ?? s.price ?? null;
              const name = s.brand ? `${s.brand}${s.name ? " " + s.name : ""}` : s.name || "Station";
              const dist = s.distance != null ? `${Number(s.distance).toFixed(1)} mi` : "";
              const isFirst = i === 0;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  background: isFirst ? `${fc}0A` : "#0E0E0E",
                  border: `1px solid ${isFirst ? fc + "40" : "#1E1E1E"}`, borderRadius: 8,
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", background: isFirst ? fc : "#1E1E1E",
                    color: isFirst ? "#0A0A0A" : "#908878", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", flexShrink: 0,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#F0E8D8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                    <div style={{ fontSize: 12, color: "#8A7E6E", marginTop: 2 }}>
                      {s.address || s.postcode || ""}{dist && <span style={{ marginLeft: 8, color: "#9A9080" }}>{dist}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: isFirst ? fc : "#F0E8D8", fontFamily: "var(--mono)" }}>
                      {price ? Number(price).toFixed(1) : "—"}
                    </span>
                    <span style={{ fontSize: 12, color: "#908878", marginLeft: 2 }}>p</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: "#6A6050", marginTop: 10 }}>
            Prices from <a href="https://checkfuelprices.co.uk" target="_blank" rel="noopener noreferrer" style={{ color: "#8A7E6E" }}>checkfuelprices.co.uk</a> via GOV.UK Fuel Finder open data
          </div>
        </>
      )}

      {!searched && stations.length === 0 && !error && (
        <div style={{ textAlign: "center", padding: "20px 16px", color: "#706858", fontSize: 13 }}>
          Enter a UK postcode to find the cheapest fuel near you.<br />Live prices from 4,000+ stations, updated every 30 minutes.
        </div>
      )}
    </Panel>
  );
}

// ─── NEWS & RESOURCES ───────────────────────────────────────────────────

function NewsAndResources() {
  const [showAll, setShowAll] = useState(false);
  const tagColors = { prices: "#4A9EDE", analysis: "#9B59B6", reserves: "#D4A843", crisis: "#E84C3D" };
  const displayed = showAll ? NEWS_ITEMS : NEWS_ITEMS.slice(0, 5);

  return (
    <>
      <Panel>
        <SectionTitle sub="Curated headlines on UK fuel supply, prices, and the current crisis">UK Fuel News</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {displayed.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 10px",
                borderRadius: 8, textDecoration: "none", transition: "background 0.15s",
                borderBottom: i < displayed.length - 1 ? "1px solid #1E1E1E" : "none",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#1A1A1A"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{
                fontSize: 11, color: "#706858", fontFamily: "var(--mono)", minWidth: 50, paddingTop: 2,
              }}>{item.date}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: "#E8DFD0", lineHeight: 1.45, fontWeight: 500 }}>{item.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{
                    fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--mono)",
                    color: tagColors[item.tag] || "#908878", background: (tagColors[item.tag] || "#908878") + "15",
                    padding: "2px 6px", borderRadius: 4,
                  }}>{item.tag}</span>
                  <span style={{ fontSize: 12, color: "#706858" }}>{item.source}</span>
                </div>
              </div>
              <div style={{ color: "#4A4030", fontSize: 16, paddingTop: 2 }}>→</div>
            </a>
          ))}
        </div>
        {NEWS_ITEMS.length > 5 && (
          <button onClick={() => setShowAll(!showAll)} style={{
            background: "none", border: "1px solid #2A2A2A", borderRadius: 6, padding: "8px 16px",
            color: "#9A9080", fontSize: 12, cursor: "pointer", marginTop: 10, width: "100%",
            fontFamily: "var(--mono)", transition: "all 0.15s",
          }}>
            {showAll ? "Show fewer" : `Show all ${NEWS_ITEMS.length} headlines`}
          </button>
        )}
      </Panel>

      <Panel>
        <SectionTitle sub="Bookmark these for checking prices and tracking the situation">Quick Links & Resources</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {RESOURCES.map((r, i) => (
            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{
              display: "block", padding: "14px 16px", background: "#0E0E0E", border: "1px solid #1E1E1E",
              borderRadius: 8, textDecoration: "none", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#D4A843"; e.currentTarget.style.background = "#161310"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1E1E1E"; e.currentTarget.style.background = "#0E0E0E"; }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: "#E8DFD0", marginBottom: 3 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: "#8A7E6E", lineHeight: 1.4 }}>{r.desc}</div>
            </a>
          ))}
        </div>
      </Panel>
    </>
  );
}

// ─── MAIN DASHBOARD ─────────────────────────────────────────────────────

export default function UKOilDashboard() {
  const importDep = ((61.0 - 30.4) / 61.0 * 100).toFixed(0);

  return (
    <div style={{ "--mono": "'JetBrains Mono', monospace", background: "#0A0A0A", color: "#E8DFD0", minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        input::placeholder { color: #706858; }
        select option { background: #0A0A0A; color: #E8DFD0; }
        * { box-sizing: border-box; }
        a:focus-visible { outline: 2px solid #D4A843; outline-offset: 2px; }
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #1E1E1E", padding: "20px 22px 16px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#D4A843", boxShadow: "0 0 8px #D4A84366", animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 11, color: "#D4A843", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Live Tracker</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "4px 0 2px", color: "#F5EDE0", letterSpacing: "-0.5px" }}>UK Oil &amp; Fuel Supply Intelligence</h1>
          <p style={{ fontSize: 13, color: "#8A7E6E", margin: 0 }}>Strategic reserves · Production · Prices · News · Local fuel search</p>

          <div style={{
            background: "linear-gradient(135deg, #2D1810 0%, #1A0F08 100%)",
            border: "1px solid #6C3A18", borderRadius: 8, padding: "10px 14px", marginTop: 14,
            display: "flex", alignItems: "center", gap: 10, fontSize: 13,
          }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
            <div style={{ lineHeight: 1.5 }}>
              <span style={{ color: "#E8A04C", fontWeight: 600 }}>IEA Emergency Release Active</span>
              <span style={{ color: "#A08060", marginLeft: 8 }}>
                426M barrel coordinated stock draw across 32 member nations. Largest in IEA history.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 22px", maxWidth: 920, margin: "0 auto" }}>

        {/* METRICS */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          <MetricCard label="Brent Crude" value="108.9" unit="$/bbl" change={28.7} changeLabel=" from Feb" />
          <MetricCard label="Petrol" value="152.1" unit="p/l" change={13.7} changeLabel="p MoM" />
          <MetricCard label="Diesel" value="181.1" unit="p/l" change={37.5} changeLabel="p MoM" />
          <MetricCard label="Import Gap" value={importDep} unit="%" change={2.1} changeLabel="pp YoY" />
        </div>

        {/* FUEL SEARCH */}
        <FuelSearch />

        {/* NEWS & RESOURCES */}
        <NewsAndResources />

        {/* STRATEGIC RESERVES */}
        <Panel>
          <SectionTitle sub="UK emergency oil stockholding, industry held, government regulated">Strategic Reserves</SectionTitle>
          <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 14, marginTop: 8 }}>
            <GaugeChart value={90} max={120} label="Days of Import Cover" unit="days" color="#D4A843" />
            <GaugeChart value={38} max={60} label="Crude Oil Stocks" unit="Mb" color="#C4963A" />
            <GaugeChart value={30} max={60} label="Refined Products" unit="Mb" color="#B48830" />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 14, paddingTop: 12, borderTop: "1px solid #1E1E1E" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#F0E8D8", fontFamily: "var(--mono)" }}>68</div>
              <div style={{ fontSize: 11, color: "#8A7E6E", textTransform: "uppercase" }}>Total (M barrels)</div>
            </div>
            <div style={{ width: 1, background: "#2A2A2A" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#27AE60", fontFamily: "var(--mono)" }}>✓</div>
              <div style={{ fontSize: 11, color: "#8A7E6E", textTransform: "uppercase" }}>IEA 90-Day Met</div>
            </div>
          </div>
        </Panel>

        {/* BRENT CRUDE */}
        <Panel>
          <SectionTitle sub="Weekly average, 2026 year to date">Brent Crude Oil Price</SectionTitle>
          <div style={{ width: "100%", height: 190 }}>
            <ResponsiveContainer>
              <AreaChart data={BRENT_CRUDE_2026} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="bG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A843" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#D4A843" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#706858" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#706858" }} axisLine={false} tickLine={false} domain={[60, 120]} />
                <Tooltip content={<ChartTooltip suffix=" $/bbl" />} />
                <Area type="monotone" dataKey="price" stroke="#D4A843" strokeWidth={2} fill="url(#bG)" name="Brent" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "#A08060" }}>
            <div style={{ width: 12, height: 2, background: "#E84C3D" }} />
            28 Feb: US/Israel strikes on Iran. Strait of Hormuz effectively closed.
          </div>
        </Panel>

        {/* PUMP PRICES */}
        <Panel>
          <SectionTitle sub="UK average forecourt price, pence per litre">Pump Prices</SectionTitle>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <LineChart data={PUMP_PRICES} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#706858" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#706858" }} axisLine={false} tickLine={false} domain={[125, 190]} />
                <Tooltip content={<ChartTooltip suffix=" p/l" />} />
                <Line type="monotone" dataKey="petrol" stroke="#4A9EDE" strokeWidth={2} dot={{ r: 3, fill: "#4A9EDE" }} name="Petrol" />
                <Line type="monotone" dataKey="diesel" stroke="#E84C3D" strokeWidth={2} dot={{ r: 3, fill: "#E84C3D" }} name="Diesel" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9A9080" }}>
              <div style={{ width: 10, height: 3, background: "#4A9EDE", borderRadius: 2 }} /> Petrol (E10)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9A9080" }}>
              <div style={{ width: 10, height: 3, background: "#E84C3D", borderRadius: 2 }} /> Diesel (B7)
            </div>
          </div>
        </Panel>

        {/* TWO COLUMN */}
        <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
          <Panel style={{ flex: "1 1 320px", marginBottom: 0 }}>
            <SectionTitle sub="Million tonnes, DESNZ ET 3.11">Inland Stock Levels</SectionTitle>
            <div style={{ width: "100%", height: 170 }}>
              <ResponsiveContainer>
                <BarChart data={STOCK_LEVELS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#706858" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#706858" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip suffix=" Mt" />} />
                  <Bar dataKey="crude" stackId="a" fill="#D4A843" name="Crude" />
                  <Bar dataKey="products" stackId="a" fill="#8B6914" name="Products" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel style={{ flex: "1 1 220px", marginBottom: 0 }}>
            <SectionTitle sub="2024 refinery input sources">Supply Mix</SectionTitle>
            <div style={{ width: "100%", height: 150, display: "flex", justifyContent: "center" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={SUPPLY_MIX} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" stroke="#0A0A0A" strokeWidth={2}>
                    {SUPPLY_MIX.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip suffix=" Mt" />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              {SUPPLY_MIX.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                  <span style={{ color: "#9A9080" }}>{item.name}</span>
                  <span style={{ color: "#D4A843", fontFamily: "var(--mono)", marginLeft: "auto" }}>{item.value} Mt</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* PRODUCTION vs CONSUMPTION */}
        <Panel>
          <SectionTitle sub="Million tonnes per year, the widening import gap">Production vs Consumption</SectionTitle>
          <div style={{ width: "100%", height: 190 }}>
            <ResponsiveContainer>
              <AreaChart data={PRODUCTION_VS_CONSUMPTION} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E84C3D" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#E84C3D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#706858" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#706858" }} axisLine={false} tickLine={false} domain={[20, 80]} />
                <Tooltip content={<ChartTooltip suffix=" Mt" />} />
                <Area type="monotone" dataKey="consumption" stroke="#E84C3D" strokeWidth={2} fill="url(#gG)" name="Consumption" dot={false} />
                <Area type="monotone" dataKey="production" stroke="#D4A843" strokeWidth={2} fill="none" name="Production" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9A9080" }}>
              <div style={{ width: 10, height: 3, background: "#D4A843", borderRadius: 2 }} /> Domestic Production
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9A9080" }}>
              <div style={{ width: 10, height: 3, background: "#E84C3D", borderRadius: 2 }} /> Total Consumption
            </div>
          </div>
        </Panel>

        {/* KEY CONTEXT */}
        <Panel>
          <SectionTitle>Key Context</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {[
              { stat: "~90%", label: "of North Sea oil and gas already extracted" },
              { stat: "~3 yrs", label: "of proven reserves at current consumption" },
              { stat: "50%", label: "of demand met by imports (and rising)" },
              { stat: "52.95p", label: "fuel duty per litre (frozen since 2022 cut)" },
              { stat: "6", label: "UK refineries operational (down from 9)" },
              { stat: "#29", label: "UK global rank for oil/gas production" },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#D4A843", fontFamily: "var(--mono)", letterSpacing: "-0.5px" }}>{item.stat}</div>
                <div style={{ fontSize: 13, color: "#8A7E6E", marginTop: 3, lineHeight: 1.45 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* FOOTER */}
        <div style={{ borderTop: "1px solid #1E1E1E", paddingTop: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#6A6050", lineHeight: 1.7 }}>
            <strong style={{ color: "#8A7E6E" }}>Sources:</strong> DESNZ Energy Trends (ET 3.10, 3.11, 3.12, 3.13) · NSTA Reserves and Resources Report ·
            IEA Oil Stocks Data Tool · GOV.UK Fuel Finder open data via{" "}
            <a href="https://checkfuelprices.co.uk" target="_blank" rel="noopener noreferrer" style={{ color: "#8A7E6E" }}>CheckFuelPrices</a> ·{" "}
            <a href="https://postcodes.io" target="_blank" rel="noopener noreferrer" style={{ color: "#8A7E6E" }}>postcodes.io</a> ·
            DUKES 2025 Chapter 3. Local fuel prices are live. National data is monthly (latest available).
          </div>
          <div style={{ fontSize: 12, color: "#4A4030", marginTop: 8 }}>
            Built with publicly available UK government data. Not investment advice. March 2026.
          </div>
        </div>
      </div>
    </div>
  );
}
