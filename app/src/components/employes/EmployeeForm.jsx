import { useState, useEffect } from "react";
import API from "../../api/api";
import { Loader2, AlertCircle, CheckCircle, Hash, User, Mail, Building2, UserPlus } from "lucide-react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .ef-wrap {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: white; border-radius: 18px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 10px 32px rgba(99,78,200,0.08);
    overflow: hidden; width: 100%;
    animation: efUp .35s ease both;
  }
  @keyframes efUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* Header */
  .ef-hdr {
    background: linear-gradient(135deg,#5b3fd4,#7c52e8 55%,#9b74f0);
    padding: 18px 20px 16px; position: relative; overflow: hidden;
  }
  .ef-hdr::before { content:''; position:absolute; width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,0.07); top:-36px; right:-28px; }
  .ef-hdr-inner { display: flex; align-items: center; gap: 11px; position: relative; z-index: 1; }
  .ef-hdr-icon  { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
  .ef-hdr-title { font-size: 15px; font-weight: 800; color: white; margin-bottom: 2px; }
  .ef-hdr-sub   { font-size: 12px; color: rgba(255,255,255,0.65); }

  /* Body */
  .ef-body { padding: 18px 20px 20px; background: #f8fafc; }

  /* 2-col grid for wide screens */
  .ef-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
  .ef-solo { margin-bottom: 14px; }

  .ef-field { display: flex; flex-direction: column; gap: 6px; }
  .ef-lbl { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: .07em; }
  .ef-lbl-ico { color: #7c52e8; display: flex; }
  .ef-req     { color: #f87171; }

  .ef-iw { position: relative; }
  .ef-ico { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #a5b4c4; pointer-events: none; display: flex; transition: color .2s; }
  .ef-iw:focus-within .ef-ico { color: #7c52e8; }
  .ef-input {
    width: 100%; padding: 12px 12px 12px 38px;
    border-radius: 11px; border: 1.5px solid #e2e8f0;
    background: white; color: #1e293b; font-size: 14px; font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif; outline: none;
    transition: border-color .2s, box-shadow .2s; min-height: 46px;
  }
  .ef-input::placeholder { color: #b4bfc8; font-weight: 400; }
  .ef-input:hover  { border-color: #c4b5fd; }
  .ef-input:focus  { border-color: #7c52e8; box-shadow: 0 0 0 4px rgba(124,82,232,0.1); }
  .ef-input.ef-err { border-color: #f87171; background: #fff8f8; }
  .ef-errmsg { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: #f87171; font-weight: 500; margin-top: 2px; }

  .ef-submit {
    width: 100%; padding: 13px; border-radius: 11px; border: none;
    background: linear-gradient(135deg,#6c4de6,#8b5cf6);
    color: white; font-size: 14px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 18px rgba(108,77,230,0.28); transition: all .18s; min-height: 48px;
  }
  .ef-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 26px rgba(108,77,230,0.38); }
  .ef-submit:disabled { opacity: .65; cursor: not-allowed; }

  .ef-toast { display: flex; align-items: flex-start; gap: 9px; border-radius: 11px; padding: 11px 14px; font-size: 12.5px; font-weight: 600; margin-top: 12px; word-break: break-word; animation: efToast .25s cubic-bezier(.34,1.4,.64,1) both; }
  @keyframes efToast { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
  .ef-toast-err { background: #fff1f1; border: 1.5px solid #fca5a5; color: #dc2626; }
  .ef-toast-ok  { background: #f0fdf4; border: 1.5px solid #86efac; color: #16a34a; }
  .ef-toast-ico { flex-shrink: 0; margin-top: 1px; }
  .ef-toast-ttl { font-weight: 700; margin-bottom: 2px; }
  .ef-toast-sub { font-size: 11.5px; font-weight: 400; opacity: .8; }
  .ef-prog      { height: 3px; border-radius: 99px; background: #bbf7d0; overflow: hidden; margin-top: 7px; }
  .ef-prog-fill { height: 100%; border-radius: 99px; background: #22c55e; animation: efProg 3s linear forwards; }
  @keyframes efProg { from{width:100%} to{width:0%} }

  /* ── Tablet: keep 2-col ── */
  @media (max-width: 768px) {
    .ef-hdr  { padding: 16px 18px 14px; }
    .ef-body { padding: 16px 18px 18px; }
  }

  /* ── Phone: 1-col, bigger inputs ── */
  @media (max-width: 520px) {
    .ef-hdr  { padding: 15px 16px 13px; }
    .ef-body { padding: 15px 16px 17px; }
    .ef-grid { grid-template-columns: 1fr; gap: 14px; }
    .ef-input { font-size: 16px; } /* prevent iOS zoom */
  }

  /* ── Small phone ── */
  @media (max-width: 380px) {
    .ef-hdr  { padding: 13px 14px 11px; }
    .ef-body { padding: 13px 14px 15px; }
    .ef-hdr-icon { width: 36px; height: 36px; }
    .ef-hdr-title { font-size: 14px; }
  }
`;

function Field({ label, name, type = "text", value, onChange, error, icon, ph }) {
  return (
    <div className="ef-field">
      <label className="ef-lbl" htmlFor={`ef-${name}`}>
        <span className="ef-lbl-ico">{icon}</span>
        {label} <span className="ef-req">*</span>
      </label>
      <div className="ef-iw">
        <span className="ef-ico">{icon}</span>
        <input id={`ef-${name}`} type={type} name={name} value={value}
          onChange={onChange} placeholder={ph}
          className={`ef-input${error ? " ef-err" : ""}`} autoComplete="off"/>
      </div>
      {error && (
        <div className="ef-errmsg">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}
    </div>
  );
}

function EmployeeForm({ refresh }) {
  const init = { employee_id: "", full_name: "", email: "", department: "" };
  const [form, setForm]         = useState(init);
  const [errors, setErrors]     = useState({});
  const [serverErr, setServerErr] = useState("");
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!form.employee_id.trim()) e.employee_id = "Required";
    if (!form.full_name.trim())   e.full_name   = "Required";
    if (!form.department.trim())  e.department  = "Required";
    if (!form.email.trim())       e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    return e;
  };

  const change = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: "" }));
    setServerErr("");
  };

  const submit = async e => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    setLoading(true); setSuccess(false);
    try {
      await API.post("/employees/", form);
      setForm(init); setSuccess(true); refresh();
    } catch (err) {
      setServerErr(err.response?.status === 409 ? "Employee ID or email already exists." : "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(false), 3000); return () => clearTimeout(t); }
  }, [success]);

  return (
    <>
      <style>{CSS}</style>
      <div className="ef-wrap">
        <div className="ef-body">
          <form onSubmit={submit} noValidate>
            {/* 2-col: ID + Name */}
            <div className="ef-grid">
              <Field label="Employee Code" name="employee_id" value={form.employee_id} onChange={change} error={errors.employee_id} icon={<Hash size={13}/>} ph="EMP-001"/>
              <Field label="Full Name"     name="full_name"   value={form.full_name}   onChange={change} error={errors.full_name}   icon={<User size={13}/>} ph="Sarah Johnson"/>
            </div>
            {/* Full-width */}
            <div className="ef-solo">
              <Field label="Email Address" name="email"      type="email" value={form.email}      onChange={change} error={errors.email}      icon={<Mail size={13}/>}      ph="sarah@company.com"/>
            </div>
            <div className="ef-solo">
              <Field label="Department"    name="department"              value={form.department}  onChange={change} error={errors.department}  icon={<Building2 size={13}/>} ph="Engineering"/>
            </div>

            <button type="submit" className="ef-submit" disabled={loading}>
              {loading ? <><Loader2 size={15} className="animate-spin"/>Adding…</> : <><UserPlus size={15}/>Add Employee</>}
            </button>

            {serverErr && (
              <div className="ef-toast ef-toast-err">
                <span className="ef-toast-ico"><AlertCircle size={14}/></span>
                <div><div className="ef-toast-ttl">Failed to add employee</div><div className="ef-toast-sub">{serverErr}</div></div>
              </div>
            )}
            {success && (
              <div className="ef-toast ef-toast-ok">
                <span className="ef-toast-ico"><CheckCircle size={14}/></span>
                <div style={{ flex: 1 }}>
                  <div className="ef-toast-ttl">Employee added!</div>
                  <div className="ef-toast-sub">Record saved to the system.</div>
                  <div className="ef-prog"><div className="ef-prog-fill"/></div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default EmployeeForm;