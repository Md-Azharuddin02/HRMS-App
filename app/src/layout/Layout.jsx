import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import Navbar from "../components/navigation/Navbar";


const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; }

  /* Prevent any child from blowing out the horizontal width */
  .layout-main-content {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }

  /* Responsive main padding */
  .layout-main {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    /* Mobile first: tight padding */
    padding: 14px 12px;
  }

  /* Tablet: 640px+ */
  @media (min-width: 640px) {
    .layout-main { padding: 20px 16px; }
  }

  /* Desktop: 1024px+ */
  @media (min-width: 1024px) {
    .layout-main { padding: 28px 24px; }
  }
`;

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        className="flex min-h-screen bg-slate-50"
        style={{ overflow: "hidden" }}
      >
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
 
        <div
          className="flex-1 flex flex-col min-w-0"
          style={{ overflow: "hidden" }}
        >
          <Navbar setOpen={setSidebarOpen} />

          <main className="layout-main">
            <div className="layout-main-content">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default Layout;