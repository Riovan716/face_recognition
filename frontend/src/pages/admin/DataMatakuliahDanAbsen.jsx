import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AlertTriangle, Lock, Search, Book } from "lucide-react";
import { FiSearch, FiFilter } from "react-icons/fi";

export default function DataMatakuliahDanAbsen() {
  const [data, setData] = useState([]);
  const [user, setUser] = useState({});
  const [filter, setFilter] = useState("semua");
  const [search, setSearch] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedMatakuliah, setSelectedMatakuliah] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [kelasRes, userRes] = await Promise.all([
          axios.get("http://localhost:5000/matakuliah", {
            withCredentials: true,
          }),
          axios.get("http://localhost:5000/me", { withCredentials: true }),
        ]);
        // Urutkan berdasarkan judul matakuliah (A-Z)
        const sorted = [...kelasRes.data].sort((a, b) =>
          a.matakuliah.localeCompare(b.matakuliah, undefined, { sensitivity: 'base' })
        );
        setData(sorted);
        setUser(userRes.data);
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredData = data.filter((d) => {
    const matchFilter = filter === "saya" ? d.userId === user.id : true;
    const matchSearch =
      d.matakuliah.toLowerCase().includes(search.toLowerCase()) ||
      d.kodematakuliah.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  useEffect(() => {
    const total = Math.ceil(filteredData.length / itemsPerPage);
    setTotalPages(total || 1);
    setCurrentPage(1);
  }, [filteredData.length]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleMatakuliahClick = (matakuliah) => {
    if (user.role === "admin") {
      navigate(`/admin/matakuliah/${matakuliah.uuid}`);
      return;
    }

    setSelectedMatakuliah(matakuliah);
    setShowPasswordModal(true);
    setPassword("");
    setError("");
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      setError("Password tidak boleh kosong");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/matakuliah/verify-password",
        {
          uuid: selectedMatakuliah.uuid,
          password: password,
        },
        { withCredentials: true }
      );

      if (res.data.valid) {
        navigate(`/admin/matakuliah/${selectedMatakuliah.uuid}`);
      } else {
        setError("Password salah!");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat verifikasi");
      console.error(err);
    }
  };

  if (loading || !user.id) {
    return <p className="text-center mt-10">Memuat data...</p>;
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto pb-16">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          Data Matakuliah
        </h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/admin"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Matakuliah</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 px-4 sm:px-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Cari matakuliah atau kode..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black transition-all"
          />
        </div>
        <Link
          to="/admin/matakuliah/tambah"
          className="px-6 py-2.5 !bg-green-500 text-white font-semibold rounded-xl hover:!bg-green-600 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Book size={18} />
          Tambah Matakuliah
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 sm:px-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Book className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500 text-lg">
              Tidak ada data matakuliah yang sesuai.
            </p>
          </div>
        ) : (
          paginatedData.map((matakuliah) => (
            <div
              key={matakuliah.id}
              onClick={() => handleMatakuliahClick(matakuliah)}
              className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6 text-black">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                    {matakuliah.matakuliah}
                  </h3>
                  <p className="text-black text-sm">
                    {matakuliah.kodematakuliah}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    Semester {matakuliah.semester}
                  </span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {matakuliah.sks} SKS
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700">
                    Tahun Ajaran: {matakuliah.tahunajaran}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-yellow-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex justify-center items-center gap-2">
              <Lock size={22} className="text-yellow-500" /> Masukkan Password
            </h2>
            <div className="space-y-4">
              <div className="relative group">
                <Lock
                  size={18}
                  className="absolute top-3 left-3 text-gray-500 group-focus-within:text-yellow-500 transition-colors"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password Matakuliah"
                  className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition bg-white !text-black"
                />
              </div>
              {error && (
                <div className="text-red-600 flex gap-2 items-center justify-center">
                  <AlertTriangle size={18} /> {error}
                </div>
              )}
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-6 py-2.5 !bg-gray-200 text-gray-800 font-semibold rounded-lg hover:!bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-6 py-2.5 !bg-yellow-500 text-white font-semibold rounded-lg hover:!bg-yellow-600"
              >
                Masuk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="w-full flex justify-center mt-10 bg-white px-4 py-2 rounded-full shadow-md items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`w-8 h-8 rounded-full text-sm flex items-center justify-center border transition ${
              currentPage === 1
                ? "!bg-gray-200 text-black cursor-not-allowed"
                : "!bg-white text-black hover:bg-gray-300"
            }`}
          >
            ◀
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition border ${
                currentPage === page
                  ? "!bg-blue-600 text-white border-white"
                  : "!bg-white text-black hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`w-8 h-8 rounded-full text-sm flex items-center justify-center border transition ${
              currentPage === totalPages
                ? "!bg-gray-200 text-black cursor-not-allowed"
                : "!bg-white text-black hover:bg-gray-300"
            }`}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
