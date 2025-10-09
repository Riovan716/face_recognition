import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle,
  Book,
  Code,
  Layers,
  ListOrdered,
  Calendar,
  Key,
} from "lucide-react";

export default function TambahMatakuliah() {
  const navigate = useNavigate();
  const [matakuliah, setMatakuliah] = useState("");
  const [kodematakuliah, setKodeMatakuliah] = useState("");
  const [semester, setSemester] = useState("");
  const [sks, setSks] = useState("");
  const [tahunajaran, setTahunAjaran] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [msg, setMsg] = useState("");
  const [showModalError, setShowModalError] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get("http://localhost:5000/me", {
          withCredentials: true,
        });
        setUserId(res.data.id);
      } catch (err) {
        setMsg("Gagal mengambil data user");
      }
    };
    fetchMe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:5000/matakuliah",
        {
          matakuliah,
          kodematakuliah,
          semester,
          sks,
          tahunajaran,
          password,
          userId,
        },
        { withCredentials: true }
      );

      setSuccessMessage("Mata kuliah berhasil ditambahkan");
      setShowSuccessModal(true);
      setShowConfirmModal(false);
    } catch (error) {
      setMsg(error.response?.data?.msg || "Gagal menambahkan mata kuliah");
      setShowModalError(true);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto px-4 sm:px-6 py-0 pb-16">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
           Tambah Mata Kuliah
        </h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/dosen"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <Link
            to="/dosen/matakuliah"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Matakuliah
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Tambah</span>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-xl p-6">
        {msg && !showModalError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              <p className="text-red-700 font-medium">{msg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mata Kuliah</label>
            <Book
              size={18}
              className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              value={matakuliah}
              onChange={(e) => setMatakuliah(e.target.value)}
              placeholder="Masukkan nama mata kuliah"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white !text-black"
              required
            />
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Mata Kuliah</label>
            <Code
              size={18}
              className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              value={kodematakuliah}
              onChange={(e) => setKodeMatakuliah(e.target.value)}
              placeholder="Masukkan kode mata kuliah"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white !text-black"
              required
            />
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <Layers
              size={18}
              className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="number"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="Masukkan semester"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white !text-black"
              required
            />
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah SKS</label>
            <ListOrdered
              size={18}
              className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="number"
              value={sks}
              onChange={(e) => setSks(e.target.value)}
              placeholder="Masukkan jumlah SKS"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white !text-black"
              required
            />
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
            <Calendar
              size={18}
              className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="number"
              value={tahunajaran}
              onChange={(e) => setTahunAjaran(e.target.value)}
              placeholder="Masukkan tahun ajaran"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white !text-black"
              required
            />
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Key
              size={18}
              className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white !text-black"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 !bg-green-500 text-white font-semibold rounded-lg hover:!bg-green-600 transition"
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
              Apakah Anda yakin ingin menambahkan mata kuliah ini?
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

      {/* Modal Kesalahan */}
      {showModalError && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} /> Gagal Menambahkan
            </h2>
            <p className="text-gray-700 mb-6">
              {msg || "Terjadi kesalahan. Periksa kembali input Anda."}
            </p>
            <button
              onClick={() => setShowModalError(false)}
              className="px-6 py-2.5 !bg-red-500 text-gray-800 font-semibold rounded-lg hover:!bg-red-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Sukses */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex justify-center items-center gap-2">
              <CheckCircle size={22} /> Berhasil
            </h2>
            <p className="text-gray-700 mb-6">{successMessage}</p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/dosen/matakuliah");
              }}
              className="px-6 py-2.5 !bg-green-500 text-white font-semibold rounded-lg hover:!bg-green-600"
            >
              Kembali ke Matakuliah
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, type = "text", ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        {...props}
        className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 !text-black"
      />
    </div>
  );
}
