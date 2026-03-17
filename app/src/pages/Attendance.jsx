import { useEffect, useState } from "react";
import API from "../api/api";
import AttendanceForm from "../components/attendance/AttendanceForm";
import AttendanceList from "../components/attendance/AttendanceList";
import { CalendarCheck, Loader2, AlertCircle, User, Mail, Building2, CalendarX, BarChart2, ChevronDown } from "lucide-react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .at-wrap {
    font-family: 'Plus Jakarta Sans', sans-serif;
    width: 100%; max-width: 860px; margin: 0 auto;
    padding: 28px 20px; display: flex; flex-direction: column; gap: 18px;
  }

  /* ── Page header ── */
  .at-ph { display: flex; align-items: center; gap: 13px; }
  .at-ph-ico { width: 46px; height: 46px; border-radius: 14px; background: linear-gradient(135deg,#6c4de6,#9b74f0); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; box-shadow: 0 4px 12px rgba(108,77,230,0.28); }
  .at-eyebrow { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; color: #7c52e8; margin-bottom: 3px; }
  .at-title   { font-size: 22px; font-weight: 800; color: #1e1b4b; line-height: 1.1; }
  .at-sub     { font-size: 13px; color: #94a3b8; margin-top: 2px; }

  /* ── Card base ── */
  .at-card {
    background: white; border-radius: 18px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 2px 4px rgba(0,0,0,0.03), 0 8px 24px rgba(99,78,200,0.06);
    overflow: hidden; width: 100%;
    animation: atUp .35s ease both;
  }
  @keyframes atUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* ── Selector card ── */
  .at-sel-hdr {
    background: linear-gradient(135deg,#5b3fd4,#7c52e8 55%,#9b74f0);
    padding: 18px 20px 16px; position: relative; overflow: hidden;
  }
  .at-sel-hdr::before { content:''; position:absolute; width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,0.07); top:-36px; right:-28px; }
  .at-sel-hdr-inner { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
  .at-sel-ico { width: 38px; height: 38px; border-radius: 11px; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
  .at-sel-ttl { font-size: 14px; font-weight: 800; color: white; margin-bottom: 2px; }
  .at-sel-sub { font-size: 12px; color: rgba(255,255,255,0.65); }

  .at-sel-body { padding: 16px 20px; background: #f8fafc; }
  .at-sel-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: #374151; margin-bottom: 7px; display: flex; align-items: center; gap: 5px; }
  .at-sel-lbl-ico { color: #7c52e8; display: flex; }
  .at-sel-wrap { position: relative; }
  .at-sel-field-ico    { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #a5b4c4; pointer-events: none; display: flex; transition: color .2s; }
  .at-sel-chevron      { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #a5b4c4; pointer-events: none; display: flex; }
  .at-sel-wrap:focus-within .at-sel-field-ico { color: #7c52e8; }
  .at-select {
    width: 100%; padding: 12px 36px 12px 38px;
    border-radius: 11px; border: 1.5px solid #e2e8f0;
    background: white; color: #1e293b; font-size: 14px; font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif; outline: none;
    appearance: none; -webkit-appearance: none;
    transition: border-color .2s, box-shadow .2s; cursor: pointer; min-height: 46px;
  }
  .at-select:hover { border-color: #c4b5fd; }
  .at-select:focus { border-color: #7c52e8; box-shadow: 0 0 0 4px rgba(124,82,232,0.1); }
  .at-loading { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 13px; font-weight: 500; padding: 10px 0; }

  /* ── Employee info card ── */
  .at-emp-card {
    background: white; border-radius: 18px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 2px 4px rgba(0,0,0,0.03), 0 8px 24px rgba(99,78,200,0.06);
    padding: 16px 18px; display: flex; align-items: center; gap: 13px;
    flex-wrap: wrap; position: relative; overflow: hidden; width: 100%;
    animation: atUp .3s ease both;
  }
  .at-emp-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#6c4de6,#9b74f0); border-radius:18px 18px 0 0; }
  .at-emp-av { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: white; flex-shrink: 0; box-shadow: 0 3px 10px rgba(108,77,230,0.2); }
  .at-emp-name { font-size: 15px; font-weight: 800; color: #1e1b4b; margin-bottom: 4px; }
  .at-emp-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .at-emp-meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #64748b; font-weight: 500; }
  .at-emp-meta-ico  { color: #a5b4c4; display: flex; }
  .at-emp-id { margin-left: auto; display: inline-flex; background: #f1f5f9; border-radius: 8px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; color: #475569; flex-shrink: 0; }

  /* ── Stats row ── */
  .at-stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 13px; width: 100%; }
  .at-stat-mini {
    background: white; border-radius: 14px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 2px 4px rgba(0,0,0,0.03), 0 6px 16px rgba(99,78,200,0.05);
    padding: 15px 16px; position: relative; overflow: hidden;
    animation: atUp .35s ease both;
  }
  .at-stat-mini::after { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:14px 14px 0 0; }
  .at-sm-green::after  { background: linear-gradient(90deg,#16a34a,#4ade80); }
  .at-sm-red::after    { background: linear-gradient(90deg,#dc2626,#f87171); }
  .at-sm-purple::after { background: linear-gradient(90deg,#6c4de6,#9b74f0); }
  .at-mini-ico { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 9px; }
  .at-ico-g { background: linear-gradient(135deg,#dcfce7,#bbf7d0); color: #16a34a; }
  .at-ico-r { background: linear-gradient(135deg,#fee2e2,#fecaca); color: #dc2626; }
  .at-ico-p { background: linear-gradient(135deg,#ede9fe,#ddd6fe); color: #6c4de6; }
  .at-mini-lbl { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: #94a3b8; margin-bottom: 3px; }
  .at-mini-val { font-size: 24px; font-weight: 800; color: #1e1b4b; line-height: 1; letter-spacing: -.02em; }
  .at-mini-sub { font-size: 11px; color: #94a3b8; margin-top: 4px; }
  .at-mini-bar { height: 4px; border-radius: 99px; background: #f1f5f9; overflow: hidden; margin-top: 8px; }
  .at-mini-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg,#6c4de6,#9b74f0); transition: width .8s cubic-bezier(.34,1.2,.64,1); }

  /* ── Error ── */
  .at-error { display: flex; align-items: center; gap: 9px; background: #fff1f1; border: 1.5px solid #fca5a5; border-radius: 13px; padding: 12px 15px; font-size: 13px; font-weight: 600; color: #dc2626; animation: atUp .3s ease both; }

  /* ── Empty prompt ── */
  .at-empty { background: white; border-radius: 18px; border: 2px dashed #e2e8f0; padding: 48px 20px; text-align: center; animation: atUp .35s ease both; width: 100%; }
  .at-empty-ico { width: 58px; height: 58px; border-radius: 18px; background: linear-gradient(135deg,#ede9fe,#ddd6fe); display: flex; align-items: center; justify-content: center; color: #7c52e8; margin: 0 auto 13px; }
  .at-empty-ttl { font-size: 15px; font-weight: 800; color: #1e1b4b; margin-bottom: 5px; }
  .at-empty-sub { font-size: 13px; color: #94a3b8; }

  /* ════════════════════════════════════
     RESPONSIVE
  ════════════════════════════════════ */

  /* Tablet */
  @media (max-width: 768px) {
    .at-wrap { padding: 22px 16px; gap: 15px; }
    .at-title { font-size: 20px; }
    .at-stats-row { grid-template-columns: 1fr 1fr; }
    .at-stat-mini:last-child { grid-column: span 2; }
    .at-sel-hdr  { padding: 16px 18px 14px; }
    .at-sel-body { padding: 14px 18px; }
    .at-emp-card { padding: 14px 16px; }
  }

  /* Large phone */
  @media (max-width: 520px) {
    .at-wrap { padding: 16px 14px; gap: 13px; }
    .at-title { font-size: 18px; }
    .at-ph-ico { width: 40px; height: 40px; }
    .at-sel-hdr  { padding: 14px 16px 12px; }
    .at-sel-body { padding: 13px 16px; }
    .at-select   { font-size: 16px; } /* prevent iOS zoom */
    .at-emp-card { gap: 10px; }
    .at-emp-av   { width: 40px; height: 40px; font-size: 13px; }
    .at-emp-id   { display: none; }
    .at-mini-val { font-size: 20px; }
    .at-stat-mini { padding: 13px 14px; }
    .at-stats-row { gap: 10px; }
  }

  /* Small phone */
  @media (max-width: 380px) {
    .at-wrap { padding: 13px 12px; gap: 11px; }
    .at-title { font-size: 17px; }
    .at-stats-row { grid-template-columns: 1fr; }
    .at-stat-mini:last-child { grid-column: span 1; }
    .at-sel-hdr  { padding: 13px 14px 11px; }
    .at-sel-body { padding: 12px 14px; }
    .at-emp-meta-item:nth-child(2) { display: none; } /* hide email on tiny screens */
    .at-empty { padding: 36px 16px; }
  }
`;

const GRADS = [["#6c4de6","#9b74f0"],["#0f766e","#14b8a6"],["#b45309","#f59e0b"],["#be123c","#f43f5e"],["#1d4ed8","#60a5fa"],["#7c3aed","#a78bfa"]];
function avStyle(n = "") { const i = (n.charCodeAt(0)||0) % GRADS.length; return { background: `linear-gradient(135deg,${GRADS[i][0]},${GRADS[i][1]})` }; }
function ini(n = "") { return n.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase() || "??"; }

function Attendance() {
  const [employees, setEmployees]               = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [attendance, setAttendance]             = useState([]);
  const [loadingEmp, setLoadingEmp]             = useState(false);
  const [loadingAtt, setLoadingAtt]             = useState(false);
  const [error, setError]                       = useState("");

  async function fetchEmployees() {
    setLoadingEmp(true); setError("");
    try { const r = await API.get("/employees/"); setEmployees(r.data || []); }
    catch { setError("Failed to load employees."); }
    finally { setLoadingEmp(false); }
  }

  async function fetchAttendance(id) {
    if (!id) return;
    setLoadingAtt(true);
    try { const r = await API.get(`/attendance/${id}`); setAttendance(r.data || []); }
    catch { setAttendance([]); }
    finally { setLoadingAtt(false); }
  }

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { if (selectedEmployee) fetchAttendance(selectedEmployee); }, [selectedEmployee]);

  const emp = employees.find(e => e.id === Number(selectedEmployee));
  const presentDays = attendance.filter(r => r.status?.toLowerCase() === "present").length;
  const absentDays  = attendance.filter(r => r.status?.toLowerCase() === "absent").length;
  const total = attendance.length;
  const rate  = total > 0 ? Math.round((presentDays / total) * 100) : 0;

  return (
    <>
      <style>{CSS}</style>
      <div className="at-wrap">

        {/* Page header */}
        <div className="at-ph">
          <div className="at-ph-ico"><CalendarCheck size={20}/></div>
          <div>
            <div className="at-eyebrow">HR Module</div>
            <h1 className="at-title">Attendance</h1>
            <p className="at-sub">Track and manage employee attendance records</p>
          </div>
        </div>

        {error && <div className="at-error"><AlertCircle size={14}/>{error}</div>}

        {/* Selector */}
        <div className="at-card">
          <div className="at-sel-hdr">
            <div className="at-sel-hdr-inner">
              <div className="at-sel-ico"><User size={17}/></div>
              <div><div className="at-sel-ttl">Select Employee</div><div className="at-sel-sub">Choose an employee to view or mark attendance</div></div>
            </div>
          </div>
          <div className="at-sel-body">
            <div className="at-sel-lbl"><span className="at-sel-lbl-ico"><User size={11}/></span>Employee <span style={{ color: "#f87171" }}>*</span></div>
            {loadingEmp ? (
              <div className="at-loading"><Loader2 size={14} className="animate-spin" style={{ color: "#7c52e8" }}/>Loading employees…</div>
            ) : (
              <div className="at-sel-wrap">
                <span className="at-sel-field-ico"><User size={14}/></span>
                <select value={selectedEmployee} onChange={e => { setSelectedEmployee(e.target.value); setAttendance([]); }} className="at-select">
                  <option value="">— Choose an employee —</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>)}
                </select>
                <span className="at-sel-chevron"><ChevronDown size={14}/></span>
              </div>
            )}
          </div>
        </div>

        {/* Empty prompt */}
        {!selectedEmployee && !loadingEmp && (
          <div className="at-empty">
            <div className="at-empty-ico"><CalendarCheck size={26}/></div>
            <div className="at-empty-ttl">No Employee Selected</div>
            <div className="at-empty-sub">Select an employee above to manage attendance.</div>
          </div>
        )}

        {/* Selected employee view */}
        {selectedEmployee && (
          <>
            {emp && (
              <div className="at-emp-card" style={{ animationDelay: "50ms" }}>
                <div className="at-emp-av" style={avStyle(emp.full_name)}>{ini(emp.full_name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="at-emp-name">{emp.full_name}</div>
                  <div className="at-emp-meta">
                    <div className="at-emp-meta-item"><span className="at-emp-meta-ico"><Building2 size={11}/></span>{emp.department}</div>
                    <div className="at-emp-meta-item"><span className="at-emp-meta-ico"><Mail size={11}/></span>{emp.email}</div>
                  </div>
                </div>
                <div className="at-emp-id"># {emp.employee_id}</div>
              </div>
            )}

            {/* Stats */}
            {!loadingAtt && total > 0 && (
              <div className="at-stats-row">
                {[
                  { lbl: "Present Days", val: presentDays, sub: `of ${total} total`, ico: <CalendarCheck size={13}/>, icoCls: "at-ico-g", acc: "at-sm-green", delay: 80 },
                  { lbl: "Absent Days",  val: absentDays,  sub: `${100-rate}% absence`, ico: <CalendarX size={13}/>, icoCls: "at-ico-r", acc: "at-sm-red", delay: 130 },
                  { lbl: "Attendance Rate", val: `${rate}%`, sub: "Overall", ico: <BarChart2 size={13}/>, icoCls: "at-ico-p", acc: "at-sm-purple", bar: true, barVal: rate, delay: 180 },
                ].map(({ lbl, val, sub, ico, icoCls, acc, bar, barVal, delay }) => (
                  <div key={lbl} className={`at-stat-mini ${acc}`} style={{ animationDelay: `${delay}ms` }}>
                    <div className={`at-mini-ico ${icoCls}`}>{ico}</div>
                    <div className="at-mini-lbl">{lbl}</div>
                    <div className="at-mini-val">{val}</div>
                    <div className="at-mini-sub">{sub}</div>
                    {bar && <div className="at-mini-bar"><div className="at-mini-fill" style={{ width: `${barVal}%` }}/></div>}
                  </div>
                ))}
              </div>
            )}

            <AttendanceForm employeeId={selectedEmployee} refresh={() => fetchAttendance(selectedEmployee)}/>
            <AttendanceList attendance={attendance} loading={loadingAtt}/>
          </>
        )}
      </div>
    </>
  );
}

export default Attendance;