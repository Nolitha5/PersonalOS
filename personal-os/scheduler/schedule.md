# Scheduled Tasks

This file is maintained by the agent. When the user asks to schedule something, add it here.

To activate these schedules: Open Cowork → Schedule sidebar → Create a local task for each entry below.

---

## Active Schedules

<!-- Agent adds entries here when user requests a schedule -->
<!-- Format: -->
<!-- ### Task Name -->
<!-- - Command: /command-name -->
<!-- - Frequency: daily at 8:00 AM (or whatever) -->
<!-- - Description: what it does -->
<!-- - Added: YYYY-MM-DD -->

### Market Pulse
- Command: /market-pulse
- Frequency: daily at 7:00 AM
- Description: Scrapes competitor websites, searches for news/funding/leadership changes, tags findings as Action Needed or FYI, saves report locally and to Notion Market Scans DB.
- Added: 2026-06-03

### Morning Brief
- Command: /morning-brief
- Frequency: daily at 8:00 AM
- Description: Pulls unread emails, today's calendar, and Notion context. Filters through soul.md priorities. Saves brief locally and to Notion Daily Briefs DB.
- Added: 2026-06-02

### Sprint Tracker
- Command: /sprint-tracker
- Frequency: weekdays at 9:00 AM
- Description: Reads the Notion progress board, generates a standup summary (Done / In Progress / To Do with counts), and tracks velocity over time.
- Added: 2026-06-01

---

## How to Set Up in Cowork

For each entry above:
1. Open Claude Code Desktop (Cowork)
2. Click Schedule in the sidebar
3. Click New task → New local task
4. Name: use the task name above
5. Prompt: use the command above (e.g., "Run /morning-brief")
6. Frequency: match the frequency above
7. Enable "Keep computer awake" in Cowork Settings if you want it to run while you're away
