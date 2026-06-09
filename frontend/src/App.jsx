import { useState } from "react";
import "./App.css";

// ── VAULT DATA (sourced from vault/ files) ──────────────────────────────────

const AUTOMATIONS = [
  {
    id: "sprint-tracker",
    name: "Sprint Tracker",
    icon: "📌",
    color: "blue",
    status: "done",
    schedule: "weekdays 9:00 AM",
    desc: "Reads Notion progress board, generates standup summary, tracks velocity over time.",
    lastRun: "2026-06-02",
    command: "/sprint-tracker",
  },
  {
    id: "morning-brief",
    name: "Morning Brief",
    icon: "📰",
    color: "green",
    status: "done",
    schedule: "daily 8:00 AM",
    desc: "Gmail + Calendar + Notion → filtered daily brief. Urgent items surface first.",
    lastRun: "2026-06-03",
    command: "/morning-brief",
  },
  {
    id: "market-pulse",
    name: "Market Pulse",
    icon: "📈",
    color: "yellow",
    status: "done",
    schedule: "daily 7:00 AM",
    desc: "Competitor scrape + web search → tagged brief. Feeds into Morning Brief key context.",
    lastRun: "2026-06-03",
    command: "/market-pulse",
  },
  {
    id: "research-team",
    name: "Research Team",
    icon: "🔬",
    color: "purple",
    status: "todo",
    desc: "Deep-dive research on any topic. Builds structured reports saved to vault.",
    command: "/research-team",
  },
  {
    id: "personal-crm",
    name: "Personal CRM",
    icon: "🤝",
    color: "cyan",
    status: "todo",
    desc: "Tracks relationships, follow-ups, and context for every contact in vault/people/.",
    command: "/personal-crm",
  },
  {
    id: "meeting-intel",
    name: "Meeting Intel",
    icon: "🎙️",
    color: "orange",
    status: "todo",
    desc: "Preps briefing docs before meetings and captures action items after.",
    command: "/meeting-intel",
  },
  {
    id: "email-triage",
    name: "Email Triage",
    icon: "📧",
    color: "red",
    status: "todo",
    desc: "Drafts replies, archives noise, and surfaces emails that need action.",
    command: "/email-triage",
  },
  {
    id: "expense-wrangler",
    name: "Expense Wrangler",
    icon: "💳",
    color: "pink",
    status: "todo",
    desc: "Categorises receipts, reconciles expenses, and exports reports.",
    command: "/expense-wrangler",
  },
  {
    id: "content-machine",
    name: "Content Machine",
    icon: "✍️",
    color: "purple",
    status: "todo",
    desc: "Turns raw notes and ideas into publish-ready posts and articles.",
    command: "/content-machine",
  },
  {
    id: "weekly-exec-report",
    name: "Weekly Exec Report",
    icon: "📊",
    color: "blue",
    status: "todo",
    desc: "Compiles velocity, wins, blockers, and next-week plan into a weekly self-review.",
    command: "/weekly-exec-report",
  },
];

const SPRINT_DATA = {
  lastRun: "2026-06-02",
  done: ["Sprint Tracker", "Morning Brief"],
  inProgress: [],
  todo: [
    "Market Pulse",
    "Research Team",
    "Personal CRM",
    "Meeting Intel",
    "Email Triage",
    "Expense Wrangler",
    "Content Machine",
    "Weekly Exec Report",
  ],
  velocity: 2,
  total: 10,
};

const MORNING_BRIEF_DATA = {
  lastRun: "2026-06-03",
  urgentCount: 1,
  fiyCount: 4,
  meetings: 0,
  items: [
    {
      tag: "urgent",
      title: "Google Security Alert",
      body: "Sign-in from new device detected. Review account activity in Google Security settings.",
    },
    {
      tag: "fyi",
      title: "OpenAI $122B Funding Round",
      body: "Amazon $50B, Nvidia $30B, SoftBank $30B. Surfaces in Market Pulse as Action Needed.",
    },
    {
      tag: "fyi",
      title: "No meetings scheduled today",
      body: "Calendar is clear.",
    },
    {
      tag: "fyi",
      title: "GPT-5.5 now default for all users",
      body: "Sharper accuracy, better STEM. Check if any workflows rely on GPT-5.x capability gaps.",
    },
    {
      tag: "fyi",
      title: "OpenAI leadership changes",
      body: "CMO departing, COO moving to special projects, AGI CEO on medical leave — pre-IPO.",
    },
  ],
};

const MARKET_PULSE_DATA = {
  lastRun: "2026-06-08",
  actionCount: 8,
  fiyCount: 6,
  watchlist: [
    { company: "OpenAI", website: "openai.com", notes: "primary competitor" },
    { company: "LangChain", website: "langchain.com", notes: "AI orchestration framework" },
    { company: "Notion", website: "notion.so", notes: "productivity/knowledge platform" },
  ],
  findings: [
    {
      tag: "action",
      company: "OpenAI",
      title: "ChatGPT Personal Finance — bank accounts connected",
      body: "Acquired Hiro team, launched finance tools on ChatGPT (web + iOS Pro). New consumer category.",
    },
    {
      tag: "action",
      company: "OpenAI",
      title: "Professional Services Business + $4B",
      body: "Enterprise sales motion getting aggressive. Acquisitions planned. Watch their pricing.",
    },
    {
      tag: "action",
      company: "OpenAI",
      title: "Codex Sites — hosted interactive websites",
      body: "Partners: Wix, Replit, Figma, Lovable. Direct push into no-code/builder market.",
    },
    {
      tag: "action",
      company: "LangChain",
      title: "$125M Series B at $1.25B valuation — unicorn",
      body: "Backed by ServiceNow, Workday, Cisco, Datadog, Databricks. Evaluate dependency risk.",
    },
    {
      tag: "action",
      company: "LangChain",
      title: "Agent Builder in private preview",
      body: "No-code text-to-agent. Lowers barrier for non-technical users. Get on the waitlist.",
    },
    {
      tag: "action",
      company: "LangChain",
      title: "LangChain 1.0 + LangGraph GA",
      body: "First stable release. Pre-built agent architectures. Production-ready now.",
    },
    {
      tag: "action",
      company: "Notion",
      title: "Developer Platform + Workers launched",
      body: "Custom code in sandbox, external agents (Claude Code, Cursor, Codex). Notion = orchestration hub.",
    },
    {
      tag: "action",
      company: "Notion",
      title: "1M+ Custom Agents created since Feb 2026",
      body: "Massive adoption. If your team uses Notion, they may already be automating.",
    },
    {
      tag: "fyi",
      company: "OpenAI",
      title: "GPT-5.4 launched",
      body: "Most capable model yet. Replaces GPT-5.3 as default.",
    },
    {
      tag: "fyi",
      company: "OpenAI",
      title: "Venture Fund launched",
      body: "OpenAI investing directly in startups — wants to own the application layer.",
    },
    {
      tag: "fyi",
      company: "LangChain",
      title: "CEO: better models alone won't get agents to production",
      body: "Deliberate market framing — positioning LangChain as the reliability layer.",
    },
    {
      tag: "fyi",
      company: "Notion",
      title: "$270M PE tender offer at $11B valuation",
      body: "Liquidity event for existing shareholders. Not new growth capital. Company still private.",
    },
  ],
};

// ── COMPONENTS ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = { done: ["done", "Active"], todo: ["todo", "To Build"], "in-progress": ["in-progress", "In Progress"] };
  const [cls, label] = map[status] || ["todo", status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function NavItem({ icon, label, id, active, badge, badgeColor, onClick }) {
  return (
    <div className={`nav-item ${active ? "active" : ""}`} onClick={() => onClick(id)}>
      <span className="icon">{icon}</span>
      {label}
      {badge !== undefined && (
        <span className={`nav-badge ${badgeColor || ""}`}>{badge}</span>
      )}
    </div>
  );
}

// ── PAGES ───────────────────────────────────────────────────────────────────

function DashboardPage({ onNav }) {
  const built = AUTOMATIONS.filter((a) => a.status === "done");
  const todo = AUTOMATIONS.filter((a) => a.status === "todo");
  const progress = Math.round((built.length / AUTOMATIONS.length) * 100);

  return (
    <>
      <div className="page-header">
        <div className="page-title">Executive Workspace</div>
        <div className="page-sub">Personal OS · {new Date().toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value green">{built.length}</div>
          <div className="stat-label">Automations Live</div>
        </div>
        <div className="stat-card">
          <div className="stat-value yellow">{todo.length}</div>
          <div className="stat-label">To Build</div>
        </div>
        <div className="stat-card">
          <div className="stat-value blue">{MARKET_PULSE_DATA.actionCount}</div>
          <div className="stat-label">Action Items Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value purple">{MORNING_BRIEF_DATA.urgentCount}</div>
          <div className="stat-label">Urgent Emails</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{progress}%</div>
          <div className="stat-label">Sprint Progress</div>
          <div className="progress-wrap" style={{ marginTop: 8 }}>
            <div className="progress-fill blue" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">Active Automations</div>
        <div className="section-action" onClick={() => onNav("automations")}>View all →</div>
      </div>

      <div className="auto-grid" style={{ marginBottom: 28 }}>
        {built.map((a) => (
          <div key={a.id} className="auto-card active-card" onClick={() => onNav(a.id)}>
            <div className="auto-card-top">
              <div className={`auto-icon ${a.color}`}>{a.icon}</div>
              <StatusBadge status={a.status} />
            </div>
            <div className="auto-card-title">{a.name}</div>
            <div className="auto-card-desc">{a.desc}</div>
            <div className="auto-card-meta">
              <span className="schedule-tag">🕐 {a.schedule}</span>
              {a.lastRun && (
                <span className="auto-card-time">Last run {a.lastRun}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <div className="section-title">Up Next</div>
      </div>
      <div className="auto-grid">
        {todo.slice(0, 4).map((a) => (
          <div key={a.id} className="auto-card" onClick={() => onNav("automations")}>
            <div className="auto-card-top">
              <div className={`auto-icon ${a.color}`}>{a.icon}</div>
              <StatusBadge status={a.status} />
            </div>
            <div className="auto-card-title">{a.name}</div>
            <div className="auto-card-desc">{a.desc}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function AutomationsPage({ onNav }) {
  return (
    <>
      <div className="page-header">
        <div className="page-title">All Automations</div>
        <div className="page-sub">{AUTOMATIONS.filter(a => a.status === "done").length} active · {AUTOMATIONS.filter(a => a.status === "todo").length} to build</div>
      </div>

      <div className="section-header" style={{ marginBottom: 14 }}>
        <div className="section-title">Active</div>
      </div>
      <div className="auto-grid" style={{ marginBottom: 28 }}>
        {AUTOMATIONS.filter(a => a.status === "done").map(a => (
          <div key={a.id} className="auto-card active-card" onClick={() => onNav(a.id)}>
            <div className="auto-card-top">
              <div className={`auto-icon ${a.color}`}>{a.icon}</div>
              <StatusBadge status={a.status} />
            </div>
            <div className="auto-card-title">{a.name}</div>
            <div className="auto-card-desc">{a.desc}</div>
            <div className="auto-card-meta">
              <code style={{ fontSize: 11, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 4 }}>{a.command}</code>
              {a.lastRun && <span className="auto-card-time">Last run {a.lastRun}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="section-header" style={{ marginBottom: 14 }}>
        <div className="section-title">To Build</div>
      </div>
      <div className="auto-grid">
        {AUTOMATIONS.filter(a => a.status === "todo").map(a => (
          <div key={a.id} className="auto-card" style={{ opacity: 0.7 }}>
            <div className="auto-card-top">
              <div className={`auto-icon ${a.color}`}>{a.icon}</div>
              <StatusBadge status={a.status} />
            </div>
            <div className="auto-card-title">{a.name}</div>
            <div className="auto-card-desc">{a.desc}</div>
            <div className="auto-card-meta">
              <code style={{ fontSize: 11, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 4 }}>{a.command}</code>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SprintTrackerPage({ onBack }) {
  const doneCount = SPRINT_DATA.done.length;
  const total = SPRINT_DATA.total;
  const progress = Math.round((doneCount / total) * 100);

  return (
    <>
      <div className="back-btn" onClick={onBack}>← Back</div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="auto-icon blue" style={{ width: 44, height: 44, fontSize: 22 }}>📌</div>
          <div>
            <div className="page-title">Sprint Tracker</div>
            <div className="page-sub">Last run: {SPRINT_DATA.lastRun} · Velocity: {SPRINT_DATA.velocity} done</div>
          </div>
        </div>
      </div>

      <div className="stats-row" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value green">{doneCount}</div>
          <div className="stat-label">Done</div>
        </div>
        <div className="stat-card">
          <div className="stat-value yellow">{SPRINT_DATA.inProgress.length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{SPRINT_DATA.todo.length}</div>
          <div className="stat-label">To Do</div>
        </div>
        <div className="stat-card">
          <div className="stat-value blue">{progress}%</div>
          <div className="stat-label">Complete</div>
          <div className="progress-wrap">
            <div className="progress-fill green" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="sprint-cols">
        <div className="sprint-col">
          <div className="sprint-col-header done-col">
            Done <span className="sprint-col-count">{doneCount}</span>
          </div>
          {SPRINT_DATA.done.map(t => (
            <div key={t} className="sprint-item done-item">
              <span className="sprint-item-dot green" />
              {t}
            </div>
          ))}
        </div>
        <div className="sprint-col">
          <div className="sprint-col-header progress-col">
            In Progress <span className="sprint-col-count">{SPRINT_DATA.inProgress.length}</span>
          </div>
          {SPRINT_DATA.inProgress.length === 0 && (
            <div className="sprint-item" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Nothing in progress</div>
          )}
        </div>
        <div className="sprint-col">
          <div className="sprint-col-header todo-col">
            To Do <span className="sprint-col-count">{SPRINT_DATA.todo.length}</span>
          </div>
          {SPRINT_DATA.todo.map(t => (
            <div key={t} className="sprint-item">
              <span className="sprint-item-dot gray" />
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-card-title">Schedule & Config</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span className="schedule-tag">🕐 Weekdays 9:00 AM</span>
          <code style={{ fontSize: 12, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", padding: "4px 10px", borderRadius: 6 }}>/sprint-tracker</code>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Notion DB: e3074d78</span>
        </div>
      </div>
    </>
  );
}

function MorningBriefPage({ onBack }) {
  return (
    <>
      <div className="back-btn" onClick={onBack}>← Back</div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="auto-icon green" style={{ width: 44, height: 44, fontSize: 22 }}>📰</div>
          <div>
            <div className="page-title">Morning Brief</div>
            <div className="page-sub">Last run: {MORNING_BRIEF_DATA.lastRun} · {MORNING_BRIEF_DATA.urgentCount} urgent · {MORNING_BRIEF_DATA.fiyCount} FYI</div>
          </div>
        </div>
      </div>

      <div className="stats-row" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value red">{MORNING_BRIEF_DATA.urgentCount}</div>
          <div className="stat-label">Urgent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value blue">{MORNING_BRIEF_DATA.fiyCount}</div>
          <div className="stat-label">FYI</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{MORNING_BRIEF_DATA.meetings}</div>
          <div className="stat-label">Meetings Today</div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card full-width">
          <div className="detail-card-title">Today's Brief — {MORNING_BRIEF_DATA.lastRun}</div>
          {MORNING_BRIEF_DATA.items.map((item, i) => (
            <div key={i} className="brief-item">
              <div className="brief-item-top">
                <span className={`badge ${item.tag === "urgent" ? "in-progress" : "todo"}`}>
                  {item.tag === "urgent" ? "🔴 Urgent" : "📋 FYI"}
                </span>
                <div className="brief-item-title">{item.title}</div>
              </div>
              <div className="brief-item-body">{item.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-card-title">Schedule & Config</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span className="schedule-tag">🕐 Daily 8:00 AM</span>
          <code style={{ fontSize: 12, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", padding: "4px 10px", borderRadius: 6 }}>/morning-brief</code>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Daily Briefs DB: d721dc09</span>
        </div>
      </div>
    </>
  );
}

function MarketPulsePage({ onBack }) {
  const actions = MARKET_PULSE_DATA.findings.filter(f => f.tag === "action");
  const fiys = MARKET_PULSE_DATA.findings.filter(f => f.tag === "fyi");

  return (
    <>
      <div className="back-btn" onClick={onBack}>← Back</div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="auto-icon yellow" style={{ width: 44, height: 44, fontSize: 22 }}>📈</div>
          <div>
            <div className="page-title">Market Pulse</div>
            <div className="page-sub">
              Last run: {MARKET_PULSE_DATA.lastRun} · {MARKET_PULSE_DATA.watchlist.length} companies · {MARKET_PULSE_DATA.actionCount} action items
            </div>
          </div>
        </div>
      </div>

      <div className="stats-row" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value red">{MARKET_PULSE_DATA.actionCount}</div>
          <div className="stat-label">Action Needed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value blue">{MARKET_PULSE_DATA.fiyCount}</div>
          <div className="stat-label">FYI</div>
        </div>
        <div className="stat-card">
          <div className="stat-value yellow">{MARKET_PULSE_DATA.watchlist.length}</div>
          <div className="stat-label">Watching</div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <div className="detail-card-title">🔴 Action Needed</div>
          {actions.map((f, i) => (
            <div key={i} className="finding-row">
              <span className="finding-tag action">ACTION</span>
              <div className="finding-text">
                <strong>{f.company} — {f.title}</strong><br />
                {f.body}
              </div>
            </div>
          ))}
        </div>

        <div className="detail-card">
          <div className="detail-card-title">📋 FYI</div>
          {fiys.map((f, i) => (
            <div key={i} className="finding-row">
              <span className="finding-tag fyi">FYI</span>
              <div className="finding-text">
                <strong>{f.company} — {f.title}</strong><br />
                {f.body}
              </div>
            </div>
          ))}
        </div>

        <div className="detail-card full-width">
          <div className="detail-card-title">Watchlist</div>
          <table className="watch-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Website</th>
                <th>Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MARKET_PULSE_DATA.watchlist.map(w => (
                <tr key={w.company}>
                  <td style={{ color: "var(--text)", fontWeight: 500 }}>{w.company}</td>
                  <td>{w.website}</td>
                  <td>{w.notes}</td>
                  <td>
                    {w.company === "OpenAI"
                      ? <span className="badge done">Scanned</span>
                      : <span className="badge todo">Queued</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-card-title">Schedule & Config</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span className="schedule-tag">🕐 Daily 7:00 AM</span>
          <code style={{ fontSize: 12, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", padding: "4px 10px", borderRadius: 6 }}>/market-pulse</code>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Market Scans DB: 96ed9303</span>
        </div>
      </div>
    </>
  );
}

// ── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("dashboard");

  const nav = (id) => setPage(id);

  const builtCount = AUTOMATIONS.filter(a => a.status === "done").length;

  const renderPage = () => {
    switch (page) {
      case "dashboard":     return <DashboardPage onNav={nav} />;
      case "automations":   return <AutomationsPage onNav={nav} />;
      case "sprint-tracker":  return <SprintTrackerPage onBack={() => nav("automations")} />;
      case "morning-brief":   return <MorningBriefPage onBack={() => nav("automations")} />;
      case "market-pulse":    return <MarketPulsePage onBack={() => nav("automations")} />;
      default:              return <DashboardPage onNav={nav} />;
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <div>
            <div className="sidebar-logo-text">Personal OS</div>
            <div className="sidebar-logo-sub">Nduvho · v1.0</div>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-label">Workspace</div>
          <NavItem icon="🏠" label="Dashboard" id="dashboard" active={page === "dashboard"} onClick={nav} />
          <NavItem icon="🤖" label="Automations" id="automations" active={page === "automations"} badge={builtCount} badgeColor="green" onClick={nav} />
        </div>

        <div className="nav-section" style={{ marginTop: 8 }}>
          <div className="nav-label">Active</div>
          <NavItem icon="📌" label="Sprint Tracker" id="sprint-tracker" active={page === "sprint-tracker"} onClick={nav} />
          <NavItem icon="📰" label="Morning Brief" id="morning-brief" active={page === "morning-brief"} badge={MORNING_BRIEF_DATA.urgentCount} badgeColor="red" onClick={nav} />
          <NavItem icon="📈" label="Market Pulse" id="market-pulse" active={page === "market-pulse"} badge={MARKET_PULSE_DATA.actionCount} badgeColor="yellow" onClick={nav} />
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-status">
            <div className="status-dot" />
            3 automations running
          </div>
        </div>
      </aside>

      <main className="main">
        {renderPage()}
      </main>
    </div>
  );
}
