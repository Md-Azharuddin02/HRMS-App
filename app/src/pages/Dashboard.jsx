import { useEffect, useState } from "react";
import API from "../api/api";
import { Users, CalendarCheck, CalendarX, TrendingUp, Clock, RefreshCw } from "lucide-react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .db-wrap {
    font-family: 'Plus Jakarta Sans', sans-serif;
    width: 100%; max-width: 1100px; margin: 0 auto;
    padding: 28px 20px; display: flex; flex-direction: column; gap: 18px;
  }

  /* ── Header ── */
  .db-hdr { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .db-eyebrow { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; color: #7c52e8; margin-bottom: 4px; }
  .db-title   { font-size: 22px; font-weight: 800; color: #1e1b4b; line-height: 1.2; margin-bottom: 3px; }
  .db-sub     { font-size: 13px; color: #94a3b8; }
  .db-hdr-r   { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

  .db-time-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #f8fafc; border: 1px solid #e2e8f0;
    border-radius: 10px; padding: 7px 12px;
    font-size: 12px; font-weight: 600; color: #475569; white-space: nowrap;
  }
  .db-refresh {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 10px;
    border: 1.5px solid #e2e8f0; background: white;
    color: #64748b; font-size: 13px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all .15s;
    white-space: nowrap; min-height: 38px;
  }
  .db-refresh:hover { border-color: #c4b5fd; color: #7c52e8; }
  .db-refresh.spin svg { animation: dbSpin .7s linear infinite; }
  @keyframes dbSpin { to{transform:rotate(360deg)} }

  /* ── Stat grid ── */
  .db-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }

  .db-card {
    background: white; border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 2px 4px rgba(0,0,0,0.03), 0 8px 24px rgba(99,78,200,0.06);
    padding: 18px 18px 15px;
    display: flex; flex-direction: column; gap: 12px;
    position: relative; overflow: hidden;
    transition: transform .18s, box-shadow .18s;
    animation: dbUp .4s ease both;
  }
  .db-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.05), 0 14px 36px rgba(99,78,200,0.11); }
  .db-card::after { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:16px 16px 0 0; }
  .db-card.c-purple::after { background: linear-gradient(90deg,#6c4de6,#9b74f0); }
  .db-card.c-green::after  { background: linear-gradient(90deg,#16a34a,#4ade80); }
  .db-card.c-red::after    { background: linear-gradient(90deg,#dc2626,#f87171); }
  @keyframes dbUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

  .db-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; }
  .db-ico { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .i-purple { background: linear-gradient(135deg,#ede9fe,#ddd6fe); color: #6c4de6; }
  .i-green  { background: linear-gradient(135deg,#dcfce7,#bbf7d0); color: #16a34a; }
  .i-red    { background: linear-gradient(135deg,#fee2e2,#fecaca); color: #dc2626; }

  .db-trend { display: inline-flex; align-items: center; gap: 3px; border-radius: 7px; padding: 3px 8px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .t-up  { background: #f0fdf4; color: #16a34a; }
  .t-dn  { background: #fff1f1; color: #dc2626; }
  .t-neu { background: #f8fafc; color: #64748b; }

  .db-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: #94a3b8; margin-bottom: 2px; }
  .db-val { font-size: 30px; font-weight: 800; color: #1e1b4b; line-height: 1; letter-spacing: -.02em; }
  .db-ftr { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #94a3b8; padding-top: 10px; border-top: 1px solid #f1f5f9; flex-wrap: wrap; }

  /* Skeleton */
  .db-skel { border-radius: 7px; background: #e8edf3; animation: dbSkelP 1.4s ease-in-out infinite; }
  @keyframes dbSkelP { 0%,100%{opacity:1} 50%{opacity:.4} }

  /* ── Rate card ── */
  .db-rate {
    background: white; border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 2px 4px rgba(0,0,0,0.03), 0 8px 24px rgba(99,78,200,0.06);
    padding: 18px 20px; animation: dbUp .4s .15s ease both;
  }
  .db-rate-hdr { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }
  .db-rate-title { font-size: 14px; font-weight: 800; color: #1e1b4b; display: flex; align-items: center; gap: 7px; }
  .db-rate-pct   { font-size: 22px; font-weight: 800; color: #1e1b4b; }
  .db-rate-sub   { font-size: 11.5px; color: #94a3b8; }

  .db-seg { height: 10px; border-radius: 99px; overflow: hidden; display: flex; gap: 2px; margin-bottom: 9px; }
  .db-seg-p { border-radius: 99px 0 0 99px; background: linear-gradient(90deg,#16a34a,#4ade80); transition: flex .8s cubic-bezier(.34,1.2,.64,1); }
  .db-seg-a { border-radius: 0 99px 99px 0; background: linear-gradient(90deg,#f87171,#dc2626); transition: flex .8s; }
  .db-seg-e { border-radius: 99px; background: #f1f5f9; flex: 1; }

  .db-bar-lbl { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; font-weight: 600; margin-bottom: 10px; }
  .db-legend  { display: flex; gap: 12px; flex-wrap: wrap; }
  .db-leg-item{ display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: #64748b; font-weight: 600; }
  .db-leg-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

  /* ════════════════════════════════════
     RESPONSIVE
  ════════════════════════════════════ */

  /* Large tablet (≤1024px) */
  @media (max-width: 1024px) {
    .db-wrap { padding: 24px 18px; }
    .db-val  { font-size: 26px; }
  }

  /* Tablet portrait (≤768px) — 2-col stats */
  @media (max-width: 768px) {
    .db-wrap { padding: 20px 16px; gap: 14px; }
    .db-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .db-title { font-size: 20px; }
    .db-time-badge { display: none; }
  }

  /* Large phone (≤600px) — 1-col horizontal cards */
  @media (max-width: 600px) {
    .db-wrap { padding: 16px 14px; gap: 12px; }
    .db-grid { grid-template-columns: 1fr; gap: 10px; }

    /* Horizontal card layout on phone */
    .db-card { flex-direction: row; align-items: center; padding: 14px 16px; gap: 14px; }
    .db-card::after { top:0; left:0; right:auto; bottom:0; width:3px; height:auto; border-radius:16px 0 0 16px; }
    .db-card-top { flex-direction: column-reverse; align-items: flex-end; gap: 4px; flex-shrink: 0; }
    .db-ico { width: 36px; height: 36px; }
    .db-card-body { flex: 1; min-width: 0; }
    .db-lbl { font-size: 10.5px; }
    .db-val { font-size: 24px; }
    .db-ftr { display: none; }
    .db-trend { font-size: 10px; }
    .db-title { font-size: 18px; }
    .db-refresh span { display: none; }
    .db-refresh { padding: 7px 10px; }
    .db-rate { padding: 16px; }
    .db-rate-title { font-size: 13px; }
    .db-legend { gap: 8px; }
    .db-leg-item { font-size: 11px; }
  }

  /* Small phone (≤380px) */
  @media (max-width: 380px) {
    .db-wrap { padding: 14px 12px; }
    .db-grid { gap: 8px; }
    .db-card { padding: 12px 14px; }
    .db-val  { font-size: 22px; }
    .db-rate { padding: 14px; }
    .db-eyebrow { font-size: 10px; }
  }
`;

function useClock() {
  const [t, setT] = useState(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  useEffect(() => {
    const id = setInterval(() => setT(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 10000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function StatCard({ title, value, icon, ico, accent, trend, trendLabel, footer, delay, loading }) {
  return (
    <div className={`db-card ${accent}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="db-card-top">
        <div className={`db-ico ${ico}`}>{icon}</div>
        {!loading && <div className={`db-trend ${trend > 0 ? "t-up" : trend < 0 ? "t-dn" : "t-neu"}`}>{trend > 0 ? "↑" : trend < 0 ? "↓" : "–"} {trendLabel}</div>}
      </div>
      <div className="db-card-body">
        <div className="db-lbl">{title}</div>
        {loading
          ? <div className="db-skel" style={{ width: 52, height: 30, marginTop: 4 }}/>
          : <div className="db-val">{value}</div>}
      </div>
      <div className="db-ftr">
        {loading ? <div className="db-skel" style={{ width: "60%", height: 11 }}/> : <>{footer}</>}
      </div>
    </div>
  );
}

function Dashboard() {
  const [employees, setEmployees]   = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const clock = useClock();

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [e, a] = await Promise.all([API.get("/employees/"), API.get("/attendance/")]);
      setEmployees(e.data || []); setAttendance(a.data || []);
    } catch { setEmployees([]); setAttendance([]); }
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  const today   = new Date().toISOString().split("T")[0];
  const present = attendance.filter(a => a.date === today && a.status?.toLowerCase() === "present").length;
  const absent  = attendance.filter(a => a.date === today && a.status?.toLowerCase() === "absent").length;
  const total   = present + absent;
  const rate    = total > 0 ? Math.round((present / total) * 100) : 0;
  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  const cards = [
    { title: "Total Employees", value: employees.length, icon: <Users size={18}/>,        ico: "i-purple", accent: "c-purple", trend: 0,            trendLabel: "All time",        footer: <><Users size={10}/>{employees.length} registered</>,     delay: 0   },
    { title: "Present Today",   value: present,          icon: <CalendarCheck size={18}/>, ico: "i-green",  accent: "c-green",  trend: present > 0 ? 1 : 0,  trendLabel: `${rate}% rate`,   footer: <><CalendarCheck size={10}/>Of {total} marked</>,         delay: 70  },
    { title: "Absent Today",    value: absent,           icon: <CalendarX size={18}/>,     ico: "i-red",    accent: "c-red",    trend: absent > 0 ? -1 : 0,  trendLabel: `${absent} absent`, footer: <><CalendarX size={10}/>{total === 0 ? "No records" : `${100 - rate}% absent`}</>, delay: 140 },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="db-wrap">
        {/* Header */}
        <div className="db-hdr">
          <div>
            <div className="db-eyebrow">{greeting()}, HR Team 👋</div>
            <h1 className="db-title">HR Dashboard</h1>
            <p className="db-sub">Here's what's happening across your workforce today.</p>
          </div>
          <div className="db-hdr-r">
            <div className="db-time-badge"><Clock size={12}/>{clock} · {todayStr}</div>
            <button className={`db-refresh${refreshing ? " spin" : ""}`} onClick={() => load(true)} disabled={refreshing}>
              <RefreshCw size={13}/><span>{refreshing ? "Refreshing…" : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="db-grid">
          {cards.map(c => <StatCard key={c.title} {...c} loading={loading}/>)}
        </div>

        {/* Rate card */}
        <div className="db-rate">
          <div className="db-rate-hdr">
            <div>
              <div className="db-rate-title"><TrendingUp size={15} style={{ color: "#7c52e8" }}/>Today's Attendance Rate</div>
              <div className="db-rate-sub">Based on records for {todayStr}</div>
            </div>
            {!loading && <div style={{ textAlign: "right" }}><div className="db-rate-pct">{rate}%</div><div className="db-rate-sub">{present} of {total} present</div></div>}
          </div>

          {loading ? (
            <><div className="db-skel" style={{ width: "100%", height: 10, borderRadius: 99, marginBottom: 9 }}/><div className="db-skel" style={{ width: "40%", height: 11, borderRadius: 7 }}/></>
          ) : total === 0 ? (
            <><div className="db-seg"><div className="db-seg-e"/></div><div className="db-bar-lbl"><span>No attendance marked today</span><span>—</span></div></>
          ) : (
            <>
              <div className="db-seg">
                <div className="db-seg-p" style={{ flex: present }}/>
                {absent > 0 && <div className="db-seg-a" style={{ flex: absent }}/>}
              </div>
              <div className="db-bar-lbl"><span>{present} Present</span><span>{absent} Absent</span></div>
              <div className="db-legend">
                <div className="db-leg-item"><div className="db-leg-dot" style={{ background: "#22c55e" }}/>Present — {rate}%</div>
                <div className="db-leg-item"><div className="db-leg-dot" style={{ background: "#f87171" }}/>Absent — {100 - rate}%</div>
                <div className="db-leg-item"><div className="db-leg-dot" style={{ background: "#c4b5fd" }}/>Total — {total}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;