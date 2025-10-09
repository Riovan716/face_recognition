import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function RequestAkun() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("semua");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/request-akun", {
        withCredentials: true,
      });
      // Urutkan berdasarkan nama (username)
      const sorted = [...res.data].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
      setRequests(sorted);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let result = [...requests];

    if (roleFilter !== "semua") {
      result = result.filter((user) => user.role === roleFilter);
    }

    if (search.trim() !== "") {
      const keyword = search.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword)
      );
    }

    setTotalPages(Math.ceil(result.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFiltered(result.slice(startIndex, endIndex));
  }, [search, roleFilter, requests, currentPage]);

  const handleApprove = async (uuid) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/request-akun/approve/${uuid}`,
        {},
        { withCredentials: true }
      );
      showModal(res.data.msg);
      fetchRequests(); // refresh tabel
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message;

      if (errorMsg.includes("sudah terdaftar")) {
        showModal("Email sudah digunakan. Tidak dapat menyetujui permintaan.");

        // Hapus permintaan dari backend
        await axios.delete(
          `http://localhost:5000/request-akun/reject/${uuid}`,
          { withCredentials: true }
        );

        fetchRequests(); // refresh tabel
      } else {
        showModal("Gagal approve: " + errorMsg);
      }
    }
  };

  const handleReject = async (uuid) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/request-akun/reject/${uuid}`,
        { withCredentials: true }
      );
      showModal(res.data.msg);
      fetchRequests();
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message;
      showModal("Gagal reject: " + errorMsg);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto px-0 sm:px-0 py-0 pb-16">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          Request Akun
        </h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/admin"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black">●</span>
          <span className="text-black font-medium">Request Akun</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search
              className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-black placeholder-gray-500"
            />
          </div>
          <div className="relative group">
            <Filter
              className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white appearance-none text-black"
            >
              <option value="semua" className="text-black">
                Semua Role
              </option>
              <option value="admin" className="text-black">
                Admin
              </option>
              <option value="Mahasiswa" className="text-black">
                Mahasiswa
              </option>
              <option value="dosen" className="text-black">
                Dosen
              </option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
          <p className="text-gray-500">Tidak ada request akun.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          {filtered.map((user) => (
            <div
              key={user.uuid}
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {user.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {user.email} —{" "}
                    <span className="capitalize font-medium">{user.role}</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(user.uuid)}
                    className="rounded-lg text-sm font-semibold text-white !bg-green-500 px-4 py-2 hover:!bg-green-600 transition shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(user.uuid)}
                    className="rounded-lg text-sm font-semibold text-white !bg-red-500 px-4 py-2 hover:!bg-red-600 transition shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="w-full flex justify-center mt-10">
          <div className="bg-white px-6 py-3 rounded-xl shadow-lg border border-gray-100 flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border transition ${
                currentPage === 1
                  ? "!bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "!bg-white text-gray-700 hover:!bg-yellow-500 hover:text-white hover:border-yellow-500"
              }`}
            >
              ◀
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition border ${
                  currentPage === page
                    ? "!bg-yellow-500 text-white border-yellow-500"
                    : "!bg-white text-gray-700 hover:!bg-yellow-500 hover:text-white hover:border-yellow-500"
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
              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border transition ${
                currentPage === totalPages
                  ? "!bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "!bg-white text-gray-700 hover:!bg-yellow-500 hover:text-white hover:border-yellow-500"
              }`}
            >
              ▶
            </button>
          </div>
        </div>
      )}

      {/* Modal Success */}
      {isModalOpen &&
        !modalMessage.toLowerCase().includes("gagal") &&
        !modalMessage.toLowerCase().includes("reject") && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-green-500">
              <h2 className="text-xl font-bold text-green-600 mb-4 flex justify-center items-center gap-2">
                <CheckCircle size={22} className="text-green-600" /> Berhasil
              </h2>
              <p className="text-gray-700 mb-6">{modalMessage}</p>
              <button
                onClick={closeModal}
                className="px-6 py-2 !bg-green-500 text-white font-semibold rounded-lg hover:!bg-green-600 transition shadow-md hover:shadow-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

      {/* Modal Reject */}
      {isModalOpen && modalMessage.toLowerCase().includes("reject") && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <XCircle size={22} className="text-red-600" /> Penolakan
            </h2>
            <p className="text-gray-700 mb-6">{modalMessage}</p>
            <button
              onClick={closeModal}
              className="px-6 py-2 !bg-red-500 text-white font-semibold rounded-lg hover:!bg-red-600 transition shadow-md hover:shadow-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Error */}
      {isModalOpen &&
        modalMessage.toLowerCase().includes("gagal") &&
        !modalMessage.toLowerCase().includes("reject") && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
              <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
                <AlertTriangle size={22} className="text-red-600" /> Gagal
              </h2>
              <p className="text-gray-700 mb-6">{modalMessage}</p>
              <button
                onClick={closeModal}
                className="px-6 py-2 !bg-red-500 text-white font-semibold rounded-lg hover:!bg-red-600 transition shadow-md hover:shadow-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
