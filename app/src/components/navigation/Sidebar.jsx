import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  X,
} from "lucide-react";

const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/employees",
    label: "Employees",
    icon: Users,
  },
  {
    path: "/attendance",
    label: "Attendance",
    icon: CalendarCheck,
  },
];

function Sidebar({ open, setOpen }) {
  return (
    <aside
      className={`
        fixed lg:static z-50 top-0 left-0 h-full w-64
        bg-white border-r border-slate-200 shadow-lg
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600">
          HRMS Lite
        </h1>

        <button
          className="lg:hidden p-1 rounded hover:bg-slate-100"
          onClick={() => setOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="px-4 py-3 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;