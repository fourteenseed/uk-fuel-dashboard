const https = require("https");

module.exports = async function handler(req, res) {
  const { lat, lng, fuel, radius, limit, sort } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "lat and lng are required" });
  }

  const params = new URLSearchParams({
    lat,
    lng,
    fuel: fuel || "E10",
    radius: radius || "5",
    limit: limit || "10",
    sort: sort || "price_low",
  });

  const url = `https://checkfuelprices.co.uk/api/widget/stations?${params.toString()}`;

  return new Promise((resolve) => {
    https.get(url, { headers: { "User-Agent": "UKFuelTracker/1.0" } }, (response) => {
      let data = "";
      response.on("data", (chunk) => { data += chunk; });
      response.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
          res.status(200).json(parsed);
        } catch (e) {
          res.status(500).json({ error: "Invalid response from fuel API", raw: data.slice(0, 200) });
        }
        resolve();
      });
    }).on("error", (err) => {
      res.status(500).json({ error: "Failed to connect to fuel API", detail: err.message });
      resolve();
    });
  });
};
