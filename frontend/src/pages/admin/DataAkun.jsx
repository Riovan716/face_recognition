import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Upload,
} from "lucide-react";

export default function DataAkun() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("semua");
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users", {
        withCredentials: true,
      });
      const sorted = [...res.data].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
      setUsers(sorted);
    } catch (err) {
      setError("Gagal mengambil data user");
      console.error(err);
    }
  };

  const confirmDelete = (user) => {
    setSelectedUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedUserToDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/users/${selectedUserToDelete.uuid}`,
        {
          withCredentials: true,
        }
      );
      setUsers(users.filter((u) => u.uuid !== selectedUserToDelete.uuid));
      setShowDeleteModal(false);
    } catch (err) {
      alert("Gagal menghapus user");
      console.error(err);
      setShowDeleteModal(false);
    }
  };

  const handleEdit = (uuid) => {
    navigate(`/admin/data-akun/edit/${uuid}`);
  };

  // Fungsi upload file excel
  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImportLoading(true);
    setImportError("");
    setImportSuccess("");
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await axios.post("http://localhost:5000/users/import-excel", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportSuccess(res.data?.msg || "Berhasil import akun!");
      setImportFile(null);
      setShowImportModal(false);
      fetchUsers();
    } catch (err) {
      setImportError(err.response?.data?.msg || err.message || "Gagal import file");
    } finally {
      setImportLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];
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
    setFilteredUsers(result.slice(startIndex, endIndex));
  }, [search, roleFilter, users, currentPage]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto px-0 sm:px-0 py-0 pb-16">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md ">
        <h1 className="text-sm font-bold text-black mb-1">Data Akun</h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/admin"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Data Akun</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/admin/data-akun/tambah")}
              className="px-6 py-2.5 !bg-blue-600 text-white rounded-lg hover:!bg-blue-700 transition shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Plus size={18} />
              Tambah Akun
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-6 py-2.5 !bg-green-600 text-white rounded-lg hover:!bg-green-700 transition shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Upload size={18} />
              Import Excel
            </button>
          </div>
        </div>

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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={18} />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
          <p className="text-gray-500">Tidak ada data akun yang cocok.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.uuid}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition"
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
                    onClick={() => handleEdit(user.uuid)}
                    className="px-4 py-2 text-sm !bg-yellow-500 text-white rounded-lg hover:!bg-yellow-600 transition shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(user)}
                    className="px-4 py-2 text-sm !bg-red-500 text-white rounded-lg hover:!bg-red-600 transition shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="w-full flex justify-center mt-10">
          <div className="bg-white px-6 py-3 rounded-full shadow-md flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`w-9 h-9 rounded-full text-sm flex items-center justify-center border transition-all duration-200 ${
                currentPage === 1
                  ? "!bg-gray-200 text-black cursor-not-allowed"
                  : "!bg-white !text-black hover:bg-gray-300 hover:shadow-sm"
              }`}
            >
              ◀
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-full text-sm flex items-center justify-center transition-all duration-200 border ${
                  currentPage === page
                    ? "!bg-blue-600 text-white border-white shadow-sm"
                    : "!bg-white text-black hover:bg-gray-300 hover:shadow-sm"
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
              className={`w-9 h-9 rounded-full text-sm flex items-center justify-center border transition-all duration-200 ${
                currentPage === totalPages
                  ? "!bg-gray-200 text-black cursor-not-allowed"
                  : "!bg-white text-black hover:bg-gray-300 hover:shadow-sm"
              }`}
            >
              ▶
            </button>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} className="text-red-600" /> Konfirmasi
              Hapus
            </h2>
            <p className="text-gray-700 mb-6">
              Apakah Anda yakin ingin menghapus akun{" "}
              {selectedUserToDelete?.name}?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 !bg-gray-200 text-gray-800 font-semibold rounded-lg hover:!bg-gray-300 transition shadow-md hover:shadow-lg"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-6 py-2 !bg-red-500 text-white font-semibold rounded-lg hover:!bg-red-600 transition shadow-md hover:shadow-lg"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {showImportModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex justify-center items-center gap-2">
              <Upload size={22} className="text-green-600" /> Import Akun dari Excel
            </h2>
            <form onSubmit={handleImportExcel}>
              {/* Custom file input */}
              <label htmlFor="excel-upload" className="block cursor-pointer w-full mb-2">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-green-400 rounded-lg p-6 hover:bg-green-50 transition">
                  <Upload size={32} className="text-green-500 mb-2" />
                  <span className="font-semibold text-green-700">Pilih File Excel</span>
                  <span className="text-xs text-gray-500 mt-1">(.xlsx, .xls, .csv)</span>
                </div>
                <input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="hidden"
                  required
                />
              </label>
              {/* Show selected file name */}
              {importFile && (
                <div className="mb-2 text-sm text-gray-700 truncate">File: <span className="font-medium">{importFile.name}</span></div>
              )}
              <div className="flex justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportError("");
                  }}
                  className="px-6 py-2 !bg-gray-200 text-gray-800 font-semibold rounded-lg hover:!bg-gray-300 transition shadow-md hover:shadow-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={importLoading || !importFile}
                  className={`px-6 py-2 !bg-green-500 text-white font-semibold rounded-lg hover:!bg-green-600 transition shadow-md hover:shadow-lg ${importLoading || !importFile ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {importLoading ? "Mengimpor..." : "Import"}
                </button>
              </div>
              {importError && <div className="mt-4 text-red-600 text-sm">{importError}</div>}
              {importSuccess && <div className="mt-4 text-green-600 text-sm">{importSuccess}</div>}
            </form>
            <div className="mt-4 text-xs text-gray-500 text-left">
              <b>Format Excel:</b>
              <div className="bg-gray-50 border rounded p-2 mt-1">
                name, email, password, role
                <br />
                <i>Contoh:</i><br />
                admin, admin@gmail.com, rahasia123, admin
                <br />
                dosen, dosen@gmail.com, rahasia123, dosen
                <br />
                John Doe, johndoe@email.com, rahasia123, Mahasiswa
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
