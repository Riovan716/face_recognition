import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function AdminPresensiDetail() {
  const { uuid, kelasUuid } = useParams();
  const [data, setData] = useState([]);
  const [msg, setMsg] = useState("Memuat data...");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    try {
      const [enrolledRes, presensiRes] = await Promise.all([
        axios.get(`http://localhost:5000/enrollments/matakuliah/${uuid}`, {
          withCredentials: true,
        }),
        axios.get(`http://localhost:5000/presensi/by-kelas/${kelasUuid}`, {
          withCredentials: true,
        }),
      ]);
      const presensiMap = new Map();
      presensiRes.data.forEach((p) => {
        const userUuid = p.mahasiswa?.user?.uuid;
        if (userUuid) {
          presensiMap.set(userUuid, p);
        }
      });
      const combined = enrolledRes.data.map((e) => ({
        mahasiswa: {
          uuid: e.uuid,
          nim: e.nim,
          jurusan: e.jurusan,
          user: { name: e.name },
        },
        presensi: presensiMap.get(e.uuid) || null,
      }));
      // Urutkan berdasarkan NIM kecil ke besar
      const sorted = [...combined].sort((a, b) => {
        if (!a.mahasiswa.nim) return 1;
        if (!b.mahasiswa.nim) return -1;
        return a.mahasiswa.nim.localeCompare(b.mahasiswa.nim, undefined, { numeric: true });
      });
      setData(sorted);
      setMsg(
        combined.length === 0 ? "Belum ada mahasiswa yang terdaftar." : ""
      );
    } catch (err) {
      setMsg("❌ Gagal mengambil data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [uuid, kelasUuid]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto px-1 sm:px-1 py-1">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1">Daftar Presensi</h1>
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
            Detail
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Daftar Presensi</span>
        </div>
      </div>

      <div className="w-full mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-200">
        {msg ? (
          <p className="text-gray-500 italic">{msg}</p>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedData.map((entry, i) => (
                <div
                  key={i}
                  className={`py-4 px-6 rounded-lg border border-gray-200 text-black transition-all duration-300 ${
                    entry.presensi ? "bg-green-300 " : "bg-red-300 "
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <span className="text-indigo-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span className="text-gray-600">NIM:</span>
                        <span className="font-medium">
                          {entry.mahasiswa?.nim || "Tidak tersedia"}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-indigo-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span className="text-gray-600">Nama:</span>
                        <span className="font-medium">
                          {entry.mahasiswa?.user?.name || "Tidak tersedia"}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-indigo-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                        </span>
                        <span className="text-gray-600">Prodi:</span>
                        <span className="font-medium">
                          {entry.mahasiswa?.jurusan || "Tidak tersedia"}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <span className="text-indigo-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span className="text-gray-600">Waktu Absen:</span>
                        <span className="font-medium">
                          {entry.presensi
                            ? new Date(entry.presensi.waktu).toLocaleString()
                            : "Belum Absen"}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-indigo-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v2a1 1 0 102 0V3a1 1 0 00-1-1zm6 0a1 1 0 00-1 1v2a1 1 0 102 0V3a1 1 0 00-1-1zM4 7a1 1 0 00-1 1v2a1 1 0 102 0V8a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v2a1 1 0 102 0V8a1 1 0 00-1-1zM3 13a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1zm14 0a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" />
                          </svg>
                        </span>
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">
                          {entry.presensi ? "Hadir" : "Tidak Hadir"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 