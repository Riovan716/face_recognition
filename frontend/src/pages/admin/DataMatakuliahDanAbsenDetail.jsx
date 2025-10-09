import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  FaChalkboardTeacher,
  FaClock,
  FaCalendarAlt,
  FaEdit,
  FaFolderOpen,
  FaTrashAlt,
} from "react-icons/fa";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

export default function DataMatakuliahDanAbsen() {
  const { uuid } = useParams();
  const [kelas, setKelas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [listKelas, setListKelas] = useState([]);

  // State untuk hapus matakuliah
  const [showDeleteMatakuliahModal, setShowDeleteMatakuliahModal] =
    useState(false);
  const [showSuccessMatakuliahModal, setShowSuccessMatakuliahModal] =
    useState(false);
  const [deleteMatakuliahId, setDeleteMatakuliahId] = useState(null);

  // State untuk hapus kelas
  const [showDeleteKelasModal, setShowDeleteKelasModal] = useState(false);
  const [showSuccessKelasModal, setShowSuccessKelasModal] = useState(false);
  const [deleteKelasId, setDeleteKelasId] = useState(null);
  const [deleteKelasName, setDeleteKelasName] = useState("");

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matakuliahRes, kelasRes] = await Promise.all([
        axios.get(`http://localhost:5000/matakuliah/${uuid}`, {
          withCredentials: true,
        }),
        axios.get(`http://localhost:5000/kelas/by-matakuliah/${uuid}`, {
          withCredentials: true,
        }),
      ]);
      setKelas(matakuliahRes.data);
      // Urutkan kelas berdasarkan waktuMulai paling awal ke paling akhir
      const sortedKelas = [...kelasRes.data].sort((a, b) => {
        if (!a.waktuMulai) return 1;
        if (!b.waktuMulai) return -1;
        return new Date(a.waktuMulai) - new Date(b.waktuMulai);
      });
      setListKelas(sortedKelas);
      setDeleteMatakuliahId(matakuliahRes.data.id);
    } catch (err) {
      console.error("Error fetching data:", err.response?.data || err.message);
      setMsg(
        `Gagal memuat data: ${
          err.response?.status === 500
            ? "Terjadi kesalahan di server"
            : err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [uuid]);

  // Handler untuk hapus Matakuliah
  const handleDeleteMatakuliah = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/matakuliah/${deleteMatakuliahId}`,
        {
          withCredentials: true,
        }
      );
      setShowDeleteMatakuliahModal(false);
      setShowSuccessMatakuliahModal(true);
    } catch (err) {
      alert("Gagal menghapus: " + (err.response?.data?.msg || err.message));
    }
  };

  // Handler untuk hapus Kelas
  const handleDeleteKelas = async () => {
    try {
      await axios.delete(`http://localhost:5000/kelas/${deleteKelasId}`, {
        withCredentials: true,
      });
      setShowDeleteKelasModal(false);
      setShowSuccessKelasModal(true);
      // Refresh data kelas setelah berhasil hapus
      fetchData();
    } catch (err) {
      alert(
        "Gagal menghapus kelas: " + (err.response?.data?.msg || err.message)
      );
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Memuat data...</p>;
  if (msg) return <p className="text-center text-red-500 mt-10">{msg}</p>;
  if (!kelas) return null;

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto px-0 sm:px-0 py-0 pb-15">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1">Detail Matakuliah</h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/admin"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <Link
            to="/admin/matakuliah-absen"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Data Matakuliah
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Detail Matakuliah</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-4">
          <FaFolderOpen className="text-blue-500" /> {kelas.matakuliah}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-base">
          <p>
            <span className="font-semibold">📘 Kode:</span>{" "}
            {kelas.kodematakuliah}
          </p>
          <p>
            <span className="font-semibold">📅 Semester:</span> {kelas.semester}
          </p>
          <p>
            <span className="font-semibold">📚 SKS:</span> {kelas.sks}
          </p>
          <p>
            <span className="font-semibold">📆 Tahun Ajaran:</span>{" "}
            {kelas.tahunajaran}
          </p>
        </div>
        <div className="text-left mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/admin/matakuliah/${uuid}/tambah-kelas`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 !bg-blue-600 text-white rounded-xl hover:!bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            ➕ Tambah Kelas
          </button>
          <button
            onClick={() => navigate(`/admin/matakuliah/${uuid}/enrolled`)}
            className="inline-flex items-center gap-2 px-5 py-2 !bg-blue-600 text-white rounded-md shadow hover:!bg-blue-700 transition"
          >
            <FaFolderOpen /> Daftar Mahasiswa
          </button>
          <button
            onClick={() => navigate(`/admin/matakuliah/${uuid}/edit`)}
            className="inline-flex items-center gap-2 px-5 py-2 !bg-yellow-500 text-white rounded-md shadow hover:!bg-yellow-600 transition"
          >
            <FaEdit /> Edit Mata Kuliah
          </button>
          <button
            onClick={() => setShowDeleteMatakuliahModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2 !bg-red-600 text-white rounded-md shadow hover:!bg-red-700 transition"
          >
            <FaTrashAlt /> Hapus Mata Kuliah
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Daftar Kelas
          </h2>
        </div>
        {listKelas.length === 0 ? (
          <p className="text-gray-600 italic">
            Belum ada kelas yang ditambahkan.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listKelas.map((k) => (
              <div
                key={k.uuid}
                className="group relative bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={e => {
                  // Cegah klik pada tombol hapus memicu navigasi
                  if (e.target.closest('.btn-hapus-kelas')) return;
                  navigate(`/admin/matakuliah/${uuid}/kelas/${k.uuid}/presensi`);
                }}
              >
                {/* Tombol Hapus Kelas */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setDeleteKelasId(k.uuid);
                    setDeleteKelasName(k.materi);
                    setShowDeleteKelasModal(true);
                  }}
                  className="btn-hapus-kelas absolute top-3 right-3 !bg-red-700 p-2 rounded-full text-white opacity-50 group-hover:opacity-100 group-hover:bg-red-500 transition-all duration-300 z-10"
                  aria-label="Hapus Kelas"
                >
                  <FaTrashAlt size={14} />
                </button>
                <div className="relative p-6 text-white">
                  <div className="pr-8">
                    <p className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FaChalkboardTeacher /> {k.materi}
                    </p>
                    <p className="text-sm mb-1 opacity-90 flex items-center gap-2">
                      <FaClock /> Mulai:{" "}
                      {k.waktuMulai
                        ? new Date(k.waktuMulai).toLocaleString()
                        : "-"}
                    </p>
                    <p className="text-sm opacity-90 flex items-center gap-2">
                      <FaClock /> Selesai:{" "}
                      {k.waktuSelesai
                        ? new Date(k.waktuSelesai).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus Matakuliah */}
      {showDeleteMatakuliahModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} /> Konfirmasi Hapus
            </h2>
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                Anda akan menghapus mata kuliah{" "}
                <span className="font-semibold text-red-600">
                  {kelas.matakuliah}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua
                data terkait.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteMatakuliahModal(false)}
                className="px-6 py-2.5 !bg-gray-200 text-gray-800 font-semibold rounded-lg hover:!bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteMatakuliah}
                className="px-6 py-2.5 !bg-red-500 text-white font-semibold rounded-lg hover:!bg-red-600 flex items-center gap-2"
              >
                <FaTrashAlt size={18} /> Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses Hapus Matakuliah */}
      {showSuccessMatakuliahModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex justify-center items-center gap-2">
              <CheckCircle size={22} /> Berhasil
            </h2>
            <p className="text-gray-700 mb-6">
              Mata kuliah dan semua kelasnya berhasil dihapus.
            </p>
            <button
              onClick={() => {
                setShowSuccessMatakuliahModal(false);
                navigate("/admin/matakuliah-absen");
              }}
              className="px-4 py-2 !bg-green-500 text-white font-semibold rounded hover:!bg-green-600"
            >
              Kembali ke Matakuliah
            </button>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Kelas */}
      {showDeleteKelasModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} /> Konfirmasi Hapus Kelas
            </h2>
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                Anda yakin ingin menghapus kelas: <br />
                <span className="font-semibold text-red-600">
                  {deleteKelasName}
                </span>
                ?
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Semua data presensi terkait kelas ini juga akan terhapus.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteKelasModal(false)}
                className="px-6 py-2.5 !bg-gray-200 text-gray-800 font-semibold rounded-lg hover:!bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteKelas}
                className="px-6 py-2.5 !bg-red-500 text-white font-semibold rounded-lg hover:!bg-red-600 flex items-center gap-2"
              >
                <FaTrashAlt size={18} /> Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses Hapus Kelas */}
      {showSuccessKelasModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex justify-center items-center gap-2">
              <CheckCircle size={22} /> Berhasil
            </h2>
            <p className="text-gray-700 mb-6">Kelas berhasil dihapus.</p>
            <button
              onClick={() => setShowSuccessKelasModal(false)}
              className="px-4 py-2 !bg-green-500 text-white font-semibold rounded hover:!bg-green-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
