import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Users, CalendarCheck, Menu, X } from "lucide-react";

function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static z-50 top-0 left-0 h-full
          w-64 bg-white border-r shadow-sm p-6 space-y-6
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">
            HRMS Lite
          </h1>

          {/* Mobile Close Button */}
          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2 mt-6">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">

        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center px-6 shadow-sm">
          <button
            className="lg:hidden mr-4"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>

          <h2 className="text-lg font-semibold text-slate-700">
            Admin Dashboard
          </h2>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* Sidebar Link Component */
function NavItem({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-indigo-100 text-indigo-700 font-semibold"
            : "text-slate-600 hover:bg-slate-100"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

export default Layout;
