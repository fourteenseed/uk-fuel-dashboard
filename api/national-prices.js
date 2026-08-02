const GOV_CONTENT_URL = "https://www.gov.uk/api/content/government/statistics/weekly-road-fuel-prices";
const GOV_PAGE_URL = "https://www.gov.uk/government/statistics/weekly-road-fuel-prices";

const parseRows = (csv) =>
  csv
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [ukDate, petrol, diesel] = line.split(",");
      const [day, month, year] = ukDate.split("/");
      return {
        date: `${year}-${month}-${day}`,
        petrol: Number(petrol),
        diesel: Number(diesel),
      };
    })
    .filter((row) => row.date && Number.isFinite(row.petrol) && Number.isFinite(row.diesel));

export default async function handler(_req, res) {
  try {
    const contentResponse = await fetch(GOV_CONTENT_URL, {
      headers: { "User-Agent": "UKFuelTracker/2.0 (+https://ukfueltracker.fourteenseed.com)" },
    });
    if (!contentResponse.ok) throw new Error(`GOV.UK content request failed: ${contentResponse.status}`);

    const content = await contentResponse.json();
    const attachment = content?.details?.attachments?.find(
      (item) => item.content_type === "text/csv" && /2018/i.test(item.title || ""),
    );
    if (!attachment?.url) throw new Error("Weekly price CSV was not found");

    const csvResponse = await fetch(attachment.url, {
      headers: { "User-Agent": "UKFuelTracker/2.0 (+https://ukfueltracker.fourteenseed.com)" },
    });
    if (!csvResponse.ok) throw new Error(`GOV.UK CSV request failed: ${csvResponse.status}`);

    const rows = parseRows(await csvResponse.text());
    if (rows.length < 2) throw new Error("Weekly price CSV did not contain enough data");

    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");
    return res.status(200).json({
      latest: rows.at(-1),
      previous: rows.at(-2),
      history: rows.slice(-12),
      sourceUrl: GOV_PAGE_URL,
      updatedAt: content.public_updated_at,
    });
  } catch (error) {
    return res.status(502).json({ error: "Official fuel-price data is temporarily unavailable", detail: error.message });
  }
}
