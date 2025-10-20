import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import * as faceapi from "face-api.js";
import axios from "axios";
import {
  FaChalkboardTeacher,
  FaClock,
  FaCalendarAlt,
  FaEdit,
  FaFolderOpen,
  FaTrashAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { AlertTriangle } from "lucide-react";
import {
  Camera,
  X,
  Info,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function DosenDetailMatakuliah() {
  const { uuid } = useParams();
  const [kelas, setKelas] = useState(null);
  const [listKelas, setListKelas] = useState([]);
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("Menunggu...");
  const [loading, setLoading] = useState(true);
  const [aktifKelasUuid, setAktifKelasUuid] = useState(null);
  const [detectedNIMs, setDetectedNIMs] = useState([]);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();
  const intervalRef = useRef();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [studentsWithFace, setStudentsWithFace] = useState([]);
  const [showDeleteKelasModal, setShowDeleteKelasModal] = useState(false);
  const [deleteKelasData, setDeleteKelasData] = useState(null);
  const [isDeletingKelas, setIsDeletingKelas] = useState(false);
  const [showKelasSuccessModal, setShowKelasSuccessModal] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState({});
  const [sessionUnknownFaces, setSessionUnknownFaces] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`[FETCH] Mengambil data untuk matakuliah UUID: ${uuid}`);
        const [matkulRes, kelasRes] = await Promise.all([
          axios.get(`http://localhost:5000/matakuliah/${uuid}`, {
            withCredentials: true,
          }),
          axios.get(`http://localhost:5000/kelas/by-matakuliah/${uuid}`, {
            withCredentials: true,
          }),
        ]);
        setKelas(matkulRes.data);
        // Urutkan kelas berdasarkan waktuMulai paling awal ke paling akhir
        const sortedKelas = [...kelasRes.data].sort((a, b) => {
          if (!a.waktuMulai) return 1;
          if (!b.waktuMulai) return -1;
          return new Date(a.waktuMulai) - new Date(b.waktuMulai);
        });
        setListKelas(sortedKelas);
        console.log("[FETCH] Data berhasil diambil:", {
          matkul: matkulRes.data,
          kelas: kelasRes.data,
        });
      } catch (err) {
        const errorMsg = err.response?.data?.msg || err.message;
        console.error(`[FETCH ERROR] Gagal memuat data: ${errorMsg}`);
        setMsg(`Gagal memuat data: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uuid]);
  useEffect(() => {
    setTotalPages(Math.ceil(listKelas.length / itemsPerPage) || 1);
  }, [listKelas]);

  const paginatedData = listKelas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const stopCamera = () => {
    console.log("[CAMERA] Menghentikan kamera");
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsCameraOn(false);
    setAktifKelasUuid(null);
    setDetectedNIMs([]);
    setStatus("Kamera dimatikan.");
    setCapturedPhotos({});
    setSessionUnknownFaces([]);
  };

  const openCameraOnly = async (kelasUuid) => {
    stopCamera();
    setAktifKelasUuid(kelasUuid);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
      setStatus("Kamera aktif (belum mendeteksi wajah)");
      const res = await axios.get(
        `http://localhost:5000/mahasiswa/deskriptor/${uuid}`,
        { withCredentials: true }
      );
      setStudentsWithFace(
        res.data.map((item) => ({ nim: item.nim, nama: item.nama }))
      );
      const presensiRes = await axios.get(
        `http://localhost:5000/presensi/by-kelas/${kelasUuid}`,
        { withCredentials: true }
      );
      const hadirNIMs = presensiRes.data
        .map((p) => p.mahasiswa?.nim)
        .filter(Boolean);
      setDetectedNIMs(hadirNIMs);
      console.log("Presensi sudah hadir:", presensiRes.data);
      console.log("NIM hadir:", hadirNIMs);
    } catch (err) {
      console.error("[CAMERA ERROR]", err.message);
      setStatus("❌ Gagal membuka kamera.");
    }
  };

  const startDetectionOnly = async () => {
    console.log(
      `[DETECTION] Mulai proses deteksi untuk kelas UUID: ${aktifKelasUuid}`
    );
    setStatus("🔄 Memuat model...");

    try {
      console.log("[FACEAPI] Memuat model face-api.js");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      console.log("✅ [FACEAPI] Semua model berhasil dimuat");
    } catch (err) {
      console.error(
        `❌ [FACEAPI ERROR] Gagal memuat model wajah: ${err.message}`
      );
      setStatus("❌ Gagal memuat model wajah.");
      return;
    }

    let res;
    try {
      console.log(
        `[API] Mengambil deskriptor wajah untuk matakuliah UUID: ${uuid}`
      );
      res = await axios.get(
        `http://localhost:5000/mahasiswa/deskriptor/${uuid}`,
        { withCredentials: true }
      );
      if (!Array.isArray(res.data))
        throw new Error("Respon server tidak valid");
      setStudentsWithFace(
        res.data.map((item) => ({ nim: item.nim, nama: item.nama }))
      );
      console.log(
        `[API] Deskriptor wajah diterima: ${res.data.length} mahasiswa`,
        res.data
      );
    } catch (err) {
      console.error(`❌ [API ERROR] Gagal fetch deskriptor: ${err.message}`);
      setStatus("❌ Gagal fetch deskriptor wajah.");
      return;
    }

    const labeled = res.data.map(
      (item) =>
        new faceapi.LabeledFaceDescriptors(item.nim, [
          new Float32Array(item.descriptor),
        ])
    );
    const matcher = new faceapi.FaceMatcher(labeled, 0.5);

    const detectedSet = new Set();

    let retry = 0;
    while (
      (!videoRef.current || videoRef.current.readyState < 2) &&
      retry < 20
    ) {
      await new Promise((res) => setTimeout(res, 500));
      retry++;
    }

    if (retry === 20) {
      setStatus("❌ Video tidak bisa dimulai.");
      console.error("[VIDEO] Video tidak bisa dimulai setelah 20x percobaan");
      return;
    }

    intervalRef.current = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptors();

      console.log("[DETECTION] Jumlah wajah terdeteksi:", detections.length);

      const matched = detections
        .map((d) => matcher.findBestMatch(d.descriptor))
        .filter((match) => match.label !== "unknown")
        .map((match) => match.label);

      console.log("[DETECTION] NIM terdeteksi:", matched);

      const newDetected = matched.filter((nim) => !detectedSet.has(nim));
      if (newDetected.length > 0) {
        setStatus(`📤 Mengirim presensi untuk: ${newDetected.join(", ")}`);

        // Capture photo for each newly detected student
        newDetected.forEach((nim) => {
          capturePhoto(nim);
        });

        try {
          console.log("[API] Kirim presensi otomatis:", newDetected);
          const response = await axios.post(
            `http://localhost:5000/createpresensi/otomatis/${aktifKelasUuid}`,
            { nims: newDetected },
            { withCredentials: true }
          );
          console.log("[API] Response presensi otomatis:", response.data);
          newDetected.forEach((nim) => detectedSet.add(nim));
          setDetectedNIMs((prev) => [...prev, ...newDetected]);
          setStatus(`✅ Presensi berhasil untuk: ${newDetected.join(", ")}`);
        } catch (err) {
          setStatus(
            `❌ Gagal simpan presensi untuk: ${newDetected.join(", ")}`
          );
          console.error("[API ERROR] Gagal simpan presensi otomatis:", err);
        }
      }

      // Tangkap wajah unknown
      const unknowns = detections
        .map((d, i) => ({
          match: matcher.findBestMatch(d.descriptor),
          detection: d,
        }))
        .filter((obj) => obj.match.label === "unknown");
      if (unknowns.length > 0) {
        for (const obj of unknowns) {
          if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const context = canvas.getContext("2d");
            const box = obj.detection.detection.box;
            const x = Math.max(0, Math.floor(box.x));
            const y = Math.max(0, Math.floor(box.y));
            const width = Math.min(video.videoWidth - x, Math.floor(box.width));
            const height = Math.min(video.videoHeight - y, Math.floor(box.height));
            canvas.width = width;
            canvas.height = height;
            context.drawImage(
              video,
              x, y, width, height,
              0, 0, width, height
            );
            const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8);
            setSessionUnknownFaces((prev) => [...prev, { photo: photoDataUrl }]);
          }
        }
      }
    }, 50);
  };

  // Function to capture photo from video stream
  const capturePhoto = (nim) => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to data URL (base64 image)
      const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8);

      // Store the captured photo
      setCapturedPhotos((prev) => ({
        ...prev,
        [nim]: photoDataUrl,
      }));
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/matakuliah/${deleteId}`, {
        withCredentials: true,
      });
      setShowDeleteModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      alert("Gagal menghapus: " + (err.response?.data?.msg || err.message));
    }
  };

  const confirmDeleteKelas = (kelas) => {
    setDeleteKelasData(kelas);
    setShowDeleteKelasModal(true);
  };

  const handleDeleteKelas = async () => {
    setIsDeletingKelas(true);
    try {
      await axios.delete(
        `http://localhost:5000/kelas/${deleteKelasData.uuid}`,
        {
          withCredentials: true,
        }
      );
      setShowDeleteKelasModal(false);
      setDeleteKelasData(null);
      setIsDeletingKelas(false);

      // Show success modal
      setShowKelasSuccessModal(true);

      // Refresh the class list
      const kelasRes = await axios.get(
        `http://localhost:5000/kelas/by-matakuliah/${uuid}`,
        {
          withCredentials: true,
        }
      );
      // Urutkan kelas berdasarkan waktuMulai paling awal ke paling akhir
      const sortedKelas = [...kelasRes.data].sort((a, b) => {
        if (!a.waktuMulai) return 1;
        if (!b.waktuMulai) return -1;
        return new Date(a.waktuMulai) - new Date(b.waktuMulai);
      });
      setListKelas(sortedKelas);
    } catch (err) {
      setIsDeletingKelas(false);
      const errorMsg = err.response?.data?.msg || err.message;
      setMsg("Gagal menghapus kelas: " + errorMsg);
      setTimeout(() => setMsg(""), 5000);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Memuat data...</p>;
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
          <span className="text-black font-medium">Detail Matakuliah</span>
        </div>
      </div>

      {msg && <p className="text-sm text-red-500 mb-4">{msg}</p>}

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-6">
        <div className="relative bg-gradient-to-br from-white to-white rounded-xl p-6 -m-6 mb-6">
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
        <div className="text-left mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/dosen/matakuliah/${uuid}/kelas/tambah`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 !bg-blue-600 text-white rounded-xl hover:!bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            ➕ Tambah Kelas
          </button>
          <button
            onClick={() => navigate(`/dosen/matakuliah/${uuid}/edit`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 !bg-yellow-500 text-white rounded-xl hover:!bg-yellow-600 transition-all shadow-md hover:shadow-lg"
          >
            <FaEdit /> Edit Mata Kuliah
          </button>
          <button
            onClick={() => navigate(`/dosen/matakuliah/${uuid}/enrolled`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 !bg-blue-600 text-white rounded-xl hover:!bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            📋 Daftar Mahasiswa
          </button>
          <button
            onClick={() => confirmDelete(kelas.id)}
            className="inline-flex items-center gap-2 px-5 py-2.5 !bg-red-600 text-white rounded-xl hover:!bg-red-700 transition-all shadow-md hover:shadow-lg"
          >
            <FaTrashAlt /> Hapus Mata Kuliah
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Daftar Kelas
        </h2>
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
                <div className="relative p-6 text-white">
                  <p className="text-lg font-semibold mb-2">
                    <FaChalkboardTeacher className="inline mr-2" /> {k.materi}
                  </p>
                  <p className="text-sm mb-1">
                    <FaClock className="inline mr-2" /> Mulai:{" "}
                    {k.waktuMulai
                      ? new Date(k.waktuMulai).toLocaleString()
                      : "-"}
                  </p>
                  <p className="text-sm mb-1">
                    <FaClock className="inline mr-2" /> Selesai:{" "}
                    {k.waktuSelesai
                      ? new Date(k.waktuSelesai).toLocaleString()
                      : "-"}
                  </p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setShowCameraModal(true);
                        openCameraOnly(k.uuid);
                      }}
                      className="!bg-white !text-blue-600 px-4 py-2 rounded-xl hover:!bg-gray-100 transition-all shadow-sm hover:shadow"
                    >
                      🔍 Buka Kamera
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/dosen/matakuliah/${uuid}/presensi/${k.uuid}`)
                      }
                      className="!bg-white !text-blue-600 px-4 py-2 rounded-xl hover:!bg-gray-100 transition-all shadow-sm hover:shadow"
                    >
                      📄 Daftar Absen
                    </button>
                    <button
                      onClick={() => confirmDeleteKelas(k)}
                      className="!bg-white !text-red-600 px-4 py-2 rounded-xl hover:!bg-red-50 transition-all shadow-sm hover:shadow"
                    >
                      🗑️ Hapus Kelas
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCameraModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-none w-screen h-screen p-0 m-0 shadow-none border-none flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-blue-500">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Camera className="text-blue-500" size={28} /> Kamera Absensi
              </h2>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Area kamera sangat kecil di atas galeri */}
              <div className="flex justify-center items-center w-full py-2">
                <div className="relative w-[1px] h-[1px] flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute left-0 top-0 w-full h-full object-cover z-0 rounded-full border border-gray-300 bg-black"
                    style={{ display: isCameraOn ? 'block' : 'none' }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute left-0 top-0 w-full h-full z-10 pointer-events-none rounded-full"
                    style={{ display: isCameraOn ? 'block' : 'none' }}
                  />
                  {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-20 rounded-full">
                      <div className="text-white text-center">
                        <Camera size={10} className="mx-auto mb-0 opacity-50" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {status && (
                <p className="text-center text-base text-gray-700 flex items-center gap-2 justify-center mb-2">
                  <Info size={16} className="text-blue-500" /> {status}
                </p>
              )}
              {/* Galeri mahasiswa di bawah kamera, memenuhi lebar modal, grid responsif tanpa scroll */}
              <div className="flex-1 bg-gray-50 flex flex-col justify-start" style={{paddingTop: 0, paddingBottom: 0}}>
                <h3 className="font-semibold mb-2 text-gray-700 text-xl text-center">Daftar Mahasiswa Terdaftar</h3>
                <div
                  className="w-full"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 1,
                    alignItems: 'stretch',
                  }}
                >
                  {studentsWithFace.length === 0 ? (
                    <div className="text-gray-400 text-base col-span-full">
                      Tidak ada data mahasiswa.
                    </div>
                  ) : (
                    studentsWithFace.map((mhs) => {
                      const detected = detectedNIMs.includes(mhs.nim);
                      const capturedPhoto = capturedPhotos[mhs.nim];
                      return (
                        <div
                          key={mhs.nim}
                          className={`relative bg-white rounded-lg shadow-md border-2 transition-all duration-300 hover:shadow-lg ${
                            detected
                              ? "border-green-400 bg-green-50"
                              : "border-red-400 bg-red-50"
                          }`}
                        >
                          {/* Student Photo */}
                          <div className="relative">
                            <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                              <img
                                src={
                                  capturedPhoto
                                    ? capturedPhoto
                                    : `http://localhost:5000/face_recognition/dataset/${mhs.nim}.jpg`
                                }
                                alt={`Foto ${mhs.nama}`}
                                className="w-full h-full object-contain bg-white"
                                onError={e => e.target.style.display='none'}
                              />
                            </div>
                            {/* Status Badge */}    
                            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white ${
                              detected ? "bg-green-500" : "bg-red-500"
                            }`}>
                              {detected ? "Hadir" : "Tidak Hadir"}
                            </div>
                          </div>
                          {/* Student Info */}
                          <div className="p-3">
                            <div className="font-medium text-sm text-gray-800 truncate" title={`${mhs.nim} - ${mhs.nama}`}>
                              {mhs.nim} - {mhs.nama}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {detected ? "Wajah terdeteksi" : "Menunggu deteksi"}
                            </div>
                          </div>
                          {/* Status indicator */}
                          <div className="absolute bottom-2 right-2">
                            {detected ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-red-400"></div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 gap-3 border-t border-gray-200 bg-white">
              <button
                onClick={() => {
                  stopCamera();
                  setShowCameraModal(false);
                }}
                className="px-6 py-3 !bg-gray-100 text-gray-700 rounded-xl hover:!bg-gray-200 transition-all flex items-center gap-2 text-lg"
              >
                <X size={20} /> Tutup
              </button>
              {isCameraOn && (
                <button
                  onClick={startDetectionOnly}
                  className="px-6 py-3 !bg-blue-600 text-white rounded-xl hover:!bg-blue-700 transition-all flex items-center gap-2 text-lg"
                >
                  <CheckCircle size={20} /> Mulai Absen
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} /> Konfirmasi Hapus
            </h2>
            <div className="bg-red-50 rounded-xl p-4 mb-6">
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
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2.5 !bg-gray-200 text-gray-800 font-semibold rounded-xl hover:!bg-gray-300 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 !bg-red-500 text-white font-semibold rounded-xl hover:!bg-red-600 transition-all flex items-center gap-2"
              >
                <FaTrashAlt size={18} /> Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-green-500 mb-3">Berhasil!</h2>
            <p className="text-gray-700 mb-6">
              Mata kuliah dan semua kelasnya berhasil dihapus.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/dosen/matakuliah");
                }}
                className="px-6 py-2.5 !bg-green-600 text-white rounded-xl hover:!bg-green-700 transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteKelasModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} /> Konfirmasi Hapus Kelas
            </h2>
            <div className="bg-red-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700">
                Anda akan menghapus kelas{" "}
                <span className="font-semibold text-red-600">
                  {deleteKelasData?.materi}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua
                data presensi terkait kelas ini.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteKelasModal(false);
                  setDeleteKelasData(null);
                }}
                className="px-6 py-2.5 !bg-gray-200 text-gray-800 font-semibold rounded-xl hover:!bg-gray-300 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteKelas}
                disabled={isDeletingKelas}
                className={`px-6 py-2.5 font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  isDeletingKelas
                    ? "!bg-gray-400 text-white cursor-not-allowed"
                    : "!bg-red-500 text-white hover:!bg-red-600"
                }`}
              >
                {isDeletingKelas ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <FaTrashAlt size={18} /> Hapus Kelas
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showKelasSuccessModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md text-center shadow-xl border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex justify-center items-center gap-2">
              <FaCheckCircle size={22} /> Berhasil!
            </h2>
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700">
                Kelas{" "}
                <span className="font-semibold text-green-600">
                  {deleteKelasData?.materi}
                </span>{" "}
                berhasil dihapus.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Semua data presensi terkait juga telah dihapus.
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowKelasSuccessModal(false);
                  // Refresh the page to show updated data
                  window.location.reload();
                }}
                className="px-6 py-2.5 !bg-green-500 text-white font-semibold rounded-xl hover:!bg-green-600 transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="w-full flex justify-center mt-10 bg-white px-4 py-2 rounded-full shadow-md items-center space-x-2">
          {/* Tombol Prev */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`w-8 h-8 rounded-full text-sm flex items-center justify-center border transition
        ${
          currentPage === 1
            ? "!bg-gray-200 !text-gray-400 cursor-not-allowed"
            : "!bg-white !text-black hover:!bg-gray-300"
        }`}
          >
            ◀
          </button>

          {/* Nomor Halaman */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full text-sm flex items-center justify-center border transition
          ${
            currentPage === page
              ? "!bg-blue-600 !text-white !border-blue-600"
              : "!bg-white text-black hover:!bg-gray-300"
          }`}
            >
              {page}
            </button>
          ))}

          {/* Tombol Next */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`w-8 h-8 rounded-full text-sm flex items-center justify-center border transition
        ${
          currentPage === totalPages
            ? "!bg-gray-200 !text-gray-400 cursor-not-allowed"
            : "!bg-white !text-black hover:!bg-gray-300"
        }`}
          >
            ▶
          </button>
        </div>
      )}

      {/* Clip-path styling */}
      <style>
        {`
          .clip-diagonal {
            clip-path: polygon(0 0, 100% 0, 0 100%);
          }
          .clip-diagonal-reverse {
            clip-path: polygon(100% 0, 100% 100%, 0 100%);
          }
          
          .pagination-btn {
            transition: all 0.2s ease-in-out;
            border-color: #e5e7eb;
          }
          
          .enabled-btn {
            background-color: white;
            color: #374151;
          }
          
          .enabled-btn:hover {
            background-color: #f3f4f6 !important;
            color: #2563eb !important;
            transform: translateY(-1px);
          }
          
          .disabled-btn {
            background-color: #f3f4f6;
            color: #9ca3af;
            cursor: not-allowed;
          }
          
          .active-btn {
            background-color: #2563eb;
            color: white;
          }
        `}
      </style>
    </div>
  );
}
