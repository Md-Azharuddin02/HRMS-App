import { useState, useEffect } from "react";
import API from "../../api/api";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .em-overlay {
    position: fixed; inset: 0;
    background: rgba(30,27,75,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 60; padding: 16px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    animation: emFade .2s ease both;
    overflow-y: auto;
  }
  @keyframes emFade { from{opacity:0} to{opacity:1} }

  .em-modal {
    background: white; border-radius: 22px;
    width: 100%; max-width: 440px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1), 0 32px 80px rgba(99,78,200,0.18);
    overflow: hidden; display: flex; flex-direction: column;
    max-height: calc(100vh - 40px);
    animation: emPop .28s cubic-bezier(.34,1.4,.64,1) both;
    margin: auto;
  }
  @keyframes emPop { from{opacity:0;transform:scale(.93) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }

  /* Header */
  .em-hdr {
    background: linear-gradient(135deg,#5b3fd4,#7c52e8 55%,#9b74f0);
    padding: 22px 22px 18px; position: relative; overflow: hidden; flex-shrink: 0;
  }
  .em-hdr::before { content:''; position:absolute; width:140px; height:140px; border-radius:50%; background:rgba(255,255,255,0.07); top:-44px; right:-34px; }
  .em-hdr-row { display: flex; align-items: flex-start; justify-content: space-between; position: relative; z-index: 1; }
  .em-hdr-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; color: white; }
  .em-hdr-close { width: 30px; height: 30px; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.18); border-radius: 9px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(255,255,255,0.85); transition: background .15s; flex-shrink: 0; }
  .em-hdr-close:hover { background: rgba(255,255,255,0.24); }
  .em-hdr-title { font-size: 16px; font-weight: 800; color: white; margin-top: 12px; margin-bottom: 3px; position: relative; z-index: 1; }
  .em-hdr-sub   { font-size: 12px; color: rgba(255,255,255,0.65); position: relative; z-index: 1; }
  .em-pill {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,0.13); border: 1px solid rgba(255,255,255,0.2);
    border-radius: 99px; padding: 5px 12px 5px 6px;
    margin-top: 12px; position: relative; z-index: 1; max-width: 100%;
  }
  .em-pill-av { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: white; flex-shrink: 0; }
  .em-pill-nm { font-size: 12px; color: rgba(255,255,255,0.9); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* Success banner */
  .em-ok { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 10px 14px; margin: 14px 18px 0; font-size: 12.5px; font-weight: 600; color: #16a34a; flex-shrink: 0; animation: emSlide .25s ease both; }
  @keyframes emSlide { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }

  /* Body */
  .em-body { padding: 18px 20px; background: #f8fafc; overflow-y: auto; flex: 1; }

  .em-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .em-label { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: .07em; }
  .em-label-ico { color: #7c52e8; display: flex; }

  .em-iw { position: relative; }
  .em-ico { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #a5b4c4; pointer-events: none; display: flex; transition: color .2s; }
  .em-iw:focus-within .em-ico { color: #7c52e8; }
  .em-input {
    width: 100%; padding: 12px 12px 12px 38px;
    border-radius: 11px; border: 1.5px solid #e2e8f0;
    background: white; color: #1e293b; font-size: 14px; font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif; outline: none;
    transition: border-color .2s, box-shadow .2s; min-height: 46px;
  }
  .em-input::placeholder { color: #b4bfc8; font-weight: 400; }
  .em-input:hover  { border-color: #c4b5fd; }
  .em-input:focus  { border-color: #7c52e8; box-shadow: 0 0 0 4px rgba(124,82,232,0.1); }
  .em-input:disabled { opacity: .55; }

  /* Footer */
  .em-ftr { display: flex; gap: 8px; padding: 14px 20px; background: white; border-top: 1px solid #edf0f5; flex-shrink: 0; }
  .em-btn-c {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 11px; border-radius: 11px; border: 1.5px solid #e2e8f0; background: white;
    color: #64748b; font-size: 13px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all .15s; min-height: 44px;
  }
  .em-btn-c:hover { border-color: #c4b5fd; color: #7c52e8; }
  .em-btn-s {
    flex: 2; display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 11px; border-radius: 11px; border: none;
    background: linear-gradient(135deg,#6c4de6,#8b5cf6);
    color: white; font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all .18s;
    box-shadow: 0 4px 14px rgba(108,77,230,0.3); min-height: 44px;
  }
  .em-btn-s:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,77,230,0.38); }
  .em-btn-s:disabled { opacity: .65; cursor: not-allowed; }
  .em-spin { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin .65s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  /* ── Tablet / Phone: bottom sheet ── */
  @media (max-width: 640px) {
    .em-overlay { padding: 0; align-items: flex-end; }
    .em-modal   { border-radius: 22px 22px 0 0; max-width: 100%; max-height: 94vh; }
  }

  /* ── Small phone ── */
  @media (max-width: 400px) {
    .em-hdr   { padding: 18px 16px 14px; }
    .em-body  { padding: 16px; }
    .em-ftr   { padding: 12px 16px; }
    .em-input { font-size: 16px; } /* prevent iOS zoom */
  }
`;

const icons = {
  user: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  bldg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 3v18"/><path d="M16 3v18"/><path d="M2 9h20"/><path d="M2 15h20"/></svg>,
  x:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chk:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  edit: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
};

function EditEmployeeModal({ employee, setEdit, refresh }) {
  const [form, setForm]       = useState({ full_name: "", email: "", department: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => { if (employee) setForm(employee); }, [employee]);

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    setLoading(true);
    try {
      await API.put(`/employees/${employee.id}`, form);
      setSaved(true);
      setTimeout(() => { refresh(); setEdit(null); }, 900);
    } catch { setLoading(false); }
  };

  const inits = form.full_name ? form.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "??";

  const fields = [
    { name: "full_name",  label: "Full Name",     ico: icons.user, type: "text",  ph: "e.g. Sarah Johnson" },
    { name: "email",      label: "Email Address", ico: icons.mail, type: "email", ph: "e.g. sarah@company.com" },
    { name: "department", label: "Department",    ico: icons.bldg, type: "text",  ph: "e.g. Engineering" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="em-overlay" onClick={e => e.target === e.currentTarget && setEdit(null)}>
        <div className="em-modal" role="dialog" aria-modal="true">
          <div className="em-hdr">
            <div className="em-hdr-row">
              <div className="em-hdr-icon">{icons.edit}</div>
              <button className="em-hdr-close" onClick={() => setEdit(null)}>{icons.x}</button>
            </div>
            <div className="em-hdr-title">Edit Employee</div>
            <div className="em-hdr-sub">Update the details and save your changes</div>
            {form.full_name && (
              <div className="em-pill">
                <div className="em-pill-av">{inits}</div>
                <span className="em-pill-nm">{form.full_name}</span>
              </div>
            )}
          </div>

          {saved && (
            <div className="em-ok">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Employee updated successfully!
            </div>
          )}

          <div className="em-body">
            {fields.map(({ name, label, ico, type, ph }) => (
              <div className="em-field" key={name}>
                <label className="em-label" htmlFor={`em-${name}`}>
                  <span className="em-label-ico">{ico}</span>{label}
                </label>
                <div className="em-iw">
                  <span className="em-ico">{ico}</span>
                  <input id={`em-${name}`} name={name} type={type}
                    value={form[name] || ""} onChange={change}
                    placeholder={ph} className="em-input"
                    disabled={loading || saved} autoComplete="off"/>
                </div>
              </div>
            ))}
          </div>

          <div className="em-ftr">
            <button className="em-btn-c" onClick={() => setEdit(null)} disabled={loading}>
              {icons.x} Cancel
            </button>
            <button className="em-btn-s" onClick={save} disabled={loading || saved}>
              {loading ? <><div className="em-spin"/>Saving…</> : saved ? <>{icons.chk}Saved!</> : <>{icons.chk}Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditEmployeeModal;