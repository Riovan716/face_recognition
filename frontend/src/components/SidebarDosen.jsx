import { Link, useLocation } from "react-router-dom";
import { Home, FileText, User } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Sidebar() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/me", {
          withCredentials: true,
        });
        setUser(res.data);
        // Tampilkan warning jika nip/jurusan kosong
        if (
          !res.data.nip ||
          !res.data.jurusan ||
          res.data.nip.trim() === "" ||
          res.data.jurusan.trim() === ""
        ) {
          setShowWarning(true);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Sidebar items
  const navCategories = [
    {
      title: "Home",
      items: [
        {
          label: "Dashboard",
          icon: <Home size={20} />,
          path: "/dosen",
          always: true,
        },
      ],
    },
    {
      title: "Perkuliahan",
      items: [
        {
          label: "Matakuliah",
          icon: <FileText size={20} />,
          path: "/dosen/matakuliah",
        },
      ],
    },
    {
      title: "Pengaturan",
      items: [
        {
          label: "Profile",
          icon: <User size={20} />,
          path: "/dosen/profile",
          always: true,
        },
      ],
    },
  ];

  // Jika loading, tampilkan skeleton
  if (loading) {
    return (
      <aside className="w-64 bg-white shadow-lg flex flex-col border-r h-full">
        <div className="flex-1 p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
        </div>
      </aside>
    );
  }

  // Cek apakah profile belum lengkap
  const profileIncomplete =
    !user?.nip ||
    !user?.jurusan ||
    user.nip.trim() === "" ||
    user.jurusan.trim() === "";

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col border-r h-full">
      <div className="flex-1 p-4">
        {showWarning && (
          <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
            Lengkapi data Profile di menu Profile untuk mengakses semua fitur.
          </div>
        )}
        <nav className="space-y-6">
          {navCategories.map((category) => (
            <div key={category.title} className="space-y-2">
              <h3 className="px-4 text-xs font-semibold text-black uppercase tracking-wider mb-2 border-l-4 border-blue-500 pl-2 py-1 bg-gray-100 rounded-r-lg">
                {category.title}
              </h3>
              <div className="space-y-1">
                {category.items.map((item) => {
                  // Hanya tampilkan item selain Dashboard/Profile jika profile lengkap
                  if (!item.always && profileIncomplete) {
                    return (
                      <div
                        key={item.path}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-400 bg-gray-100 cursor-not-allowed opacity-60"
                      >
                        <span>{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                      </div>
                    );
                  }
                  return (
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
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
