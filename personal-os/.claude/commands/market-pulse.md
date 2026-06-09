# /market-pulse

Scan competitors daily. Scrape websites, search for news, tag findings as Action Needed or FYI, generate a market brief.

## Arguments

- `/market-pulse` — run the full scan
- `/market-pulse --add "Company, https://url.com"` — add to watchlist, then run
- `/market-pulse --remove "Company"` — remove from watchlist

## Step 0: Bootstrap Check

Read `vault/projects/market-pulse/status.md`. If missing or no `db_id`:
- Read `vault/projects/notion-parent-id.md`. If missing: halt — "Run /setup first."
- Bootstrap: `notion-create-database` → `notion-move-pages` → `notion-create-view` (see `work/03-market-pulse/CLAUDE.md`).

## Step 1: Load Watchlist

Read `work/03-market-pulse/watchlist.md`. Parse competitor table.

If table is empty:
- Halt. Say: "No watchlist yet. Who do you want to track? Give me company names and websites."
- Wait for input. Add each to the table. Continue.

If `--add` argument: append company to watchlist.md before scanning.
If `--remove` argument: remove from watchlist.md, confirm, exit.

## Step 2: Load Context

Read `soul.md` → priorities. Read `vault/business/competitors/` for existing intel.
If soul.md is template: use default tagging rules from spec.

## Step 3: Scrape Competitor Websites

For each competitor in watchlist:

Load `mcp__Claude_in_Chrome__navigate` and `mcp__Claude_in_Chrome__get_page_text` via ToolSearch.

3a. Navigate to main website → extract product names, headlines, positioning.
3b. Navigate to /pricing (or pricing page from watchlist) → extract plan names, prices.
    - Compare to `vault/business/competitors/{company}.md` "Pricing" section if exists.
    - If price changed: tag Action Needed.
3c. Navigate to /careers (or careers page from watchlist) → count open roles by department.
    - If hiring spike in engineering/ML/AI: tag Action Needed.
3d. Save screenshot if notable: `vault/projects/market-pulse/screenshots/{company-slug}-{YYYY-MM-DD}.png`.

Cap total Chrome time: move on after 3 pages per competitor.

## Step 4: Web Search

Load WebSearch via ToolSearch.

For each competitor, run 3 searches:
- `"{company}" funding OR investment 2026`
- `"{company}" product launch OR new feature`
- `"{company}" CEO OR leadership OR executive`

Extract: headline, source, date, one-line summary. Cap 3 results per search.

Tag each result per rules in `work/03-market-pulse/CLAUDE.md`.

## Step 5: Notion Search

Load `mcp__91625919-85a7-43d3-9308-78130e9835ab__notion-search` via ToolSearch.

Search for each competitor name in workspace. Extract any internal docs mentioning them.
If found: add to Key Context section of report.

## Step 6: Tag and Classify

Apply tagging rules from spec:
- Action Needed: pricing changes, product launches vs. priorities, funding B+, executive changes, unusual hiring
- FYI: everything else

action_count = total Action Needed items across all companies
fyi_count = total FYI items

## Step 7: Generate Report

Build report using format in `work/03-market-pulse/CLAUDE.md`.

Voice: direct, no AI slop, no em-dashes. One-line findings. Action items include the "why it matters."

## Step 8: Update Vault — Competitor Pages

For each company scanned, write/update `vault/business/competitors/{company-slug}.md`.
For any named executives found: check `vault/people/`. Create page if missing.
Update `vault/business/market/trends.md` with cross-company patterns.
Update `vault/index.md` for any new pages.
Append to `vault/log.md`.

## Step 9: Save Locally

Write `vault/projects/market-pulse/news-archive/{YYYY-MM-DD}.md`.
Append pricing snapshot to `vault/projects/market-pulse/pricing-history/{YYYY-MM-DD}.md`.

Update `vault/projects/market-pulse/status.md`:
- `last_run: {YYYY-MM-DD}`
- `last_action_count: {N}`
- `last_fyi_count: {N}`
- `last_companies: {comma-separated list}`

## Step 10: Save to Notion

Load `mcp__91625919-85a7-43d3-9308-78130e9835ab__notion-create-pages` via ToolSearch.

Create page in Market Scans DB (collection_id from status.md):
```
properties: {
  "Date": {date: {start: "YYYY-MM-DD"}},
  "Companies": comma-separated list,
  "Action Items": action_count,
  "FYI Count": fyi_count,
  "Summary": first 200 chars of report
}
content: full report markdown
```

## Step 11: Mark Market Pulse Done (first run only)

Check `vault/projects/market-pulse/status.md` for `sprint_marked_done`.
If not set:
- `notion-update-page(page_id=3736d4c3-f41f-810f-a152-fdf8a0380b00, properties={Status: "Done"})`
- Set `sprint_marked_done: true` in status.md.

## Step 12: Vault Log

Append to `vault/log.md`:
```
## [{YYYY-MM-DD HH:MM}] /market-pulse | scanned {N} companies. Action: {N}, FYI: {N}. New companies: {N}. New people: {N}.
```

## Step 13: Return Report

Print full report to chat. No preamble.

If action_count > 0: add a one-line note at the top: "Heads up: {N} items need your attention."
