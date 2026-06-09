# Sprint Tracker

Reads the Notion progress board, generates a standup summary, and tracks velocity over time.

## What It Does

1. **Bootstrap** (first run only): Creates the sprint tracker Notion database. Skips if `db_id` already in `vault/projects/sprint-tracker/status.md`.
2. **Read board**: Queries the Notion progress tracker DB for all 10 automations and their current status.
3. **Generate standup**: Counts items by status (Done / In Progress / To Do), lists each item, computes velocity (items moved to Done since last run).
4. **Write locally**: Saves standup to `vault/projects/sprint-tracker/standups/YYYY-MM-DD.md`.
5. **Write to Notion**: Creates a standup page under the Personal OS parent page.
6. **Track velocity**: Appends a row to `vault/projects/sprint-tracker/velocity-history/history.md`.

## Invocation

```
/sprint-tracker
```

No arguments. Runs end-to-end and returns the standup summary.

## Notion Integration

### Progress Tracker DB Schema

```
Task        title
Status      select: To Do | In Progress | Done
Order       number
Notes       rich_text
```

### Views
- Board: grouped by Status
- Build Order: table sorted by Order

### Standup Page Schema (child of Personal OS parent)

Each standup is a plain page under the Personal OS parent with:
- Title: `Standup YYYY-MM-DD`
- Body: full standup markdown

## Standup Output Format

```markdown
# Standup — YYYY-MM-DD

**Done (N):** X items completed
**In Progress (N):** X items active
**To Do (N):** X items remaining

## Done
- Sprint Tracker
- Morning Brief
...

## In Progress
- Market Pulse
...

## To Do
- Personal CRM
...

## Velocity
- Today: X items Done
- Last run: YYYY-MM-DD (X items Done)
- Delta: +X / -X
```

## Bootstrap Protocol

Per CLAUDE.md Bootstrap Protocol:

1. Read `vault/projects/sprint-tracker/status.md`. If no `db_id`, bootstrap.
2. Read `vault/projects/notion-parent-id.md` for parent page ID.
3. Run: `notion-create-database` → `notion-move-pages` → `notion-update-data-source` (ALTER COLUMN for Status select options) → `notion-create-view`.
4. Save `db_id`, `data_source_id`, `parent_page_id`, `created`, `last_run` to `vault/projects/sprint-tracker/status.md`.
5. Log: `## [YYYY-MM-DD HH:MM] bootstrap | sprint-tracker DB created` to `vault/log.md`.

## Self-Marking Rule

When this automation finishes successfully, it marks itself Done on the Notion board:
```
notion-update-page(page_id=<sprint-tracker page id>, properties={Status: "Done"})
```

Every future automation must do the same when it completes its first successful run.

## Files

| Path | Purpose |
|------|---------|
| `vault/projects/sprint-tracker/status.md` | DB IDs, last run date, last velocity |
| `vault/projects/sprint-tracker/standups/YYYY-MM-DD.md` | Daily standup archive |
| `vault/projects/sprint-tracker/velocity-history/history.md` | Velocity log |
| `work/01-sprint-tracker/CLAUDE.md` | This spec |

## Error Handling

- Notion MCP unavailable: write standup locally, skip Notion page creation. Note in output.
- DB not found: run bootstrap. If bootstrap fails, halt and tell user to run `/setup`.
- Empty board: output "No items found on the board. Run /setup to seed automations."
