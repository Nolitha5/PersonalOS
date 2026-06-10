// Vercel serverless function — returns list of past brief dates from Notion DB

const DB_ID = process.env.NOTION_DB_MORNING_BRIEF || "41c3504a5bdb4f2296301bc07a20072a";

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();

  const token = process.env.NOTION_TOKEN;
  if (!token) return res.status(500).json({ error: "NOTION_TOKEN env var not set." });

  try {
    const r = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sorts: [{ property: "Date", direction: "descending" }],
        page_size: 30,
      }),
    });
    if (!r.ok) throw new Error(`Notion API error: ${r.status}`);
    const data = await r.json();
    const dates = data.results
      .map((p) => p.properties?.Date?.date?.start)
      .filter(Boolean);
    return res.status(200).json(dates);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
