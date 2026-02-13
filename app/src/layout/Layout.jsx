import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Users, CalendarCheck, Menu, X } from "lucide-react";

function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static z-50 top-0 left-0 h-full
          w-64 bg-white border-r border-slate-200 shadow-xl p-6 space-y-6
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            HRMS Lite
          </h1>

          <button
            className="lg:hidden p-1 rounded-lg hover:bg-slate-100 transition-colors duration-200"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <nav className="space-y-2 mt-8">
          <NavItem
            to="/employees"
            icon={<Users size={18} />}
            label="Employees"
            onClick={() => setOpen(false)}
          />

          <NavItem
            to="/attendance"
            icon={<CalendarCheck size={18} />}
            label="Attendance"
            onClick={() => setOpen(false)}
          />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 shadow-sm sticky top-0 z-30">
          <button
            className="lg:hidden mr-4 p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} className="text-slate-700" />
          </button>

          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 truncate">
            Admin Dashboard
          </h2>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/50 scale-105"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:scale-102"
        }`
      }
    >
      {icon}
      <span className="text-sm">{label}</span>
    </NavLink>
  );
}

export default Layout;