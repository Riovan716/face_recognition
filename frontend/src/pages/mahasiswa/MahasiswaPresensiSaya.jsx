import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Calendar, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

export default function MahasiswaPresensiStatus() {
  const { kelasUuid, matakuliahUuid } = useParams();
  const [hadirList, setHadirList] = useState([]);
  const [msg, setMsg] = useState("Memuat status presensi...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          "http://localhost:5000/presensi/status-mahasiswa",
          {
            withCredentials: true,
          }
        );

        console.log("✅ Daftar hadir:", res.data.hadir);
        setHadirList(res.data.hadir || []);

        if (!res.data.hadir.includes(kelasUuid)) {
          setMsg("Anda belum hadir di kelas ini");
        } else {
          setMsg("Anda telah hadir di kelas ini");
        }
      } catch (err) {
        console.error("❌ Gagal mengambil data presensi:", err);
        setMsg("Gagal mengambil data presensi");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [kelasUuid]);

  const isPresent = msg.includes("telah hadir");

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Status Presensi</h1>
          </div>

          {/* Breadcrumb */}
          <nav className="mt-2">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link
                  to="/mahasiswa"
                  className="!text-black hover:!text-blue-600"
                >
                  Dashboard
                </Link>
              </li>
              <span className="text-black">●</span>
              <li>
                <Link
                  to="/mahasiswa/matakuliah"
                  className="!text-black hover:!text-blue-600"
                >
                  Data Matakuliah
                </Link>
              </li>
              {matakuliahUuid && (
                <>
                  <span className="text-black">●</span>
                  <li>
                    <Link
                      to={`/mahasiswa/matakuliah/${matakuliahUuid}`}
                      className="!text-black hover:!text-blue-600"
                    >
                      Detail Matakuliah
                    </Link>
                  </li>
                </>
              )}
              <span className="text-black">●</span>
              <li className="text-gray-900 font-medium">Status Presensi</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Status Kehadiran Kelas
              </h2>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div
                className={`p-6 rounded-lg ${
                  isPresent ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <div className="flex items-center">
                  {isPresent ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500 mr-4" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500 mr-4" />
                  )}
                  <div>
                    <p
                      className={`text-lg font-medium ${
                        isPresent ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {msg}
                    </p>
                    <p className="text-sm text-black mt-1">
                      {isPresent
                        ? "Data Kehadiran Anda Telah Disimpan"
                        : "Silakan lakukan presensi pada kelas ini"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
