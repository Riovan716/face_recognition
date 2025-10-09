import Topbar from "./TopbarDosen";
import Sidebar from "./SidebarDosen";
import { Outlet } from "react-router-dom";

export default function DosenDashboardLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 flex flex-col">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
