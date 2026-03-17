import { useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .al-wrap {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: white; border-radius: 18px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 10px 32px rgba(99,78,200,0.08);
    overflow: hidden; width: 100%;
    animation: alUp .35s ease both;
  }
  @keyframes alUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* ── Header ── */
  .al-hdr {
    background: linear-gradient(135deg,#5b3fd4,#7c52e8 55%,#9b74f0);
    padding: 18px 20px 16px; position: relative; overflow: hidden;
  }
  .al-hdr::before { content:''; position:absolute; width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,0.07); top:-36px; right:-28px; }
  .al-hdr-top {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 10px; position: relative; z-index: 1; flex-wrap: wrap;
  }
  .al-hdr-left { display: flex; align-items: center; gap: 10px; }
  .al-hdr-ico  { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
  .al-hdr-ttl  { font-size: 15px; font-weight: 800; color: white; margin-bottom: 2px; }
  .al-hdr-sub  { font-size: 12px; color: rgba(255,255,255,0.65); }

  .al-filter {
    display: flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.22);
    border-radius: 10px; padding: 7px 12px; flex-shrink: 0;
  }
  .al-filter input[type="date"] {
    background: transparent; border: none; outline: none;
    color: white; font-size: 12px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; color-scheme: dark;
    width: 120px;
  }
  .al-filter-ico { color: rgba(255,255,255,0.7); display: flex; flex-shrink: 0; }

  .al-stats { display: flex; align-items: center; gap: 8px; margin-top: 11px; position: relative; z-index: 1; flex-wrap: wrap; }
  .al-pill  { display: inline-flex; align-items: center; gap: 5px; border-radius: 99px; padding: 3px 10px; font-size: 11px; font-weight: 600; white-space: nowrap; }
  .al-p-total   { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); border: 1px solid rgba(255,255,255,0.18); }
  .al-p-present { background: rgba(134,239,172,0.2); color: #86efac; border: 1px solid rgba(134,239,172,0.25); }
  .al-p-absent  { background: rgba(252,165,165,0.2); color: #fca5a5; border: 1px solid rgba(252,165,165,0.25); }
  .al-pdot { width: 6px; height: 6px; border-radius: 50%; }
  .al-pd-t { background: rgba(255,255,255,0.7); }
  .al-pd-p { background: #86efac; }
  .al-pd-a { background: #fca5a5; }
  .al-clear { margin-left: auto; display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.13); border: 1px solid rgba(255,255,255,0.18); border-radius: 7px; padding: 3px 9px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.8); cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: background .15s; white-space: nowrap; }
  .al-clear:hover { background: rgba(255,255,255,0.22); }

  /* ════════════════════════════════════
     DESKTOP TABLE (≥541px)
  ════════════════════════════════════ */
  .al-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .al-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .al-thead { background: #f8fafc; }
  .al-th {
    padding: 10px 18px; text-align: left;
    font-size: 10.5px; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: .07em;
    border-bottom: 1px solid #f1f5f9; white-space: nowrap;
  }
  .al-th:last-child { text-align: right; }
  .al-tr { border-bottom: 1px solid #f8fafc; transition: background .12s; }
  .al-tr:last-child { border-bottom: none; }
  .al-tr:hover { background: #faf8ff; }
  .al-td { padding: 13px 18px; vertical-align: middle; }
  .al-date-cell { display: flex; align-items: center; gap: 9px; }
  .al-date-ico { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg,#ede9fe,#ddd6fe); display: flex; align-items: center; justify-content: center; color: #7c52e8; flex-shrink: 0; }
  .al-date-main { font-size: 13px; font-weight: 700; color: #1e293b; }
  .al-date-day  { font-size: 11px; color: #94a3b8; margin-top: 1px; }
  .al-badge { display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; padding: 5px 11px; font-size: 12px; font-weight: 700; }
  .al-badge-p { background: #f0fdf4; color: #16a34a; border: 1.5px solid #bbf7d0; }
  .al-badge-a { background: #fff1f1; color: #dc2626; border: 1.5px solid #fecaca; }
  .al-bdot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .al-bdot-p { background: #22c55e; }
  .al-bdot-a { background: #f87171; }
  .al-td-r { text-align: right; }

  /* ════════════════════════════════════
     MOBILE CARD LIST (≤540px)
  ════════════════════════════════════ */
  .al-mob { display: none; flex-direction: column; }
  .al-mob-item {
    display: flex; align-items: center; gap: 11px;
    padding: 12px 16px; border-bottom: 1px solid #f8fafc;
    transition: background .12s;
  }
  .al-mob-item:last-child { border-bottom: none; }
  .al-mob-item:hover { background: #faf8ff; }
  .al-mob-ico { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,#ede9fe,#ddd6fe); display: flex; align-items: center; justify-content: center; color: #7c52e8; flex-shrink: 0; }
  .al-mob-main { font-size: 13.5px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
  .al-mob-day  { font-size: 11px; color: #94a3b8; }

  /* Footer */
  .al-footer {
    padding: 10px 18px; border-top: 1px solid #f1f5f9; background: #fafbfd;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 11.5px; color: #94a3b8; flex-wrap: wrap; gap: 6px;
  }
  .al-rate { display: flex; align-items: center; gap: 4px; font-size: 11.5px; font-weight: 600; color: #16a34a; }

  /* ── Empty / Loading ── */
  .al-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; text-align: center; gap: 12px; }
  .al-state-ico { width: 54px; height: 54px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
  .al-sico-e { background: linear-gradient(135deg,#ede9fe,#ddd6fe); color: #7c52e8; }
  .al-state-ttl { font-size: 15px; font-weight: 700; color: #1e1b4b; }
  .al-state-sub { font-size: 13px; color: #94a3b8; }

  .al-skel-row { display: flex; align-items: center; gap: 11px; padding: 13px 18px; border-bottom: 1px solid #f8fafc; }
  .al-skel { border-radius: 7px; background: #e8edf3; animation: alSkelP 1.4s ease-in-out infinite; }
  @keyframes alSkelP { 0%,100%{opacity:1} 50%{opacity:.4} }

  .al-nf { padding: 26px; text-align: center; font-size: 13px; color: #94a3b8; font-weight: 500; border-top: 1px solid #f1f5f9; }

  /* ════════════════════════════════════
     RESPONSIVE
  ════════════════════════════════════ */

  /* Tablet */
  @media (max-width: 768px) {
    .al-hdr { padding: 16px 18px 14px; }
    .al-th, .al-td, .al-skel-row { padding-left: 16px; padding-right: 16px; }
    .al-footer { padding: 10px 16px; }
  }

  /* Phone: hide table, show card list */
  @media (max-width: 540px) {
    .al-hdr { padding: 14px 16px 13px; }
    .al-hdr-top { flex-direction: column; align-items: flex-start; gap: 8px; }
    .al-filter { width: 100%; }
    .al-filter input[type="date"] { flex: 1; width: auto; }
    .al-table-wrap { display: none; }
    .al-mob { display: flex; }
    .al-footer { padding: 9px 14px; }
    .al-skel-row { padding: 12px 14px; }
  }

  /* Small phone */
  @media (max-width: 380px) {
    .al-hdr { padding: 13px 14px 11px; }
    .al-hdr-ttl { font-size: 14px; }
    .al-stats { gap: 5px; }
    .al-pill { font-size: 10px; padding: 2px 8px; }
    .al-footer { padding: 9px 12px; }
    .al-mob-item { padding: 11px 12px; }
  }
`;

function Badge({ status }) {
  const p = status?.toLowerCase() === "present";
  return (
    <span className={`al-badge ${p ? "al-badge-p" : "al-badge-a"}`}>
      <span className={`al-bdot ${p ? "al-bdot-p" : "al-bdot-a"}`}/>
      {p ? "Present" : "Absent"}
    </span>
  );
}

function SkeletonRows() {
  return [70, 85, 60, 90].map((w, i) => (
    <div key={i} className="al-skel-row" style={{ animationDelay: `${i * 90}ms` }}>
      <div className="al-skel" style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0 }}/>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <div className="al-skel" style={{ width: `${w}%`, height: 12 }}/>
        <div className="al-skel" style={{ width: "40%", height: 10 }}/>
      </div>
      <div className="al-skel" style={{ width: 68, height: 26, borderRadius: 8 }}/>
    </div>
  ));
}

function AttendanceList({ attendance = [], loading }) {
  const [filter, setFilter] = useState("");

  const filtered     = attendance.filter(r => filter ? r.date === filter : true);
  const presentCount = attendance.filter(r => r.status?.toLowerCase() === "present").length;
  const absentCount  = attendance.length - presentCount;
  const rate         = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;

  const fmt = d => {
    const dt = new Date(d);
    return {
      main: dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      day:  dt.toLocaleDateString("en-US", { weekday: "long" }),
    };
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="al-wrap">
        {/* Header */}
        <div className="al-hdr">
          <div className="al-hdr-top">
            <div className="al-hdr-left">
              <div className="al-hdr-ico"><Calendar size={18}/></div>
              <div><div className="al-hdr-ttl">Attendance History</div><div className="al-hdr-sub">Track employee daily attendance</div></div>
            </div>
            {!loading && attendance.length > 0 && (
              <div className="al-filter">
                <span className="al-filter-ico"><Calendar size={13}/></span>
                <input type="date" value={filter} onChange={e => setFilter(e.target.value)} max={new Date().toISOString().split("T")[0]}/>
              </div>
            )}
          </div>
          {!loading && attendance.length > 0 && (
            <div className="al-stats">
              <div className="al-pill al-p-total"><span className="al-pdot al-pd-t"/>{attendance.length} Records</div>
              <div className="al-pill al-p-present"><span className="al-pdot al-pd-p"/>{presentCount} Present</div>
              <div className="al-pill al-p-absent"><span className="al-pdot al-pd-a"/>{absentCount} Absent</div>
              {filter && <button className="al-clear" onClick={() => setFilter("")}>Clear ×</button>}
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && <div><SkeletonRows/></div>}

        {/* Empty */}
        {!loading && attendance.length === 0 && (
          <div className="al-state">
            <div className="al-state-ico al-sico-e"><Calendar size={24}/></div>
            <div>
              <div className="al-state-ttl">No Attendance Records Yet</div>
              <div className="al-state-sub">Attendance will appear here once marked.</div>
            </div>
          </div>
        )}

        {/* Desktop table */}
        {!loading && attendance.length > 0 && (
          <>
            <div className="al-table-wrap">
              <table className="al-table">
                <thead className="al-thead">
                  <tr>
                    <th className="al-th">Date</th>
                    <th className="al-th" style={{ textAlign: "right" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => {
                    const { main, day } = fmt(item.date);
                    return (
                      <tr key={item.id} className="al-tr" style={{ animationDelay: `${idx * 30}ms` }}>
                        <td className="al-td">
                          <div className="al-date-cell">
                            <div className="al-date-ico"><Calendar size={14}/></div>
                            <div><div className="al-date-main">{main}</div><div className="al-date-day">{day}</div></div>
                          </div>
                        </td>
                        <td className="al-td al-td-r"><Badge status={item.status}/></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="al-mob">
              {filtered.map((item, idx) => {
                const { main, day } = fmt(item.date);
                return (
                  <div key={item.id} className="al-mob-item" style={{ animationDelay: `${idx * 30}ms` }}>
                    <div className="al-mob-ico"><Calendar size={16}/></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="al-mob-main">{main}</div>
                      <div className="al-mob-day">{day}</div>
                    </div>
                    <Badge status={item.status}/>
                  </div>
                );
              })}
            </div>

            {filter && filtered.length === 0 && (
              <div className="al-nf">No record for <strong style={{ color: "#475569" }}>{new Date(filter).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.</div>
            )}

            <div className="al-footer">
              <span>Showing <strong style={{ color: "#475569" }}>{filtered.length}</strong> of <strong style={{ color: "#475569" }}>{attendance.length}</strong></span>
              <div className="al-rate"><TrendingUp size={12}/>{rate}% rate</div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default AttendanceList;