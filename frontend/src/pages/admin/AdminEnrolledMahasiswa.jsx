import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  FaUserGraduate,
  FaEnvelope,
  FaIdBadge,
  FaUniversity,
  FaTrashAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { AlertTriangle } from "lucide-react";

export default function AdminEnrolledMahasiswa() {
  const { uuid } = useParams();
  const [mahasiswa, setMahasiswa] = useState([]);
  const [matkul, setMatkul] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(mahasiswa.length / itemsPerPage);

  const paginatedData = mahasiswa.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchData();
  }, [uuid]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const matkulRes = await axios.get(
        `http://localhost:5000/matakuliah/${uuid}`,
        { withCredentials: true }
      );
      setMatkul(matkulRes.data);

      const res = await axios.get(
        `http://localhost:5000/enrollments/matakuliah/${uuid}/with-presensi`,
        { withCredentials: true }
      );
      const sorted = [...res.data].sort((a, b) => {
        if (!a.nim) return 1;
        if (!b.nim) return -1;
        return a.nim.localeCompare(b.nim, undefined, { numeric: true });
      });
      setMahasiswa(sorted);
    } catch (err) {
      setMsg("Gagal memuat data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!selectedMahasiswa) return;
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/enrollments`, {
        data: {
          userUuid: selectedMahasiswa.uuid,
          matakuliahUuid: uuid,
        },
        withCredentials: true,
      });
      setMahasiswa(
        mahasiswa.filter((mhs) => mhs.uuid !== selectedMahasiswa.uuid)
      );
      setShowDeleteModal(false);
      setSelectedMahasiswa(null);
      setIsDeleting(false);
      setShowSuccessModal(true);
    } catch (err) {
      setIsDeleting(false);
      console.error("Gagal unenroll:", err.response?.data || err.message);
      setMsg("Gagal menghapus mahasiswa dari enrolment.");
      setTimeout(() => setMsg(""), 5000);
    }
  };

  if (loading) return <p className="text-center mt-10">Memuat data...</p>;
  if (msg) return <p className="text-center text-red-500 mt-10">{msg}</p>;

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto px-0 sm:px-0 py-0 pb-15">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          Daftar Mahasiswa
        </h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/admin"
            className="hover:underline !text-black hover:!text-blue-600"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <Link
            to="/admin/matakuliah-absen"
            className="hover:underline !text-black hover:!text-blue-600"
          >
            Data Matakuliah
          </Link>
          <span className="text-black-500">●</span>
          <Link
            to={`/admin/matakuliah/${uuid}`}
            className="hover:underline !text-black hover:!text-blue-600"
          >
            Detail Matakuliah
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Daftar Mahasiswa</span>
        </div>
      </div>

      

      <div className="w-full mx-auto bg-white rounded-xl shadow-md border border-gray-200 p-4 min-w-[600px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Mahasiswa Terdaftar ({mahasiswa.length} orang)
          </h3>
        </div>

        {paginatedData.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Belum ada mahasiswa yang terdaftar.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedData.map((mhs, idx) => (
              <div
                key={mhs.uuid}
                className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  mhs.persentaseHadir >= 80
                    ? "border-green-300 hover:border-green-400"
                    : mhs.persentaseHadir >= 50
                    ? "border-yellow-300 hover:border-yellow-400"
                    : "border-red-300 hover:border-red-400"
                }`}
              >
                {/* Attendance Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold text-white ${
                  mhs.persentaseHadir >= 80
                    ? "bg-green-500"
                    : mhs.persentaseHadir >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}>
                  {mhs.persentaseHadir ?? 0}%
                </div>

                {/* Student Photo */}
                <div className="flex justify-center mt-4 mb-2">
                  <img
                    src={`http://localhost:5000/mahasiswa/face_recognition/dataset/${mhs.nim}.jpg`}
                    alt={mhs.name}
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "50%", border: "2px solid #eee" }}
                    onError={e => e.target.style.display='none'}
                  />
                </div>

                {/* Student Info */}
                <div className="p-4 pt-2">
                  <h3 className="font-semibold text-gray-800 text-lg mb-1 truncate" title={mhs.name}>
                    {mhs.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">NIM:</span> {mhs.nim || "-"}
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    <span className="font-medium">Jurusan:</span> {mhs.jurusan || "-"}
                  </p>
                  {/* Action Button */}
                  <button
                    onClick={() => {
                      setSelectedMahasiswa(mhs);
                      setShowDeleteModal(true);
                    }}
                    className="w-full px-4 py-2 !bg-red-600 text-white rounded-lg hover:!bg-red-700 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <FaTrashAlt size={14} /> Hapus
                  </button>
                </div>
              </div>
            ))}
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
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} /> Konfirmasi Hapus
            </h2>
            <div className="bg-red-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700">
                Anda akan menghapus mahasiswa{" "}
                <span className="font-semibold text-red-600">
                  {selectedMahasiswa?.name}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua
                data presensi terkait.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMahasiswa(null);
                }}
                className="px-6 py-2.5 !bg-gray-200 text-gray-800 font-semibold rounded-xl hover:!bg-gray-300 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleUnenroll}
                disabled={isDeleting}
                className={`px-6 py-2.5 font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  isDeleting
                    ? "!bg-gray-400 text-white cursor-not-allowed"
                    : "!bg-red-500 text-white hover:!bg-red-600"
                }`}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <FaTrashAlt size={18} /> Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md text-center shadow-xl border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex justify-center items-center gap-2">
              <FaCheckCircle size={22} /> Berhasil!
            </h2>
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700">
                Mahasiswa{" "}
                <span className="font-semibold text-green-600">
                  {selectedMahasiswa?.name}
                </span>{" "}
                berhasil dihapus dari matakuliah.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Semua data presensi terkait juga telah dihapus.
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setSelectedMahasiswa(null);
                }}
                className="px-6 py-2.5 !bg-green-500 text-white font-semibold rounded-xl hover:!bg-green-600 transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
