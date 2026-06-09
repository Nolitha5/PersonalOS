const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

const VAULT = path.resolve(__dirname, "../personal-os/vault");

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend connected successfully" });
});

function parseStatus(text) {
  const get = (key) => {
    const m = text.match(new RegExp("^" + key + ":\\s*(.+)$", "m"));
    return m ? m[1].trim() : null;
  };
  return {
    lastRun: get("last_run"),
    urgentCount: parseInt(get("last_urgent_count") || "0", 10),
    fiyCount: parseInt(get("last_fyi_count") || "0", 10),
  };
}

function parseBrief(md) {
  const sections = {};
  let current = null;
  for (const line of md.split("\n")) {
    const h2 = line.match(/^## (.+)/);
    if (h2) { current = h2[1].trim(); sections[current] = []; continue; }
    if (current) sections[current].push(line);
  }
  const items = [];

  const urgentLines = (sections["Urgent"] || []).filter(l => l.trim().startsWith("-"));
  for (const l of urgentLines) {
    const clean = l.replace(/^-\s*/, "").replace(/\*\*/g, "");
    const di = clean.indexOf(" — ");
    items.push({ tag: "urgent", title: di > -1 ? clean.slice(0, di) : clean, body: di > -1 ? clean.slice(di + 3) : "" });
  }

  const calLines = (sections["Today's Calendar"] || []).filter(l => l.trim() !== "");
  const calBody = calLines.join(" ").trim();
  if (calBody) items.push({ tag: "calendar", title: "Today's Calendar", body: calBody });

  const ctxLines = (sections["Key Context"] || []).filter(l => l.trim().startsWith("-"));
  for (const l of ctxLines) {
    const clean = l.replace(/^-\s*/, "").replace(/\*\*/g, "");
    const di = clean.indexOf(" — ");
    items.push({ tag: "context", title: di > -1 ? clean.slice(0, di) : clean, body: di > -1 ? clean.slice(di + 3) : "" });
  }

  const fiyLines = (sections["FYI"] || []).filter(l => l.trim().startsWith("-"));
  for (const l of fiyLines) {
    const clean = l.replace(/^-\s*/, "");
    const ci = clean.indexOf(": ");
    items.push({ tag: "fyi", title: ci > -1 ? clean.slice(0, ci) : clean, body: ci > -1 ? clean.slice(ci + 2) : "" });
  }

  return items;
}

app.get("/api/morning-brief/latest", (req, res) => {
  try {
    const statusPath = path.join(VAULT, "projects/morning-brief/status.md");
    if (!fs.existsSync(statusPath)) return res.status(404).json({ error: "No status file found." });
    const statusText = fs.readFileSync(statusPath, "utf8");
    const { lastRun, urgentCount, fiyCount } = parseStatus(statusText);
    let items = [], meetings = 0;
    if (lastRun) {
      const briefPath = path.join(VAULT, "projects/morning-brief/history/" + lastRun + ".md");
      if (fs.existsSync(briefPath)) {
        items = parseBrief(fs.readFileSync(briefPath, "utf8"));
        const cal = items.find(i => i.tag === "calendar");
        if (cal && !/no meetings|clear day/i.test(cal.body)) {
          meetings = (cal.body.match(/\d{1,2}:\d{2}/g) || []).length || 1;
        }
      }
    }
    res.json({ lastRun, urgentCount, fiyCount, meetings, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/morning-brief/history", (req, res) => {
  try {
    const histDir = path.join(VAULT, "projects/morning-brief/history");
    if (!fs.existsSync(histDir)) return res.json([]);
    const files = fs.readdirSync(histDir).filter(f => f.endsWith(".md")).sort().reverse().slice(0, 30);
    res.json(files.map(f => f.replace(".md", "")));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
