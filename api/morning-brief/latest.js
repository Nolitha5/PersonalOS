// Vercel serverless function — reads latest brief from Notion Daily Briefs DB
// Requires env var: NOTION_TOKEN

const DB_ID = process.env.NOTION_DB_MORNING_BRIEF || "41c3504a5bdb4f2296301bc07a20072a";

async function queryNotion(dbId, token) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sorts: [{ property: "Date", direction: "descending" }],
      page_size: 1,
    }),
  });
  if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
  return res.json();
}

async function getPageContent(pageId, token) {
  const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

function extractText(richText) {
  return (richText || []).map((t) => t.plain_text).join("");
}

function blocksToSections(blocks) {
  const items = [];
  let currentSection = null;

  for (const block of blocks) {
    const type = block.type;
    if (type === "heading_2") {
      currentSection = extractText(block.heading_2.rich_text);
      continue;
    }
    if (type === "bulleted_list_item") {
      const text = extractText(block.bulleted_list_item.rich_text);
      const di = text.indexOf(" — ");
      const ci = text.indexOf(": ");
      let tag = "fyi";
      if (currentSection === "Urgent") tag = "urgent";
      else if (currentSection === "Today's Calendar") tag = "calendar";
      else if (currentSection === "Key Context") tag = "context";

      if (tag === "fyi" && ci > -1) {
        items.push({ tag, title: text.slice(0, ci), body: text.slice(ci + 2) });
      } else if (di > -1) {
        items.push({ tag, title: text.slice(0, di), body: text.slice(di + 3) });
      } else {
        items.push({ tag, title: text, body: "" });
      }
    }
    if (type === "paragraph" && currentSection === "Today's Calendar") {
      const text = extractText(block.paragraph.rich_text);
      if (text.trim()) items.push({ tag: "calendar", title: "Today's Calendar", body: text });
    }
  }
  return items;
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "NOTION_TOKEN env var not set." });
  }

  try {
    const data = await queryNotion(DB_ID, token);
    const page = data.results?.[0];
    if (!page) return res.status(404).json({ error: "No briefs found." });

    const props = page.properties;
    const lastRun = props.Date?.date?.start || null;
    const urgentCount = props.Urgent?.number ?? 0;
    const fiyCount = props.FYI?.number ?? 0;

    const blocks = await getPageContent(page.id, token);
    const items = blocksToSections(blocks);
    const calItem = items.find((i) => i.tag === "calendar");
    let meetings = 0;
    if (calItem && !/no meetings|clear day/i.test(calItem.body)) {
      meetings = (calItem.body.match(/\d{1,2}:\d{2}/g) || []).length || 1;
    }

    return res.status(200).json({ lastRun, urgentCount, fiyCount, meetings, items });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
