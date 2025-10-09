import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ImageOff, Trash2 } from "lucide-react";

export default function UnknownFaceGallery() {
  const [unknownFaces, setUnknownFaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/unknownface")
      .then(res => {
        setUnknownFaces(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleClearAll = async () => {
    try {
      await axios.delete("http://localhost:5000/unknownface/all");
      setUnknownFaces([]);
      setShowConfirm(false);
    } catch (err) {
      alert("Gagal menghapus semua data!");
    }
  };

  // Helper untuk format hari dan tanggal Indonesia
  function formatTanggalIndonesia(dateString) {
    const date = new Date(dateString);
    const hari = date.toLocaleDateString("id-ID", { weekday: "long" });
    const tanggal = date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    return `${hari}, ${tanggal}`;
  }
  function formatJamIndonesia(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) + ' WIB';
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto px-0 sm:px-0 py-0 pb-16">
      {/* Section Header */}
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          Galeri Wajah Tidak Dikenali
        </h1>
        <div className="text-sm text-black flex items-center gap-2 mb-4">
          <Link
            to="/admin"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Galeri Wajah Tidak Dikenali</span>
        </div>
        {/* Tombol Clear Semua di bawah judul, di atas galeri */}
      
      </div>
      <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 px-5 py-2 mb-2 !bg-red-500 text-white rounded-lg shadow hover:!bg-red-600 transition font-semibold ml-2"
          title="Hapus semua data wajah tidak dikenali"
        >
          <Trash2 size={18} /> Clear
        </button>

      {/* Konfirmasi hapus semua */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <Trash2 size={22} className="text-red-600" /> Konfirmasi Hapus Semua
            </h2>
            <p className="text-gray-700 mb-6">Apakah Anda yakin ingin menghapus <b>semua</b> data wajah tidak dikenali?</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2 !bg-gray-200 text-gray-800 font-semibold rounded-lg hover:!bg-gray-300 transition shadow-md hover:shadow-lg"
              >
                Batal
              </button>
              <button
                onClick={handleClearAll}
                className="px-6 py-2 !bg-red-500 text-white font-semibold rounded-lg hover:!bg-red-600 transition shadow-md hover:shadow-lg"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : unknownFaces.length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <ImageOff className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 text-lg">Belum ada data wajah tidak dikenal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...unknownFaces].sort((a, b) => new Date(b.waktu) - new Date(a.waktu)).map((uf, idx) => (
              <div
                key={uf.uuid || idx}
                className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center p-6 border border-gray-100 group"
              >
                <div className="w-40 h-40 mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:border-blue-400 transition">
                  <img
                    src={uf.photo}
                    alt={`Unknown face ${idx + 1}`}
                    className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-xs text-gray-700 text-center font-mono bg-gray-50 px-3 py-2 rounded-lg leading-tight">
                  <div><span className="font-semibold">hari :</span> {formatTanggalIndonesia(uf.waktu)}</div>
                  <div><span className="font-semibold">jam :</span> {formatJamIndonesia(uf.waktu)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
