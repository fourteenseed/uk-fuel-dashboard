export default async function handler(req, res) {
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

  try {
    const response = await fetch(
      `https://checkfuelprices.co.uk/api/widget/stations?${params.toString()}`
    );
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch fuel prices" });
  }
}
