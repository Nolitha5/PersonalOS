# Market Pulse

Daily competitive intelligence scan. Scrapes competitor websites, searches for news/funding, and generates a tagged brief. Feeds into Morning Brief's Key Context section.

## What It Does

1. **Bootstrap** (first run): Creates "Market Scans" Notion database. Skips if `db_id` in `vault/projects/market-pulse/status.md`.
2. **Load watchlist**: Read `work/03-market-pulse/watchlist.md`. If empty, ask the user who to track before proceeding.
3. **Scrape websites**: For each competitor, use Chrome MCP to visit pricing, product, and careers pages. Capture headlines and key changes.
4. **Web search**: Search for news, funding rounds, leadership changes, product launches for each competitor.
5. **Notion search**: Search internal docs for mentions of each competitor.
6. **Tag findings**: Label each item as `Action Needed` or `FYI`.
7. **Generate report**: Structured market brief with tagged items.
8. **Update vault**: Write/update `vault/business/competitors/{company}.md` for each company scanned. Update `vault/business/market/trends.md`.
9. **Save locally**: `vault/projects/market-pulse/news-archive/YYYY-MM-DD.md`.
10. **Save to Notion**: Create a page in "Market Scans" DB.
11. **Mark Done**: Set Market Pulse = Done on sprint board (first run only).

## Invocation

```
/market-pulse
/market-pulse --add "Company Name, url"   # add to watchlist
/market-pulse --remove "Company Name"     # remove from watchlist
```

## Watchlist

Managed in `work/03-market-pulse/watchlist.md`. Format:

```markdown
## Competitors

| Company | Website | Pricing Page | Careers Page | Notes |
|---------|---------|-------------|-------------|-------|
| Acme Co | https://acme.com | /pricing | /careers | main competitor |
```

If watchlist is empty on run: halt and say "No watchlist yet. Who do you want to track? Give me company names and websites." Wait for input. Add to watchlist.md, then continue.

## Output Format

```markdown
# Market Pulse — {YYYY-MM-DD}

> {N} companies scanned · {N} action items · {N} FYI

---

## 🔴 Action Needed

### {Company Name}
- **{Finding type}**: {what changed} → {why it matters / what to do}

---

## 📋 FYI

### {Company Name}
- {Finding}: {one-line summary}

---

## Trends
{2-3 sentences on cross-company patterns spotted this week}

---

*Scanned: {company list} | Sources: website, web search, Notion*
```

## Tagging Rules

**Action Needed** if:
- Competitor dropped/raised pricing
- New product feature that competes directly with something in soul.md priorities
- Funding round (especially Series B+)
- Key executive hire or departure
- Job postings signal a strategic shift (e.g. suddenly hiring ML engineers)

**FYI** if:
- Blog post or content marketing
- Minor UI changes
- General news with no direct competitive threat
- Industry awards or recognition

If soul.md is empty/template: tag everything Action Needed that involves pricing or product changes; everything else FYI.

## Scraping Protocol (Chrome MCP)

For each competitor:
1. Load `mcp__Claude_in_Chrome__navigate` → competitor's main page
2. Load `mcp__Claude_in_Chrome__get_page_text` → extract headlines, pricing info, product names
3. Navigate to `/pricing` if it exists → extract price points, plan names, changes
4. Navigate to `/careers` → count open roles, note any unusual hiring spikes
5. Save screenshots to `vault/projects/market-pulse/screenshots/{company}-{YYYY-MM-DD}.png` if anything notable

Do NOT click links in emails. Only navigate to watchlist URLs directly.

## Web Search Protocol

For each competitor, run:
- `"{company name}" funding OR investment 2026`
- `"{company name}" product launch OR feature OR update`
- `"{company name}" CEO OR CTO OR leadership`

Cap at 5 search results per company. Extract: headline, source, date, one-line summary.

## Vault Update Protocol

After each scan, update or create `vault/business/competitors/{company-slug}.md`:

```markdown
---
name: {Company Name}
website: {url}
last_scanned: {YYYY-MM-DD}
tags: competitor
---

# {Company Name}

## Summary
{2-3 sentences: what they do, who they compete with}

## Latest Intel ({YYYY-MM-DD})
- Pricing: {current pricing snapshot}
- Product: {notable features/changes}
- Hiring: {N} open roles, focus on {area}
- News: {latest notable news}

## History
| Date | Finding | Tag |
|------|---------|-----|
| {YYYY-MM-DD} | {one-line} | Action/FYI |
```

After each scan, update `vault/business/market/trends.md`:
```markdown
# Market Trends

## Last Updated: {YYYY-MM-DD}

## Sector Trends
{2-3 sentences on patterns across competitors}

## Pricing Trends
{price movements observed}

## Hiring Signals
{what competitors are hiring for}
```

For any named executive found: create `vault/people/{name}.md` if not exists.

## Notion Integration

### Market Scans DB Schema

```
Date            date
Companies       rich_text   (comma-separated list)
Action Items    number
FYI Count       number
Summary         rich_text   (first 200 chars of brief)
```

### Views
- Table: sorted by Date descending
- Board: grouped by Action Items threshold (>0 vs 0)

### Bootstrap
1. `notion-create-database(title="Market Scans", schema above)` under parent page
2. `notion-move-pages` under Personal OS parent
3. `notion-create-view` Table + Board views
4. Save IDs to `vault/projects/market-pulse/status.md`

## Self-Marking Rule

First successful run: mark "Market Pulse" as Done on sprint board.
```
notion-update-page(page_id=3736d4c3-f41f-810f-a152-fdf8a0380b00, properties={Status: "Done"})
```

## Files

| Path | Purpose |
|------|---------|
| `work/03-market-pulse/watchlist.md` | Competitor list with URLs |
| `work/03-market-pulse/CLAUDE.md` | This spec |
| `vault/projects/market-pulse/status.md` | DB IDs, last run |
| `vault/projects/market-pulse/news-archive/YYYY-MM-DD.md` | Daily scan archive |
| `vault/projects/market-pulse/screenshots/` | Screenshot archive |
| `vault/projects/market-pulse/pricing-history/` | Pricing snapshots over time |
| `vault/business/competitors/{company}.md` | Per-company intel pages |
| `vault/business/market/trends.md` | Cross-competitor trend tracking |

## Morning Brief Integration

Market Pulse feeds into Morning Brief's Key Context section. After each scan:
- If any Action Needed items exist: surface in tomorrow's Morning Brief as Urgent
- The morning-brief command reads `vault/projects/market-pulse/status.md` for `last_action_count`

## Error Handling

- Chrome unavailable: skip website scraping, note in report. Run web search only.
- Web search blocked: note in report, use cached Notion data.
- Watchlist empty: halt, ask for competitors.
- Notion unavailable: save locally only.
