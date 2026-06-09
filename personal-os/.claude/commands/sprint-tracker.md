# /sprint-tracker

Read the Notion progress board, generate a standup summary, and track velocity.

## Step 0: Bootstrap Check

Read `vault/projects/sprint-tracker/status.md`.

If the file doesn't exist or has no `db_id`:
- Read `vault/projects/notion-parent-id.md` for the Personal OS parent page ID.
- If that file doesn't exist: halt. Tell the user: "Run /setup first to create the Notion workspace. Sprint Tracker can't bootstrap without it."
- Otherwise: run the bootstrap sequence from `work/01-sprint-tracker/CLAUDE.md`.

If `db_id` is present: skip to Step 1.

## Step 1: Read the Board

Load Notion MCP via `ToolSearch("select:mcp__claude_ai_Notion__notion-query-database")`.

Query the progress tracker DB (db_id from status.md). Fetch all pages with fields: Task, Status, Order.

Sort results by Order ascending.

Group into three buckets:
- `done` = Status == "Done"
- `in_progress` = Status == "In Progress"
- `todo` = Status == "To Do"

## Step 2: Compute Velocity

Read `vault/projects/sprint-tracker/status.md` for `last_done_count` and `last_run`.

Current done count = len(done bucket).
Delta = current done count - last_done_count (0 if first run).

## Step 3: Generate Standup

Build the standup using this exact format (no polished AI tone, no em-dashes):

```
# Standup — {DATE}

Done ({N}) | In Progress ({N}) | To Do ({N})

## Done
{list of task names, one per line, prefixed with -}

## In Progress
{list or "Nothing in flight yet."}

## To Do
{list or "Board is clear."}

## Velocity
- Done today: {N} total
- Last run: {last_run or "first run"}
- Delta: {+N or -N or "first run"}
```

## Step 4: Save Standup

Write to `vault/projects/sprint-tracker/standups/{YYYY-MM-DD}.md`.

Append one row to `vault/projects/sprint-tracker/velocity-history/history.md`:
```
| {YYYY-MM-DD} | {done count} | {in_progress count} | {todo count} | {delta} |
```
If the file doesn't exist, create it with a header row first:
```
| Date | Done | In Progress | To Do | Delta |
|------|------|-------------|-------|-------|
```

## Step 5: Notion Standup Page

Load `mcp__claude_ai_Notion__notion-create-pages` via ToolSearch.

Create a page under the Personal OS parent page (from `vault/projects/notion-parent-id.md`):
- Title: `Standup {YYYY-MM-DD}`
- Content: full standup markdown from Step 3

If Notion MCP is unavailable, skip and note: "Standup saved locally only."

## Step 6: Mark Sprint Tracker Done

Load `mcp__claude_ai_Notion__notion-update-page` via ToolSearch.

Find the Sprint Tracker row in the progress board and set Status = "Done".

Every future automation marks itself Done on this board when it completes its first successful run. This is the pattern.

## Step 7: Update Status File

Overwrite `vault/projects/sprint-tracker/status.md` with updated fields:
- `last_run: {YYYY-MM-DD}`
- `last_done_count: {N}`
- `last_standup: vault/projects/sprint-tracker/standups/{YYYY-MM-DD}.md`

## Step 8: Vault Updates

Append to `vault/log.md`:
```
## [{YYYY-MM-DD HH:MM}] /sprint-tracker | standup generated. Done: {N}, In Progress: {N}, To Do: {N}. Delta: {+N/-N}.
```

Update `vault/index.md` if the standup file is new (add under Projects > Sprint Tracker).

## Step 9: Return Output

Print the standup to chat. Keep it tight. Don't add AI commentary on top of it.
