const FEED_URL = "https://news.google.com/rss/search?q=UK%20petrol%20diesel%20fuel%20prices%20when%3A14d&hl=en-GB&gl=GB&ceid=GB%3Aen";

const decodeXml = (value = "") =>
  value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

const readTag = (block, tag) => {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decodeXml(match?.[1] || "");
};

const toIsoDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

const parseItems = (xml) =>
  [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .map((match) => {
      const block = match[1];
      const source = readTag(block, "source") || "UK fuel news";
      const rawTitle = readTag(block, "title");
      const title = rawTitle.endsWith(` - ${source}`) ? rawTitle.slice(0, -(` - ${source}`.length)) : rawTitle;
      return {
        title,
        source,
        date: toIsoDate(readTag(block, "pubDate")),
        url: readTag(block, "link"),
      };
    })
    .filter((item) => item.title && item.url.startsWith("https://") && item.date)
    .slice(0, 8);

export default async function handler(_req, res) {
  try {
    const response = await fetch(FEED_URL, {
      headers: { "User-Agent": "UKFuelTracker/2.0 (+https://ukfueltracker.fourteenseed.com)" },
    });
    if (!response.ok) throw new Error(`News feed request failed: ${response.status}`);

    const items = parseItems(await response.text());
    if (!items.length) throw new Error("News feed returned no usable headlines");

    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=21600");
    return res.status(200).json({ items, fetchedAt: new Date().toISOString() });
  } catch (error) {
    return res.status(502).json({ error: "Fuel news is temporarily unavailable", detail: error.message });
  }
}
