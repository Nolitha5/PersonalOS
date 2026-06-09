# System Context

## Tools & Files
| Term | Meaning |
|------|---------|
| soul.md | Agent identity file — voice, priorities, role. Injected at session start. |
| vault/ | Persistent knowledge wiki. User reads in Obsidian. Agent maintains it. |
| work/ | Code and config for automations. No knowledge lives here. |
| TASKS.md | Task list. 10 automations to build. |
| scheduler/schedule.md | Registry of scheduled tasks. |
| vault/index.md | Catalog of all vault pages. Read first before querying vault. |
| vault/log.md | Append-only activity log. Format: ## [YYYY-MM-DD HH:MM] command | description |
| notion-parent-id.md | Stores the Personal OS Notion parent page ID. Required for all Notion DB creation. |

## Automation Naming Convention
work/NN-name/ — e.g. work/01-sprint-tracker/, work/02-morning-brief/

## Slash Commands
/sprint-tracker, /morning-brief, /market-pulse, /research-team, /personal-crm,
/meeting-intel, /email-triage, /expense-wrangler, /content-machine, /weekly-exec-report
Admin: /setup, /ingest, /lint, /status, /brand, /cron-setup, /new, /venture-sync

## Weekly Exec Report
A weekly report the user produces for themselves — personal review, not for a boss or board.
