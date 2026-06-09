# Morning Brief

Daily summary of emails, calendar, and Notion context — filtered through soul.md priorities and scannable in under 3 minutes.

## What It Does

1. **Bootstrap** (first run): Creates "Daily Briefs" Notion database under Personal OS parent page. Skips if `db_id` present in `vault/projects/morning-brief/status.md`.
2. **Pull emails**: Gmail MCP — unread threads from last 12 hours.
3. **Pull calendar**: Google Calendar MCP — all events today.
4. **Pull Notion context**: Search for pages related to today's attendees and active projects.
5. **Enrich people**: For every person found in email/calendar, check `vault/people/`. Create pages for new contacts, update existing ones.
6. **Filter by priorities**: Apply soul.md priorities to rank/suppress items. If soul.md is empty, apply no filter (show everything).
7. **Generate brief**: Structured output in 4 sections: Urgent, Today's Calendar, Key Context, FYI.
8. **Save locally**: `vault/projects/morning-brief/history/YYYY-MM-DD.md`.
9. **Save to Notion**: Create a page in "Daily Briefs" DB.
10. **Mark Done**: Set Morning Brief status = Done on sprint board.

## Invocation

```
/morning-brief
```

No arguments. Runs end-to-end and returns the brief.

## Output Format

```markdown
# Morning Brief — {WEEKDAY}, {MONTH} {DD}

> {N} urgent · {N} meetings · {N} FYI

---

## Urgent
{items that need action today, ranked by priority}
- [{sender}] {subject} — {one-line summary} → {action needed}

## Today's Calendar
{time} — {event title}
  Attendees: {names with vault links if known}
  Prep needed: {yes/no + what}

## Key Context
{relevant Notion pages, project updates, things to know before the day starts}
- [[projects/{name}]]: {one-line status}

## FYI
{lower-priority emails and updates, no action needed}
- [{sender}] {subject} — {one-line summary}
```

## Priority Filtering (soul.md)

Read `soul.md` → `## My Priorities`. Map each email/event/page to the priority list:
- Matches priority 1-2: → **Urgent** (if action needed) or **Key Context**
- Matches priority 3-4: → **FYI**
- No match: → **FYI** unless sender is in `vault/people/` with importance flag
- If soul.md is empty/template: skip filtering, show everything in relevance order

## People Enrichment Protocol

For every name found in emails or calendar:
1. Check `vault/people/{name}.md`. If exists, use for context (role, relationship, importance).
2. If not found: create `vault/people/{name}.md` with what we know (email address, company domain, how we met = "email" or "calendar").
3. For every new company domain found: check `vault/business/{company}.md`. Create if missing.
4. After creating new pages: add to `vault/index.md`, append to `vault/log.md`.

## Notion Integration

### Daily Briefs DB Schema

```
Date        date
Summary     rich_text   (first 200 chars of brief)
Urgent      number      (count of urgent items)
FYI         number      (count of FYI items)
Link        url         (link to vault/projects/morning-brief/history/YYYY-MM-DD.md)
```

### Views
- Timeline: sorted by Date descending
- Table: all fields visible

### Notion Creation Sequence (Bootstrap)
1. `notion-create-database(title="Daily Briefs", schema above)` → get db_id, collection_id
2. `notion-move-pages` under Personal OS parent
3. `notion-update-data-source` ALTER COLUMN for any select/status fields
4. `notion-create-view` Timeline view
5. Save IDs to `vault/projects/morning-brief/status.md`

### Daily Page Creation
After brief is generated:
```
notion-create-pages(
  parent: {type: data_source_id, data_source_id: collection_id},
  properties: {
    "Date": {date: {start: "YYYY-MM-DD"}},
    "Summary": first 200 chars,
    "Urgent": urgent_count,
    "FYI": fyi_count
  },
  content: full brief markdown
)
```

## Self-Marking Rule

On first successful run, mark "Morning Brief" as Done on the sprint board:
```
notion-update-page(page_id=<morning-brief sprint page id>, properties={Status: "Done"})
```

## Files

| Path | Purpose |
|------|---------|
| `vault/projects/morning-brief/status.md` | DB IDs, last run |
| `vault/projects/morning-brief/history/YYYY-MM-DD.md` | Daily brief archive |
| `work/02-morning-brief/CLAUDE.md` | This spec |

## Goals Integration

Read `vault/me/goals.md` if it exists. Cross-reference today's emails/events against active goals. Flag items that directly advance a current goal as **Urgent** (or bump priority).

## Brand

Read `brand/config/brand-config.md`. If primary color is set, use it in the Notion page header. If template/empty, skip branding.

## Error Handling

- Gmail unavailable: skip email sections, note in brief header.
- Calendar unavailable: skip calendar section, note in brief header.
- Notion unavailable: save locally only.
- soul.md is template: skip priority filtering, show all items.
- Empty inbox/calendar: output "Clear inbox. No meetings today." — still useful.
