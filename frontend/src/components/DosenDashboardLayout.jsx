import Topbar from "./TopbarDosen";
import Sidebar from "./SidebarDosen";
import { Outlet } from "react-router-dom";

export default function DosenDashboardLayout() {
  return (
    <div className="min-h-screen w-screen bg-gray-100 flex flex-col">
      {/* 🧭 Topbar tetap di atas */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <Topbar />
      </header>

      <div className="flex flex-1 pt-[64px]"> 
        {/* 🧱 Sidebar tetap di kiri */}
        <aside className="fixed top-[64px] left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40">
          <Sidebar />
        </aside>

        {/* 📄 Area konten bisa di-scroll */}
        <main className="flex-1 ml-64 p-6 bg-gray-100 overflow-y-auto h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
