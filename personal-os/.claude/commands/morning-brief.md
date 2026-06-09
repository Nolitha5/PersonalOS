# /morning-brief

Pull unread emails, today's calendar, and Notion context. Filter through soul.md priorities. Return a scannable daily brief in under 3 minutes.

## Step 0: Bootstrap Check

Read `vault/projects/morning-brief/status.md`.

If missing or no `db_id`:
- Read `vault/projects/notion-parent-id.md`. If missing: halt — "Run /setup first."
- Run bootstrap from `work/02-morning-brief/CLAUDE.md` (Notion creation sequence).

## Step 1: Load Priorities

Read `soul.md` → `## My Priorities`. Store as priority list P1-P5.
Read `vault/me/goals.md` if exists. Store as active goals.

If soul.md is empty/template: set `filter_mode = none`.

## Step 2: Pull Gmail

Load `mcp__7bf62002-15d9-4b09-9956-0b30852aef11__search_threads` via ToolSearch.

Query: `is:unread newer_than:12h`

For each thread: extract sender name, sender email, subject, snippet.
Cap at 30 threads. If 0 threads: note "Clear inbox."

## Step 3: Pull Calendar

Load `mcp__73251489-1566-4abd-9ec1-eef1b4e4961d__list_events` via ToolSearch.

Params: `timeMin={today}T00:00:00Z`, `timeMax={today}T23:59:59Z`

For each event: extract title, time, attendees, description.
If 0 events: note "No meetings today."

## Step 4: Pull Notion Context

Load `mcp__91625919-85a7-43d3-9308-78130e9835ab__notion-search` via ToolSearch.

Search for pages matching today's attendee names and active project names (from TASKS.md).
Cap at 10 results. Extract page title and last-edited summary.

## Step 5: Enrich People

For every person found in emails or calendar attendees:
1. Check `vault/people/{name}.md`. Use for context if exists.
2. If not found: create `vault/people/{firstname-lastname}.md`:

```markdown
---
name: {Full Name}
email: {email}
company: {domain}
first_seen: {YYYY-MM-DD}
source: {email|calendar}
---

# {Full Name}

Met via {email|calendar} on {YYYY-MM-DD}.

[[business/{company}]]
```

3. For new company domains: create `vault/business/{company}.md` if missing.
4. Update `vault/index.md` and `vault/log.md` for every new page.

## Step 6: Filter and Classify

For each email thread:
- If subject/sender matches P1-P2 priority OR active goal: → **Urgent** (if action implied) or **Key Context**
- Otherwise: → **FYI**
- If `filter_mode = none`: rank by recency, put anything with "urgent/asap/today/deadline" in Urgent

For each calendar event:
- All events → **Today's Calendar**
- Flag events with external attendees not in vault/people/ as needing context

## Step 7: Generate Brief

Build the brief using the format from `work/02-morning-brief/CLAUDE.md`.

Voice rules (from soul.md, or defaults if template):
- Never sound like AI. Direct. Conversational. No em-dashes.
- One-line summaries only. No padding.
- Urgent items: action verb + what + deadline if known.
- Calendar: time + title + one-line prep note if needed.

Count: urgent_count = len(Urgent), fyi_count = len(FYI).

## Step 8: Save Locally

Write to `vault/projects/morning-brief/history/{YYYY-MM-DD}.md`.

Update `vault/projects/morning-brief/status.md`:
- `last_run: {YYYY-MM-DD}`
- `last_urgent_count: {N}`
- `last_fyi_count: {N}`

## Step 9: Save to Notion

Load `mcp__91625919-85a7-43d3-9308-78130e9835ab__notion-create-pages` via ToolSearch.

Create page in Daily Briefs DB (collection_id from status.md):
```
parent: {type: data_source_id, data_source_id: {collection_id}}
properties: {
  "Date": {date: {start: "YYYY-MM-DD"}},
  "Summary": {first 200 chars of brief},
  "Urgent": {urgent_count},
  "FYI": {fyi_count}
}
content: {full brief markdown}
```

If unavailable: skip, note "Saved locally only."

## Step 10: Mark Morning Brief Done (first run only)

Check `vault/projects/morning-brief/status.md` for `sprint_marked_done`.
If not set:
- Find "Morning Brief" page in sprint board DB (db_id from sprint-tracker/status.md).
- `notion-update-page` → Status = "Done".
- Set `sprint_marked_done: true` in status.md.

## Step 11: Vault Updates

Append to `vault/log.md`:
```
## [{YYYY-MM-DD HH:MM}] /morning-brief | brief generated. Urgent: {N}, FYI: {N}, meetings: {N}. New people: {N}. New companies: {N}.
```

Update `vault/index.md` — add new standup under Projects > Morning Brief if not already there.

## Step 12: Return Brief

Print the full brief to chat. No preamble. Just the brief.
