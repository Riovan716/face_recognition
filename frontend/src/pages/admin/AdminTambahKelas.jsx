import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle, Book, Clock, Timer } from "lucide-react";

export default function AdminTambahKelas() {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [materi, setMateri] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [waktuSelesai, setWaktuSelesai] = useState("");
  const [matakuliah, setMatakuliah] = useState({});
  const [msg, setMsg] = useState("");
  const [showModalError, setShowModalError] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchMatakuliah = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/matakuliah/${uuid}`,
          {
            withCredentials: true,
          }
        );
        setMatakuliah(res.data);
      } catch (err) {
        setMsg("Gagal mengambil data mata kuliah");
      }
    };
    fetchMatakuliah();
  }, [uuid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!waktuMulai || !waktuSelesai) {
      setMsg("Tanggal mulai dan selesai wajib diisi");
      return;
    }
    if (new Date(waktuSelesai) <= new Date(waktuMulai)) {
      setMsg("Tanggal selesai harus lebih besar dari tanggal mulai");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:5000/kelas",
        {
          materi,
          matakuliahUuid: uuid,
          waktuMulai,
          waktuSelesai,
        },
        { withCredentials: true }
      );

      setSuccessMessage("Kelas berhasil ditambahkan");
      setShowSuccessModal(true);
      setShowConfirmModal(false);
    } catch (error) {
      setMsg(error.response?.data?.msg || "Gagal menambahkan kelas");
      setShowModalError(true);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto px-0 sm:px-0 py-0 pb-16">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          Tambah Kelas
        </h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/admin"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <Link
            to="/admin/matakuliah"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Matakuliah
          </Link>
          <span className="text-black-500">●</span>
          <Link
            to={`/admin/matakuliah/${uuid}`}
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            {matakuliah.matakuliah}
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Tambah Kelas</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-lg border">
        {msg && !showModalError && (
          <div className="text-red-600 flex gap-2 items-center mb-4">
            <AlertTriangle size={18} /> {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informasi Kelas */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Book className="text-blue-500" size={20} />
              Informasi Kelas
            </h2>

            <div className="relative group">
              <label className="block text-sm font-medium text-black mb-1">
                Materi Pembelajaran
              </label>
              <Book
                size={18}
                className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              />
              <input
                type="text"
                value={materi}
                onChange={(e) => setMateri(e.target.value)}
                placeholder="Materi"
                className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white !text-black"
                required
              />
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-black mb-1">
                Tanggal & Waktu Mulai Absensi
              </label>
              <input
                type="datetime-local"
                value={waktuMulai}
                onChange={(e) => setWaktuMulai(e.target.value)}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white !text-black"
                required
              />
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-black mb-1">
                Tanggal & Waktu Selesai Absensi
              </label>
              <input
                type="datetime-local"
                value={waktuSelesai}
                onChange={(e) => setWaktuSelesai(e.target.value)}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white !text-black"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 !bg-green-500 text-white font-semibold rounded-lg hover:!bg-green-600 transition shadow-md hover:shadow-lg"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>

      {/* Modal Konfirmasi */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-yellow-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} className="text-yellow-500" /> Konfirmasi
            </h2>
            <p className="text-gray-700 mb-6">
              Apakah Anda yakin ingin menambahkan kelas ini?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2.5 !bg-gray-200 text-gray-800 font-semibold rounded-lg hover:!bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-6 py-2.5 !bg-yellow-500 text-white font-semibold rounded-lg hover:!bg-yellow-600"
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex justify-center items-center gap-2">
              <CheckCircle size={22} className="text-green-500" /> Sukses
            </h2>
            <p className="text-gray-700 mb-6">{successMessage}</p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate(`/admin/matakuliah/${uuid}`);
              }}
              className="px-8 py-2.5 !bg-green-500 text-white font-semibold rounded-lg hover:!bg-green-600"
            >
              Kembali ke Detail Matakuliah
            </button>
          </div>
        </div>
      )}

      {/* Modal Error */}
      {showModalError && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} className="text-red-500" /> Error
            </h2>
            <p className="text-gray-700 mb-6">{msg}</p>
            <button
              onClick={() => setShowModalError(false)}
              className="px-8 py-2.5 !bg-red-500 text-white font-semibold rounded-lg hover:!bg-red-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 