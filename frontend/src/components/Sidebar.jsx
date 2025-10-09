import { Link, useLocation } from "react-router-dom";
import { Home, UserPlus, FileText, ClipboardList, User } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const navCategories = [
    {
      title: "Home",
      items: [
        { label: "Dashboard", icon: <Home size={20} />, path: "/admin" },
      ]
    },
    {
      title: "Perkuliahan",
      items: [
        {
          label: "Data Matakuliah",
          icon: <ClipboardList size={20} />,
          path: "/admin/matakuliah-absen",
        },
      ]
    },
    {
      title: "Manajemen Akun",
      items: [
        {
          label: "Request Akun",
          icon: <UserPlus size={20} />,
          path: "/admin/request",
        },
        {
          label: "Data Akun",
          icon: <FileText size={20} />,
          path: "/admin/data-akun",
        },
      ]
    },
    // {
    //   title: "Lainnya",
    //   items: [
    //     {
    //       label: "Wajah Tidak Dikenali",
    //       icon: <User size={20} />,
    //       path: "/admin/unknown-faces",
    //     },
    //   ]
    // },
    {
      title: "Pengaturan",
      items: [
        { label: "Profile", icon: <User size={20} />, path: "/admin/profile" },
      ]
    },
   
  ];

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col border-r h-full">
      <div className="flex-1 p-4">
        <nav className="space-y-6">
          {navCategories.map((category) => (
            <div key={category.title} className="space-y-2">
              <h3 className="px-4 text-xs font-semibold text-black uppercase tracking-wider mb-2 border-l-4 border-blue-500 pl-2 py-1 bg-gray-100 rounded-r-lg">
                {category.title}
              </h3>
              <div className="space-y-1">
                {category.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ease-in-out relative border-b-2 border-gray-400
                      ${
                        location.pathname === item.path
                          ? "!bg-blue-500 !text-white font-medium shadow-md"
                          : "!text-black hover:!bg-gray-100 hover:!text-gray-900"
                      }`}
                  >
                    <span
                      className={`${
                        location.pathname === item.path
                          ? "text-white"
                          : "text-black group-hover:text-white"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
