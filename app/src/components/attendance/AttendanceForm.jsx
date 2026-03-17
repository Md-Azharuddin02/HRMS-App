import { useState, useCallback, useEffect, memo } from "react";
import API from "../../api/api";
import { Calendar, CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .af-wrap {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: white; border-radius: 18px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 10px 32px rgba(99,78,200,0.08);
    overflow: hidden; width: 100%;
    animation: afUp .35s ease both;
  }
  @keyframes afUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .af-hdr {
    background: linear-gradient(135deg,#5b3fd4,#7c52e8 55%,#9b74f0);
    padding: 18px 20px 16px; position: relative; overflow: hidden;
  }
  .af-hdr::before { content:''; position:absolute; width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,0.07); top:-36px; right:-28px; }
  .af-hdr-row { display: flex; align-items: center; gap: 11px; position: relative; z-index: 1; }
  .af-hdr-ico { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
  .af-hdr-ttl { font-size: 15px; font-weight: 800; color: white; margin-bottom: 2px; }
  .af-hdr-sub { font-size: 12px; color: rgba(255,255,255,0.65); }
  .af-clock {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.13); border: 1px solid rgba(255,255,255,0.2);
    border-radius: 99px; padding: 4px 10px; margin-top: 11px;
    position: relative; z-index: 1;
    font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,0.88);
  }
  .af-dot { width: 7px; height: 7px; border-radius: 50%; background: #86efac; box-shadow: 0 0 0 3px rgba(134,239,172,0.3); animation: afPulse 1.8s ease-in-out infinite; }
  @keyframes afPulse { 0%,100%{box-shadow:0 0 0 2px rgba(134,239,172,0.3)} 50%{box-shadow:0 0 0 5px rgba(134,239,172,0.13)} }

  .af-body { padding: 18px 20px 20px; background: #f8fafc; }

  .af-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .af-lbl { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: .07em; }
  .af-lbl-ico { color: #7c52e8; display: flex; }
  .af-req     { color: #f87171; }

  .af-iw { position: relative; }
  .af-ico { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #a5b4c4; pointer-events: none; display: flex; transition: color .2s; }
  .af-iw:focus-within .af-ico { color: #7c52e8; }
  .af-input {
    width: 100%; padding: 12px 12px 12px 38px;
    border-radius: 11px; border: 1.5px solid #e2e8f0;
    background: white; color: #1e293b; font-size: 14px; font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif; outline: none;
    transition: border-color .2s, box-shadow .2s;
    -webkit-appearance: none; appearance: none; min-height: 46px;
  }
  .af-input:hover { border-color: #c4b5fd; }
  .af-input:focus { border-color: #7c52e8; box-shadow: 0 0 0 4px rgba(124,82,232,0.1); }
  .af-input.af-err { border-color: #f87171; background: #fff8f8; }
  .af-errmsg { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: #f87171; font-weight: 500; }

  /* Status cards */
  .af-status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .af-sc {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 12px; border-radius: 11px;
    border: 1.5px solid #e2e8f0; background: white;
    cursor: pointer; transition: all .15s;
    font-family: 'Plus Jakarta Sans', sans-serif; text-align: left; width: 100%; min-height: 52px;
  }
  .af-sc:hover { border-color: #c4b5fd; background: #faf8ff; }
  .af-sc.af-sel-p { border-color: #22c55e; background: #f0fdf4; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
  .af-sc.af-sel-a { border-color: #f87171; background: #fff8f8; box-shadow: 0 0 0 3px rgba(248,113,113,0.1); }
  .af-sc-dot { width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .af-dp { background: #dcfce7; color: #16a34a; }
  .af-da { background: #fee2e2; color: #dc2626; }
  .af-sc-lbl { font-size: 13px; font-weight: 700; }
  .af-sc-sub { font-size: 11px; color: #94a3b8; margin-top: 1px; }
  .af-sc-chk { margin-left: auto; width: 17px; height: 17px; border-radius: 99px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .af-chk-p { background: #22c55e; color: white; }
  .af-chk-a { background: #f87171; color: white; }
  .af-chk-e { background: #e2e8f0; }

  .af-submit {
    width: 100%; padding: 13px; border-radius: 11px; border: none;
    background: linear-gradient(135deg,#6c4de6,#8b5cf6);
    color: white; font-size: 14px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 18px rgba(108,77,230,0.28); transition: all .18s; margin-top: 18px; min-height: 48px;
  }
  .af-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 26px rgba(108,77,230,0.38); }
  .af-submit:disabled { opacity: .65; cursor: not-allowed; }

  .af-toast { display: flex; align-items: flex-start; gap: 9px; border-radius: 11px; padding: 11px 14px; font-size: 12.5px; font-weight: 600; margin-top: 12px; animation: afToast .25s cubic-bezier(.34,1.4,.64,1) both; word-break: break-word; }
  @keyframes afToast { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
  .af-toast-err { background: #fff1f1; border: 1.5px solid #fca5a5; color: #dc2626; }
  .af-toast-ok  { background: #f0fdf4; border: 1.5px solid #86efac; color: #16a34a; }
  .af-toast-ico { flex-shrink: 0; margin-top: 1px; }
  .af-toast-ttl { font-weight: 700; margin-bottom: 1px; }
  .af-toast-sub { font-size: 11.5px; font-weight: 400; opacity: .8; }
  .af-prog      { height: 3px; border-radius: 99px; background: #bbf7d0; overflow: hidden; margin-top: 7px; }
  .af-prog-fill { height: 100%; border-radius: 99px; background: #22c55e; animation: afProg 2.5s linear forwards; }
  @keyframes afProg { from{width:100%} to{width:0%} }

  /* ── Tablet ── */
  @media (max-width: 768px) {
    .af-hdr  { padding: 16px 18px 14px; }
    .af-body { padding: 16px 18px 18px; }
  }

  /* ── Phone ── */
  @media (max-width: 520px) {
    .af-hdr  { padding: 14px 16px 13px; }
    .af-body { padding: 14px 16px 16px; }
    .af-input { font-size: 16px; } /* prevent iOS zoom */
    .af-sc-sub { display: none; }
    .af-sc { padding: 11px 10px; gap: 8px; }
  }

  /* ── Small phone ── */
  @media (max-width: 380px) {
    .af-hdr  { padding: 13px 14px 11px; }
    .af-body { padding: 13px 14px 15px; }
    .af-hdr-ico { width: 36px; height: 36px; }
    .af-status-grid { grid-template-columns: 1fr; }
    .af-clock { display: none; }
  }
`;

function useClock() {
  const [t, setT] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  useEffect(() => {
    const id = setInterval(() => setT(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function AttendanceForm({ employeeId, refresh }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm]       = useState({ date: today, status: "present" });
  const [dateErr, setDateErr] = useState("");
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const clock = useClock();

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(false), 2500); return () => clearTimeout(t); }
  }, [success]);

  const change = useCallback((e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (name === "date") setDateErr("");
    setErr("");
  }, []);

  const submit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.date) { setDateErr("Please select a date."); return; }
    setDateErr(""); setErr(""); setSuccess(false); setLoading(true);
    try {
      await API.post("/attendance/", { employee_id: Number(employeeId), date: form.date, status: form.status });
      setForm({ date: today, status: "present" });
      setSuccess(true); refresh();
    } catch (e) {
      if      (e.response?.status === 409) setErr("Attendance already marked for this date.");
      else if (e.response?.status === 404) setErr("Employee not found.");
      else setErr("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }, [form, employeeId, refresh, today]);

  const opts = [
    { v: "present", lbl: "Present", sub: "Attended",   dot: "af-dp", chk: "af-chk-p", sel: "af-sel-p", ico: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { v: "absent",  lbl: "Absent",  sub: "Was away",   dot: "af-da", chk: "af-chk-a", sel: "af-sel-a", ico: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="af-wrap">
        <div className="af-hdr">
          <div className="af-hdr-row">
            <div className="af-hdr-ico"><Calendar size={19}/></div>
            <div><div className="af-hdr-ttl">Mark Attendance</div><div className="af-hdr-sub">Record daily attendance status</div></div>
          </div>
          <div className="af-clock"><div className="af-dot"/><Clock size={11}/>{clock}</div>
        </div>
        <div className="af-body">
          <form onSubmit={submit} noValidate>
            <div className="af-field">
              <label className="af-lbl" htmlFor="af-date">
                <span className="af-lbl-ico"><Calendar size={12}/></span>Date <span className="af-req">*</span>
              </label>
              <div className="af-iw">
                <span className="af-ico"><Calendar size={14}/></span>
                <input id="af-date" type="date" name="date" value={form.date} onChange={change}
                  max={today} className={`af-input${dateErr ? " af-err" : ""}`}/>
              </div>
              {dateErr && <div className="af-errmsg"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{dateErr}</div>}
            </div>

            <div className="af-field">
              <label className="af-lbl">
                <span className="af-lbl-ico"><CheckCircle size={12}/></span>Status <span className="af-req">*</span>
              </label>
              <div className="af-status-grid">
                {opts.map(o => {
                  const sel = form.status === o.v;
                  return (
                    <button key={o.v} type="button" onClick={() => { setForm(p => ({ ...p, status: o.v })); setErr(""); }}
                      className={`af-sc${sel ? ` ${o.sel}` : ""}`}>
                      <div className={`af-sc-dot ${o.dot}`}>{o.ico}</div>
                      <div>
                        <div className="af-sc-lbl" style={{ color: sel ? (o.v === "present" ? "#16a34a" : "#dc2626") : "#1e293b" }}>{o.lbl}</div>
                        <div className="af-sc-sub">{o.sub}</div>
                      </div>
                      <div className={`af-sc-chk ${sel ? o.chk : "af-chk-e"}`}>
                        {sel && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="af-submit" disabled={loading}>
              {loading ? <><Loader2 size={14} className="animate-spin"/>Processing…</> : <><CheckCircle size={14}/>Mark Attendance</>}
            </button>

            {err && (
              <div className="af-toast af-toast-err">
                <span className="af-toast-ico"><AlertCircle size={14}/></span>
                <div><div className="af-toast-ttl">Could not mark</div><div className="af-toast-sub">{err}</div></div>
              </div>
            )}
            {success && (
              <div className="af-toast af-toast-ok">
                <span className="af-toast-ico"><CheckCircle size={14}/></span>
                <div style={{ flex: 1 }}>
                  <div className="af-toast-ttl">Attendance marked!</div>
                  <div className="af-toast-sub">Saved for {form.date || today}.</div>
                  <div className="af-prog"><div className="af-prog-fill"/></div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default memo(AttendanceForm);