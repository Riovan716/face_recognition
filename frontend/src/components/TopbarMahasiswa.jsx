import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, LogOut, AlertTriangle } from "lucide-react";

export default function Topbar() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userName, setUserName] = useState("Loading...");
  const hideTimeout = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/me", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Gagal mengambil data user");
        const data = await res.json();
        setUserName(data.name || "Unknown");
      } catch (err) {
        console.error("Error fetching user:", err);
        setUserName("User");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/logout", {
        method: "DELETE",
        credentials: "include",
      });
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      alert("Gagal logout: " + err.message);
    }
  };

  return (
    <>
      <header className="bg-blue-600 text-white flex justify-between items-center px-6 py-4 shadow">
        <h2 className="text-lg font-semibold italic ">Mahasiswa</h2>

        <div
          className="relative"
          onMouseEnter={() => {
            clearTimeout(hideTimeout.current);
            setShowDropdown(true);
          }}
          onMouseLeave={() => {
            hideTimeout.current = setTimeout(() => {
              setShowDropdown(false);
            }, 150);
          }}
        >
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="text-right text-sm">
              <p className="font-semibold leading-none">{userName}</p>
              <p className="text-xs text-white/80">Mahasiswa</p>
            </div>
            <ChevronDown size={18} />
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg border p-4 z-50">
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <p className="font-semibold text-sm">{userName}</p>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <span>🧑‍💼</span> Mahasiswa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full !bg-white text-red-600 font-bold py-2 rounded-lg border-2 !border-black 
                hover:border-red-500 hover:text-red-800 hover:bg-red-50 transition duration-150"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-[6px] border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} /> Konfirmasi Logout
            </h2>
            <div className="bg-red-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700">
                Anda akan keluar dari akun{" "}
                <span className="font-semibold text-red-600">
                  {userName}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Anda harus login kembali untuk mengakses sistem.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-2.5 !bg-gray-200 text-gray-800 font-semibold rounded-xl hover:!bg-gray-300 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 !bg-red-500 text-white font-semibold rounded-xl hover:!bg-red-600 transition-all flex items-center gap-2"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
