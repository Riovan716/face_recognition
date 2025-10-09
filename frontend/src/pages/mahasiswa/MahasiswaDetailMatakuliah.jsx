import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import {
  FaBook,
  FaHashtag,
  FaClock,
  FaCalendarAlt,
  FaUnlockAlt,
  FaClipboardList,
  FaSignOutAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Lock, AlertTriangle } from "lucide-react";

export default function MahasiswaDetailMatakuliah() {
  const { uuid } = useParams();
  const [kelas, setKelas] = useState(null);
  const [listKelas, setListKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [totalPages, setTotalPages] = useState(1);
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndMatkul = async () => {
      try {
        const [meRes, matkulRes] = await Promise.all([
          axios.get("http://localhost:5000/me", { withCredentials: true }),
          axios.get(`http://localhost:5000/matakuliah/${uuid}`, {
            withCredentials: true,
          }),
        ]);

        setUser(meRes.data);
        setKelas(matkulRes.data);

        await checkEnrollment(meRes.data.uuid, matkulRes.data.id);
      } catch (err) {
        console.error("❌ Gagal fetch user atau matkul:", err);
        setMsg("Gagal memuat data mata kuliah.");
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollment = async (userUuid, matakuliahId) => {
      try {
        const res = await axios.get(
          `http://localhost:5000/enrollments/check/${userUuid}/${matakuliahId}`,
          { withCredentials: true }
        );

        if (res.data.enrolled) {
          setIsEnrolled(true);
          const kelasRes = await axios.get(
            `http://localhost:5000/kelas/by-matakuliah/${uuid}`,
            { withCredentials: true }
          );
          setListKelas(kelasRes.data);
        }
      } catch (err) {
        console.error("❌ Gagal cek status enrol:", err);
        setMsg("Gagal cek status enrol.");
      }
    };

    fetchUserAndMatkul();
  }, [uuid]);

  useEffect(() => {
    setTotalPages(Math.ceil(listKelas.length / itemsPerPage) || 1);
  }, [listKelas]);

  // Urutkan listKelas berdasarkan waktuMulai (tanggal mulai) ascending
  const sortedListKelas = [...listKelas].sort((a, b) => {
    const tA = a.waktuMulai ? new Date(a.waktuMulai).getTime() : 0;
    const tB = b.waktuMulai ? new Date(b.waktuMulai).getTime() : 0;
    return tA - tB;
  });

  const paginatedData = sortedListKelas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUnenroll = async () => {
    try {
      await axios.delete("http://localhost:5000/enrollments", {
        data: { userUuid: user.uuid, matakuliahUuid: uuid },
        withCredentials: true,
      });
      setIsEnrolled(false);
      setListKelas([]);
      setMsg("");
    } catch (err) {
      console.error("❌ Gagal unenrol:", err);
      setMsg("Gagal unenrol matakuliah.");
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/enrollments",
        { userUuid: user.uuid, matakuliahUuid: uuid, password },
        { withCredentials: true }
      );
      setIsEnrolled(true);
      const kelasRes = await axios.get(
        `http://localhost:5000/kelas/by-matakuliah/${uuid}`,
        { withCredentials: true }
      );
      setListKelas(kelasRes.data);
      setMsg("");
    } catch (err) {
      console.error("❌ Gagal enrol:", err);
      setMsg("Gagal enrol matakuliah.");
    }
  };

  if (loading) return <p className="text-center mt-10">Memuat data...</p>;
  if (msg) return <p className="text-center text-red-500 mt-10">{msg}</p>;
  if (!kelas) return null;

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto px-0 sm:px-0 py-0 pb-16">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          Detail Matakuliah
        </h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/mahasiswa"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <Link
            to="/mahasiswa/matakuliah"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Matakuliah
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Detail</span>
        </div>
      </div>

      {msg && <p className="text-sm text-red-500 mb-4">{msg}</p>}

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-6">
        <div className="relative bg-gradient-to-br from-white to-white rounded-xl p-6 -m-6 mb-3">
          <h1 className="text-xl font-semibold text-black flex items-center ">
            {kelas.matakuliah}
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-base">
          <p>
            <strong>📘 Kode:</strong> {kelas.kodematakuliah}
          </p>
          <p>
            <strong>📅 Semester:</strong> {kelas.semester}
          </p>
          <p>
            <strong>📚 SKS:</strong> {kelas.sks}
          </p>
          <p>
            <strong>📆 Tahun Ajaran:</strong> {kelas.tahunajaran}
          </p>
        </div>
      </div>

      {!isEnrolled ? (
        <form
          onSubmit={handleEnroll}
          className="space-y-4 bg-white p-6 rounded-xl shadow-md border"
        >
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Lock className="text-blue-500" size={20} />
              Enroll Matakuliah
            </h2>
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Matakuliah
              </label>
              <Lock
                size={18}
                className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password matakuliah"
                className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white !text-black"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 !bg-blue-600 text-white font-semibold rounded-lg hover:!bg-blue-700 transition shadow-md hover:shadow-lg"
            >
              Enroll
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <div className="flex justify-between items-center mb-4">
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
              {paginatedData.map((k) => (
                <div
                  key={k.uuid}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-6 text-black">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                        {k.materi}
                      </h3>
                      <p className="text-gray-700 text-sm">
                        Mulai:{" "}
                        {k.waktuMulai
                          ? new Date(k.waktuMulai).toLocaleString()
                          : "-"}
                      </p>
                      <p className="text-gray-700 text-sm">
                        Selesai:{" "}
                        {k.waktuSelesai
                          ? new Date(k.waktuSelesai).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Link
                        to={`/mahasiswa/kelas/${k.uuid}/presensi/${uuid}`}
                        className="!text-blue-600 hover:!text-blue-700 transition-colors inline-flex items-center gap-2 bg-white rounded-xl px-2 py-2"
                      >
                        <FaClipboardList /> Lihat Presensi Saya
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowUnenrollModal(true)}
            className="flex items-center px-4 py-2.5 !bg-red-500 text-white rounded-lg hover:!bg-red-600 transition-all shadow-md hover:shadow-lg mt-6"
          >
            <FaSignOutAlt className="mr-2" /> Unenroll
          </button>
        </div>
      )}

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

      {showUnenrollModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} /> Konfirmasi Unenroll
            </h2>
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                Anda akan keluar dari mata kuliah{" "}
                <span className="font-semibold text-red-600">
                  {kelas.matakuliah}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Tindakan ini tidak dapat dibatalkan dan Anda perlu mendaftar
                ulang untuk mengikuti mata kuliah ini.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowUnenrollModal(false)}
                className="px-6 py-2.5 !bg-gray-200 text-gray-800 font-semibold rounded-lg hover:!bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  await handleUnenroll();
                  setShowUnenrollModal(false);
                  navigate("/mahasiswa/matakuliah");
                }}
                className="px-6 py-2.5 !bg-red-500 text-white font-semibold rounded-lg hover:!bg-red-600 flex items-center gap-2"
              >
                <FaSignOutAlt size={18} /> Unenroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
