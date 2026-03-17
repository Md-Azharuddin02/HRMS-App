import { useState } from "react";
import API from "../../api/api";
import { Trash2, Users, Pencil, Search, ChevronUp, ChevronDown } from "lucide-react";
import EditEmployeeModal from "./EditEmployeeModal";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .el-wrap { font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; }

  /* ── Empty ── */
  .el-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    border: 2px dashed #e2e8f0; border-radius: 18px;
    padding: 48px 20px; text-align: center; background: #fafbfd;
    animation: elUp .35s ease both;
  }
  .el-empty-icon { width: 56px; height: 56px; border-radius: 17px; background: linear-gradient(135deg,#ede9fe,#ddd6fe); display: flex; align-items: center; justify-content: center; color: #7c52e8; margin: 0 auto 14px; }
  .el-empty-title { font-size: 15px; font-weight: 700; color: #1e1b4b; margin-bottom: 5px; }
  .el-empty-sub   { font-size: 13px; color: #94a3b8; }
  @keyframes elUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* ── Card wrapper ── */
  .el-card {
    background: white; border-radius: 18px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 10px 32px rgba(99,78,200,0.07);
    overflow: hidden; width: 100%; animation: elUp .35s ease both;
  }

  /* ── Toolbar ── */
  .el-toolbar {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 18px 12px; border-bottom: 1px solid #f1f5f9;
    flex-wrap: wrap;
  }
  .el-toolbar-left { display: flex; align-items: center; gap: 9px; }
  .el-title { font-size: 14px; font-weight: 800; color: #1e1b4b; white-space: nowrap; }
  .el-count { background: linear-gradient(135deg,#ede9fe,#ddd6fe); color: #6c4de6; font-size: 11px; font-weight: 700; border-radius: 99px; padding: 2px 9px; white-space: nowrap; }
  .el-search-wrap { position: relative; flex: 1; min-width: 0; }
  .el-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #a5b4c4; pointer-events: none; display: flex; }
  .el-search {
    width: 100%; padding: 8px 10px 8px 32px;
    border: 1.5px solid #e2e8f0; border-radius: 10px;
    font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1e293b; background: #f8fafc; outline: none;
    transition: border-color .2s, box-shadow .2s; min-height: 38px;
  }
  .el-search:focus { border-color: #7c52e8; box-shadow: 0 0 0 3px rgba(124,82,232,0.1); background: white; }
  .el-search::placeholder { color: #b4bfc8; }

  /* ════════════════════════════════════
     DESKTOP TABLE (≥601px)
  ════════════════════════════════════ */
  .el-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .el-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .el-thead { background: #f8fafc; }
  .el-th {
    padding: 10px 16px; text-align: left;
    font-size: 10.5px; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: .07em;
    border-bottom: 1px solid #f1f5f9; white-space: nowrap;
    cursor: pointer; user-select: none;
  }
  .el-th:last-child { text-align: right; cursor: default; }
  .el-th-inner { display: inline-flex; align-items: center; gap: 4px; }
  .el-sort-icon { color: #c4b5fd; }

  .el-tr { border-bottom: 1px solid #f8fafc; transition: background .12s; }
  .el-tr:last-child { border-bottom: none; }
  .el-tr:hover { background: #faf8ff; }
  .el-td { padding: 12px 16px; vertical-align: middle; }

  .el-id-chip { display: inline-flex; background: #f1f5f9; border-radius: 7px; padding: 3px 9px; font-size: 11px; font-weight: 700; color: #475569; white-space: nowrap; }
  .el-name-cell { display: flex; align-items: center; gap: 9px; min-width: 0; }
  .el-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; flex-shrink: 0; }
  .el-name { font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .el-email-sub { font-size: 11px; color: #94a3b8; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .el-dept { display: inline-flex; background: linear-gradient(135deg,#ede9fe,#ddd6fe); color: #6c3de8; font-size: 11px; font-weight: 600; border-radius: 7px; padding: 3px 9px; white-space: nowrap; }
  .el-email-td { color: #64748b; font-size: 12.5px; white-space: nowrap; }
  .el-actions-td { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }

  .el-btn-edit {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 8px;
    border: 1.5px solid #e2e8f0; background: white;
    color: #6c4de6; font-size: 12px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all .15s;
    white-space: nowrap; min-height: 32px;
  }
  .el-btn-edit:hover { border-color: #c4b5fd; background: #faf8ff; }
  .el-btn-del {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 8px;
    border: 1.5px solid #fee2e2; background: #fff8f8;
    color: #dc2626; font-size: 12px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all .15s;
    white-space: nowrap; min-height: 32px;
  }
  .el-btn-del:hover { border-color: #fca5a5; background: #fff1f1; }

  /* ════════════════════════════════════
     MOBILE CARD LIST (≤600px)
     Each employee = a card row, no table
  ════════════════════════════════════ */
  .el-mob-list { display: none; flex-direction: column; }
  .el-mob-item {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 16px; border-bottom: 1px solid #f8fafc;
    transition: background .12s;
  }
  .el-mob-item:last-child { border-bottom: none; }
  .el-mob-item:hover { background: #faf8ff; }
  .el-mob-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; flex-shrink: 0; }
  .el-mob-info { flex: 1; min-width: 0; }
  .el-mob-name { font-size: 13.5px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
  .el-mob-id   { display: inline-flex; background: #f1f5f9; border-radius: 5px; padding: 1px 7px; font-size: 10px; font-weight: 700; color: #475569; margin-right: 6px; }
  .el-mob-dept { display: inline-flex; background: linear-gradient(135deg,#ede9fe,#ddd6fe); color: #6c3de8; font-size: 10px; font-weight: 600; border-radius: 5px; padding: 1px 7px; }
  .el-mob-email { font-size: 11px; color: #94a3b8; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .el-mob-actions { display: flex; gap: 6px; flex-shrink: 0; }
  .el-mob-btn {
    width: 34px; height: 34px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all .15s; border: 1.5px solid; flex-shrink: 0;
  }
  .el-mob-btn-edit { border-color: #e2e8f0; background: white; color: #6c4de6; }
  .el-mob-btn-edit:hover { border-color: #c4b5fd; background: #faf8ff; }
  .el-mob-btn-del  { border-color: #fee2e2; background: #fff8f8; color: #dc2626; }
  .el-mob-btn-del:hover  { border-color: #fca5a5; background: #fff1f1; }

  /* Footer */
  .el-footer {
    padding: 10px 18px; border-top: 1px solid #f1f5f9; background: #fafbfd;
    font-size: 11.5px; color: #94a3b8;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;
  }
  .el-clear-btn { font-size: 11.5px; color: #7c52e8; font-weight: 600; background: none; border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
  .el-no-results { padding: 28px; text-align: center; font-size: 13px; color: #94a3b8; font-weight: 500; }

  /* ════════════════════════════════════
     DELETE MODAL
  ════════════════════════════════════ */
  .dm-overlay {
    position: fixed; inset: 0;
    background: rgba(30,27,75,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 60; padding: 16px;
    animation: dmFade .18s ease both;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  @keyframes dmFade { from{opacity:0} to{opacity:1} }
  .dm-card {
    background: white; border-radius: 18px;
    width: 100%; max-width: 360px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 24px 64px rgba(200,50,50,0.1);
    overflow: hidden;
    animation: dmPop .26s cubic-bezier(.34,1.4,.64,1) both;
  }
  @keyframes dmPop { from{opacity:0;transform:scale(.92) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .dm-header { padding: 24px 22px 18px; background: linear-gradient(135deg,#fef2f2,#fee2e2); border-bottom: 1px solid #fecaca; text-align: center; }
  .dm-warn   { width: 46px; height: 46px; border-radius: 14px; background: #fee2e2; border: 1.5px solid #fca5a5; display: flex; align-items: center; justify-content: center; color: #dc2626; margin: 0 auto 12px; }
  .dm-title  { font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 5px; }
  .dm-sub    { font-size: 12.5px; color: #64748b; line-height: 1.55; }
  .dm-err    { margin: 12px 18px 0; padding: 9px 12px; border-radius: 9px; background: #fff1f1; border: 1.5px solid #fca5a5; color: #dc2626; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 7px; }
  .dm-footer { display: flex; gap: 8px; padding: 16px 18px; }
  .dm-btn-c  { flex: 1; padding: 10px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-size: 13px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all .15s; min-height: 42px; }
  .dm-btn-c:hover { border-color: #c4b5fd; color: #7c52e8; }
  .dm-btn-d  { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border-radius: 10px; border: none; background: linear-gradient(135deg,#dc2626,#ef4444); color: white; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all .18s; box-shadow: 0 4px 14px rgba(220,38,38,0.25); min-height: 42px; }
  .dm-btn-d:hover:not(:disabled) { transform: translateY(-1px); }
  .dm-btn-d:disabled { opacity: .65; cursor: not-allowed; }
  .dm-spin   { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin .65s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  /* ════════════════════════════════════
     RESPONSIVE SWITCHES
  ════════════════════════════════════ */

  /* Tablet (768px - 600px): hide dept column */
  @media (max-width: 768px) {
    .el-col-dept  { display: none; }
    .el-col-email { display: none; }
    .el-toolbar   { padding: 13px 16px 11px; }
    .el-td, .el-th { padding-left: 14px; padding-right: 14px; }
    .el-footer    { padding: 10px 16px; }
  }

  /* Phone (≤600px): hide table, show card list */
  @media (max-width: 600px) {
    .el-table-wrap { display: none; }
    .el-mob-list   { display: flex; }
    .el-toolbar    { padding: 12px 14px 10px; gap: 8px; }
    .el-footer     { padding: 9px 14px; }
    .el-search-wrap { min-width: 0; }
  }

  /* Small phone (≤400px) */
  @media (max-width: 400px) {
    .el-toolbar  { flex-wrap: wrap; }
    .el-mob-item { padding: 11px 14px; gap: 10px; }
    .el-mob-avatar { width: 36px; height: 36px; font-size: 12px; }
    .el-mob-name   { font-size: 13px; }
    .dm-card       { border-radius: 16px; }
    .dm-header     { padding: 20px 18px 14px; }
    .dm-footer     { padding: 12px 16px; }
  }
`;

const GRADS = [
  ["#6c4de6","#9b74f0"],["#0f766e","#14b8a6"],["#b45309","#f59e0b"],
  ["#be123c","#f43f5e"],["#1d4ed8","#60a5fa"],["#7c3aed","#a78bfa"],
];
function grad(name = "") {
  return `linear-gradient(135deg,${GRADS[(name.charCodeAt(0)||0) % GRADS.length][0]},${GRADS[(name.charCodeAt(0)||0) % GRADS.length][1]})`;
}
function ini(name = "") {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";
}

function DeleteModal({ onCancel, onConfirm, loading, error }) {
  return (
    <div className="dm-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="dm-card">
        <div className="dm-header">
          <div className="dm-warn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="dm-title">Delete Employee?</div>
          <div className="dm-sub">This is permanent and cannot be undone.</div>
        </div>
        {error && <div className="dm-err"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
        <div className="dm-footer">
          <button className="dm-btn-c" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="dm-btn-d" onClick={onConfirm} disabled={loading}>
            {loading ? <><div className="dm-spin"/>Deleting…</> : <><Trash2 size={13}/>Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function SortIco({ col, sk, sd }) {
  if (sk !== col) return <ChevronUp size={11} style={{ opacity: .3 }}/>;
  return sd === "asc" ? <ChevronUp size={11}/> : <ChevronDown size={11}/>;
}

function EmployeeList({ employees = [], refresh }) {
  const [confirmId, setConfirmId]             = useState(null);
  const [editEmp, setEditEmp]                 = useState(null);
  const [loadingId, setLoadingId]             = useState(null);
  const [err, setErr]                         = useState("");
  const [search, setSearch]                   = useState("");
  const [sk, setSk]                           = useState("full_name");
  const [sd, setSd]                           = useState("asc");

  const toggleSort = k => { if (sk === k) setSd(d => d === "asc" ? "desc" : "asc"); else { setSk(k); setSd("asc"); } };

  const filtered = employees
    .filter(e => {
      const q = search.toLowerCase();
      return e.full_name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.department?.toLowerCase().includes(q) || e.employee_id?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const va = (a[sk] || "").toString().toLowerCase();
      const vb = (b[sk] || "").toString().toLowerCase();
      return sd === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  async function handleDelete() {
    if (!confirmId) return;
    setLoadingId(confirmId); setErr("");
    try { await API.delete(`/employees/${confirmId}`); refresh(); setConfirmId(null); }
    catch { setErr("Failed to delete. Try again."); }
    finally { setLoadingId(null); }
  }

  if (!employees.length) {
    return (
      <>
        <style>{CSS}</style>
        <div className="el-wrap">
          <div className="el-empty">
            <div className="el-empty-icon"><Users size={26}/></div>
            <div className="el-empty-title">No Employees Found</div>
            <div className="el-empty-sub">Employees will appear here once added.</div>
          </div>
        </div>
      </>
    );
  }

  const cols = [
    { key: "employee_id", label: "ID" },
    { key: "full_name",   label: "Employee" },
    { key: "email",       label: "Email",      cls: "el-col-email" },
    { key: "department",  label: "Department", cls: "el-col-dept" },
    { key: null,          label: "Actions" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="el-wrap">
        <div className="el-card">
          {/* Toolbar */}
          <div className="el-toolbar">
            <div className="el-toolbar-left">
              <span className="el-title">All Employees</span>
              <span className="el-count">{filtered.length}</span>
            </div>
            <div className="el-search-wrap">
              <span className="el-search-icon"><Search size={13}/></span>
              <input className="el-search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="el-table-wrap">
            <table className="el-table">
              <thead className="el-thead">
                <tr>
                  {cols.map(({ key, label, cls }) => (
                    <th key={label} className={`el-th${cls ? ` ${cls}` : ""}`}
                      style={label === "Actions" ? { textAlign: "right" } : {}}
                      onClick={() => key && toggleSort(key)}>
                      <span className="el-th-inner">
                        {label}
                        {key && <span className="el-sort-icon"><SortIco col={key} sk={sk} sd={sd}/></span>}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={5}><div className="el-no-results">No results for "{search}"</div></td></tr>
                  : filtered.map(emp => (
                    <tr key={emp.id} className="el-tr">
                      <td className="el-td"><span className="el-id-chip">{emp.employee_id}</span></td>
                      <td className="el-td">
                        <div className="el-name-cell">
                          <div className="el-avatar" style={{ background: grad(emp.full_name) }}>{ini(emp.full_name)}</div>
                          <div style={{ minWidth: 0 }}>
                            <div className="el-name">{emp.full_name}</div>
                            <div className="el-email-sub">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="el-td el-col-email"><span className="el-email-td">{emp.email}</span></td>
                      <td className="el-td el-col-dept"><span className="el-dept">{emp.department}</span></td>
                      <td className="el-td">
                        <div className="el-actions-td">
                          <button className="el-btn-edit" onClick={() => setEditEmp(emp)}><Pencil size={12}/> Edit</button>
                          <button className="el-btn-del"  onClick={() => setConfirmId(emp.id)}><Trash2 size={12}/> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARD LIST ── */}
          <div className="el-mob-list">
            {filtered.length === 0
              ? <div className="el-no-results">No results for "{search}"</div>
              : filtered.map(emp => (
                <div key={emp.id} className="el-mob-item">
                  <div className="el-mob-avatar" style={{ background: grad(emp.full_name) }}>{ini(emp.full_name)}</div>
                  <div className="el-mob-info">
                    <div className="el-mob-name">{emp.full_name}</div>
                    <div style={{ marginBottom: 3 }}>
                      <span className="el-mob-id">{emp.employee_id}</span>
                      <span className="el-mob-dept">{emp.department}</span>
                    </div>
                    <div className="el-mob-email">{emp.email}</div>
                  </div>
                  <div className="el-mob-actions">
                    <button className="el-mob-btn el-mob-btn-edit" onClick={() => setEditEmp(emp)}><Pencil size={14}/></button>
                    <button className="el-mob-btn el-mob-btn-del"  onClick={() => setConfirmId(emp.id)}><Trash2 size={14}/></button>
                  </div>
                </div>
              ))
            }
          </div>

          <div className="el-footer">
            <span>Showing <strong style={{ color: "#475569" }}>{filtered.length}</strong> of <strong style={{ color: "#475569" }}>{employees.length}</strong></span>
            {search && <button className="el-clear-btn" onClick={() => setSearch("")}>Clear ×</button>}
          </div>
        </div>

        {editEmp && <EditEmployeeModal employee={editEmp} setEdit={setEditEmp} refresh={refresh}/>}
        {confirmId && <DeleteModal onCancel={() => { setConfirmId(null); setErr(""); }} onConfirm={handleDelete} loading={loadingId === confirmId} error={err}/>}
      </div>
    </>
  );
}

export default EmployeeList;