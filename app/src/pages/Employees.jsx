import { useEffect, useState } from "react";
import EmployeeForm from "../components/employes/EmployeeForm";
import EmployeeList from "../components/employes/EmployeeList";
import { Users, Plus, AlertCircle, X, UserPlus } from "lucide-react";
import { useApp } from "../store/AppContext";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .ep-wrap {
    font-family: 'Plus Jakarta Sans', sans-serif;
    width: 100%; max-width: 1100px; margin: 0 auto;
    padding: 28px 20px; display: flex; flex-direction: column; gap: 18px;
  }

  /* ── Page header ── */
  .ep-hdr { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
  .ep-hdr-left { display: flex; align-items: center; gap: 13px; }
  .ep-ph-ico { width: 46px; height: 46px; border-radius: 14px; background: linear-gradient(135deg,#6c4de6,#9b74f0); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; box-shadow: 0 4px 12px rgba(108,77,230,0.28); }
  .ep-eyebrow { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; color: #7c52e8; margin-bottom: 3px; }
  .ep-title   { font-size: 22px; font-weight: 800; color: #1e1b4b; line-height: 1.1; }
  .ep-sub     { font-size: 13px; color: #94a3b8; margin-top: 2px; }

  .ep-add-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 18px; border-radius: 12px; border: none;
    background: linear-gradient(135deg,#6c4de6,#8b5cf6);
    color: white; font-size: 13.5px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; white-space: nowrap; flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(108,77,230,0.3); transition: all .18s; min-height: 42px;
  }
  .ep-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,77,230,0.4); }

  /* Error */
  .ep-error { display: flex; align-items: center; gap: 9px; background: #fff1f1; border: 1.5px solid #fca5a5; border-radius: 13px; padding: 12px 15px; font-size: 13px; font-weight: 600; color: #dc2626; animation: epUp .3s ease both; }
  @keyframes epUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  /* Loading skeleton */
  .ep-skel-card {
    background: white; border-radius: 18px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 2px 4px rgba(0,0,0,0.03), 0 8px 24px rgba(99,78,200,0.06);
    overflow: hidden; animation: epUp .35s ease both;
  }
  .ep-skel-hdr { background: #f8fafc; padding: 14px 18px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .ep-skel  { border-radius: 7px; background: #e8edf3; animation: epSkelP 1.4s ease-in-out infinite; }
  @keyframes epSkelP { 0%,100%{opacity:1} 50%{opacity:.4} }
  .ep-skel-row { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid #f8fafc; }

  /* ════════════════════════════════════
     MODAL OVERLAY
  ════════════════════════════════════ */
  .ep-overlay {
    position: fixed; inset: 0;
    background: rgba(30,27,75,0.5); backdrop-filter: blur(5px);
    display: flex; align-items: center; justify-content: center;
    z-index: 60; padding: 16px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    animation: epFade .2s ease both;
    overflow-y: auto;
  }
  @keyframes epFade { from{opacity:0} to{opacity:1} }

  .ep-modal {
    background: white; border-radius: 22px;
    width: 100%; max-width: 460px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1), 0 32px 80px rgba(99,78,200,0.18);
    overflow: hidden; display: flex; flex-direction: column;
    max-height: calc(100vh - 40px);
    animation: epPop .28s cubic-bezier(.34,1.4,.64,1) both;
    margin: auto;
  }
  @keyframes epPop { from{opacity:0;transform:scale(.93) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }

  .ep-modal-hdr {
    background: linear-gradient(135deg,#5b3fd4,#7c52e8 55%,#9b74f0);
    padding: 22px 22px 18px; position: relative; overflow: hidden; flex-shrink: 0;
  }
  .ep-modal-hdr::before { content:''; position:absolute; width:140px; height:140px; border-radius:50%; background:rgba(255,255,255,0.07); top:-44px; right:-34px; }
  .ep-modal-hdr-row { display: flex; align-items: flex-start; justify-content: space-between; position: relative; z-index: 1; }
  .ep-modal-ico { width: 42px; height: 42px; border-radius: 13px; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; color: white; }
  .ep-modal-close { width: 30px; height: 30px; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.18); border-radius: 9px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(255,255,255,0.85); transition: background .15s; flex-shrink: 0; }
  .ep-modal-close:hover { background: rgba(255,255,255,0.24); }
  .ep-modal-title { font-size: 16px; font-weight: 800; color: white; margin-top: 12px; margin-bottom: 3px; position: relative; z-index: 1; }
  .ep-modal-sub   { font-size: 12px; color: rgba(255,255,255,0.65); position: relative; z-index: 1; }
  .ep-modal-body  { overflow-y: auto; flex: 1; }

  /* ════════════════════════════════════
     RESPONSIVE
  ════════════════════════════════════ */

  /* Tablet */
  @media (max-width: 768px) {
    .ep-wrap { padding: 22px 16px; gap: 15px; }
    .ep-title { font-size: 20px; }
    .ep-skel-hdr { padding: 13px 16px; }
    .ep-skel-row { padding: 12px 16px; }
  }

  /* Large phone */
  @media (max-width: 520px) {
    .ep-wrap { padding: 16px 14px; gap: 13px; }
    .ep-hdr  { flex-direction: column; align-items: stretch; gap: 12px; }
    .ep-add-btn { width: 100%; justify-content: center; }
    .ep-title { font-size: 18px; }
    .ep-ph-ico { width: 40px; height: 40px; }
    /* Modal becomes bottom sheet */
    .ep-overlay { padding: 0; align-items: flex-end; }
    .ep-modal   { border-radius: 22px 22px 0 0; max-width: 100%; max-height: 94vh; }
  }

  /* Small phone */
  @media (max-width: 380px) {
    .ep-wrap { padding: 13px 12px; }
    .ep-title { font-size: 17px; }
    .ep-modal-hdr  { padding: 18px 16px 14px; }
  }
`;

function SkeletonTable() {
  return (
    <div className="ep-skel-card">
      <div className="ep-skel-hdr">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="ep-skel" style={{ width: 100, height: 14 }}/>
          <div className="ep-skel" style={{ width: 28, height: 20, borderRadius: 99 }}/>
        </div>
        <div className="ep-skel" style={{ width: 140, height: 34, borderRadius: 10 }}/>
      </div>
      {[80, 70, 85, 65, 75].map((w, i) => (
        <div key={i} className="ep-skel-row" style={{ animationDelay: `${i * 70}ms` }}>
          <div className="ep-skel" style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0 }}/>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
            <div className="ep-skel" style={{ width: `${w}%`, height: 12 }}/>
            <div className="ep-skel" style={{ width: "40%", height: 10 }}/>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            <div className="ep-skel" style={{ width: 54, height: 30, borderRadius: 8 }}/>
            <div className="ep-skel" style={{ width: 62, height: 30, borderRadius: 8 }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function Employees() {
  const { employees, loading, error, fetchEmployees } = useApp();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  return (
    <>
      <style>{CSS}</style>
      <div className="ep-wrap">

        {/* Header */}
        <div className="ep-hdr">
          <div className="ep-hdr-left">
            <div className="ep-ph-ico"><Users size={21}/></div>
            <div>
              <div className="ep-eyebrow">HR Module</div>
              <h1 className="ep-title">Employees</h1>
              <p className="ep-sub">Add, manage and monitor employee records</p>
            </div>
          </div>
          <button className="ep-add-btn" onClick={() => setShowForm(true)}>
            <Plus size={15}/> Add Employee
          </button>
        </div>

        {error && <div className="ep-error"><AlertCircle size={14}/>{error}</div>}

        {loading ? <SkeletonTable/> : <EmployeeList employees={employees} refresh={fetchEmployees}/>}

        {/* Modal */}
        {showForm && (
          <div className="ep-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div className="ep-modal" role="dialog" aria-modal="true">
              <div className="ep-modal-hdr">
                <div className="ep-modal-hdr-row">
                  <div className="ep-modal-ico"><UserPlus size={20}/></div>
                  <button className="ep-modal-close" onClick={() => setShowForm(false)} aria-label="Close">
                    <X size={14}/>
                  </button>
                </div>
                <div className="ep-modal-title">Add Employee</div>
                <div className="ep-modal-sub">Register a new employee to the system</div>
              </div>
              <div className="ep-modal-body">
                <EmployeeForm refresh={() => { fetchEmployees(); setShowForm(false); }}/>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Employees;