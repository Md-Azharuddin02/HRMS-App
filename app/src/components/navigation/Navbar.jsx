import { Menu } from "lucide-react";

function Navbar({ setOpen }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shadow-sm">
      <button
        className="lg:hidden mr-4 p-2 rounded hover:bg-slate-100"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>

      <h2 className="text-lg font-semibold text-slate-800">
        Admin Dashboard
      </h2>
    </header>
  );
}

export default Navbar;