# Personal OS

Claude automation framework built in this folder. The user is building 10 automations one by one, each tracked on a Notion progress board.

## Status
- Automation #1 (Sprint Tracker): built, Notion bootstrap pending /setup
- Automations #2-10: To Do

## Build Order
1. Sprint Tracker — reads Notion board, generates standups, tracks velocity
2. Morning Brief
3. Market Pulse
4. Research Team
5. Personal CRM
6. Meeting Intel
7. Email Triage
8. Expense Wrangler
9. Content Machine
10. Weekly Exec Report — weekly self-review report

## Key Concepts
- soul.md: agent identity file (voice, priorities, role). Injected at session start via hook.
- vault/: persistent wiki (Karpathy pattern). User reads in Obsidian.
- work/: automation code and config only (no knowledge).
- scheduler/schedule.md: registry of scheduled tasks.
- Notion progress board: tracks all 10 automations by status (To Do / In Progress / Done).

## Blockers
- /setup not yet completed: soul.md is a template, notion-parent-id.md missing, Notion board not created.
