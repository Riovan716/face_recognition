import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function DosenPresensiKelas() {
  const { uuid, kelasUuid } = useParams();
  const [data, setData] = useState([]);
  const [msg, setMsg] = useState("Memuat data...");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    try {
      console.time("FETCH SEMUA");

      const [enrolledRes, presensiRes] = await Promise.all([
        axios.get(`http://localhost:5000/enrollments/matakuliah/${uuid}`, {
          withCredentials: true,
        }),
        axios.get(`http://localhost:5000/presensi/by-kelas/${kelasUuid}`, {
          withCredentials: true,
        }),
      ]);

      console.timeEnd("FETCH SEMUA");

      // Buat map berdasarkan UUID user
      const presensiMap = new Map();
      presensiRes.data.forEach((p) => {
        const userUuid = p.mahasiswa?.user?.uuid;
        if (userUuid) {
          presensiMap.set(userUuid, p);
        }
      });

      // Gabungkan data enrollment + presensi
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
        sorted.length === 0 ? "Belum ada mahasiswa yang terdaftar." : ""
      );
    } catch (err) {
      console.error("[FETCH ERROR]", err.message);
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
            to="/dosen"
            className="hover:underline !text-black hover:!text-blue-600"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <Link
            to="/dosen/matakuliah"
            className="hover:underline !text-black hover:!text-blue-600"
          >
            Matakuliah
          </Link>
          <span className="text-black-500">●</span>
          <Link
            to={`/dosen/matakuliah/${uuid}`}
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
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`font-medium px-3 py-1 rounded-full text-sm ${
                            entry.presensi
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {entry.presensi ? "Hadir" : "Belum Hadir"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="w-full flex justify-center mt-10 px-4 py-2 rounded-full items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`w-8 h-8 rounded-full border ${
                    currentPage === 1
                      ? "bg-gray-200 text-black cursor-not-allowed"
                      : "bg-white text-black hover:bg-gray-300"
                  }`}
                >
                  ◀
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-full border ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white text-black hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`w-8 h-8 rounded-full border ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-black cursor-not-allowed"
                      : "bg-white text-black hover:bg-gray-300"
                  }`}
                >
                  ▶
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
