import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as faceapi from "face-api.js";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaBook } from "react-icons/fa";
import { Camera, X, CheckCircle, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#8B5CF6",
  "#E5E7EB",
];

const colorClasses = {
  indigo: {
    bg: "bg-indigo-500",
    text: "text-indigo-700",
  },
};

export default function DosenDashboard() {
  const [totalMatakuliah, setTotalMatakuliah] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [status, setStatus] = useState("Kamera belum aktif");
  const [detectedNIMs, setDetectedNIMs] = useState([]);
  const [studentsWithFace, setStudentsWithFace] = useState([]);
  const [capturedPhotos, setCapturedPhotos] = useState({});
  const [unknownFaces, setUnknownFaces] = useState([]);
  const [cameraHidden, setCameraHidden] = useState(false);
  const [sessionUnknownFaces, setSessionUnknownFaces] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  let detectionSessionId = "";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/dashboard/dosen",
          {
            withCredentials: true,
          }
        );
        setTotalMatakuliah(response.data.totalMatakuliah);
        setChartData(response.data.chartData);
      } catch (error) {
        if (error.response) {
          console.error("Error response:", error.response.data);
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error:", error.message);
        }
      }
    };

    fetchDashboard();
  }, []);

  const openCamera = async () => {
    setShowCameraModal(true);
    setCameraHidden(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
      setStatus("Kamera aktif");
      setDetectedNIMs([]);
      setSessionUnknownFaces([]);
      const res = await axios.get(
        "http://localhost:5000/presensiglobal/deskriptor",
        { withCredentials: true }
      );
      setStudentsWithFace(
        res.data.map((item) => ({ nim: item.nim, nama: item.nama }))
      );
    } catch (err) {
      setStatus("❌ Gagal membuka kamera");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    clearInterval(intervalRef.current);
    setIsCameraOn(false);
    setStatus("Kamera dimatikan.");
    setDetectedNIMs([]);
    setSessionUnknownFaces([]);
  };

  const startDetectionGlobal = async () => {
    let uuid = "";
    if (window.crypto && window.crypto.randomUUID) {
      uuid = window.crypto.randomUUID();
    } else {
      uuid = Date.now().toString() + Math.random().toString(16).slice(2);
    }
    setSessionId(uuid);
    detectionSessionId = uuid;
    setSessionUnknownFaces([]);
    setStatus("🔄 Memuat model...");
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
    let res;
    try {
      res = await axios.get("http://localhost:5000/presensiglobal/deskriptor", {
        withCredentials: true,
      });
      setStudentsWithFace(
        res.data.map((item) => ({ nim: item.nim, nama: item.nama }))
      );
    } catch (err) {
      return;
    }
    const labeled = res.data
      .map((item) => {
        const rawDescriptor = Array.isArray(item.descriptor)
          ? item.descriptor
          : JSON.parse(item.descriptor);
        if (!Array.isArray(rawDescriptor) || rawDescriptor.length !== 128) {
          return null;
        }
        return new faceapi.LabeledFaceDescriptors(item.nim, [
          new Float32Array(rawDescriptor),
        ]);
      })
      .filter(Boolean);
    const matcher = new faceapi.FaceMatcher(labeled, 0.4);
    const detectedSet = new Set();
    intervalRef.current = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptors();
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.matchDimensions(canvas, { width: video.videoWidth, height: video.videoHeight });
        const resized = faceapi.resizeResults(detections, { width: video.videoWidth, height: video.videoHeight });
        resized.forEach((detection) => {
          if (!detection || !detection.detection || !detection.detection.box) return;
          const box = detection.detection.box;
          let label = "Tidak dikenali";
          let color = "#EF4444";
          try {
            const match = matcher.findBestMatch(detection.descriptor);
            if (match && match.label && match.label !== "unknown") {
              label = match.label;
              color = "#10B981";
            }
          } catch (e) {}
          ctx.lineWidth = 2;
          ctx.strokeStyle = color;
          ctx.font = "16px Arial";
          ctx.fillStyle = color;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
          ctx.fillText(
            label,
            box.x,
            box.y > 20 ? box.y - 5 : box.y + 15
          );
        });
      }
      const matched = detections
        .map((d) => matcher.findBestMatch(d.descriptor))
        .filter((m) => m.label !== "unknown")
        .map((m) => m.label);
      const newDetected = matched.filter((nim) => !detectedSet.has(nim));
      if (newDetected.length > 0) {
        newDetected.forEach((nim) => {
          const detectionObj = detections.find((d) => {
            const match = matcher.findBestMatch(d.descriptor);
            return match.label === nim;
          });
          if (detectionObj && detectionObj.detection && detectionObj.detection.box) {
            capturePhoto(nim, detectionObj.detection.box);
          }
        });
        newDetected.forEach((nim) => detectedSet.add(nim));
        setDetectedNIMs((prev) => [...prev, ...newDetected]);
        await axios.post("http://localhost:5000/presensiglobal", { nims: newDetected }, { withCredentials: true });
      }
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
            if (!detectionSessionId) return;
            try {
              const res = await axios.post("http://localhost:5000/unknownface", {
                photo: photoDataUrl,
                descriptor: Array.from(obj.detection.descriptor),
                sessionId: detectionSessionId,
              }, { withCredentials: true });
              if (res.data && res.data.photo) {
                setSessionUnknownFaces((prev) => [...prev, res.data]);
              }
            } catch (e) {}
          }
        }
      }
    }, 50);
  };

  const capturePhoto = (nim, box) => {
    if (videoRef.current && box) {
      const video = videoRef.current;
      const tempCanvas = document.createElement("canvas");
      const context = tempCanvas.getContext("2d");
      const x = Math.max(0, Math.floor(box.x));
      const y = Math.max(0, Math.floor(box.y));
      const width = Math.min(video.videoWidth - x, Math.floor(box.width));
      const height = Math.min(video.videoHeight - y, Math.floor(box.height));
      tempCanvas.width = width;
      tempCanvas.height = height;
      context.drawImage(
        video,
        x, y, width, height,
        0, 0, width, height
      );
      const photoDataUrl = tempCanvas.toDataURL("image/jpeg", 0.8);
      setCapturedPhotos((prev) => ({
        ...prev,
        [nim]: photoDataUrl,
      }));
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto px-0 sm:px-0 py-0 pb-16">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1">Dashboard Dosen</h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/dosen"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <StatCard
          label="Total Mata Kuliah"
          value={totalMatakuliah}
          color="indigo"
          icon={<FaBook className="text-white text-xl" />}
        />
        <button
          onClick={openCamera}
          className="flex items-center justify-center gap-2 !bg-blue-500 shadow-lg rounded-xl p-6 h-full w-full text-white hover:!bg-blue-600 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-gray-200"
        >
          <span className="leading-none flex items-center">
            <Camera className="text-white" size={24} />
          </span>
          <span className="font-semibold text-lg text-white leading-none flex items-center">
            Deteksi Presensi Global
          </span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
          <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
          Jumlah Mahasiswa
        </h2>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-80">
            <p className="text-gray-500 text-lg">
              Belum ada data mahasiswa terdaftar.
            </p>
          </div>
        ) : (
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="jumlahMahasiswa"
                  nameKey="matakuliah"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  label={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.jumlahMahasiswa === 0
                          ? COLORS[6]
                          : COLORS[index % (COLORS.length - 1)]
                      }
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    padding: "8px 12px",
                  }}
                  formatter={(value, name) => [`${value} Mahasiswa`, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ paddingTop: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tambahkan Galeri Deteksi Wajah Real-time di bawah chart */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg border border-gray-100 mt-8">
        <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
          <span className="w-2 h-8 bg-green-500 rounded-full mr-3"></span>
          Galeri Mahasiswa Terdeteksi (Real-time)
        </h2>
        <div
          className="w-full h-full"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gridAutoRows: 'minmax(180px, auto)',
            gap: 16,
            alignItems: 'stretch',
            height: '100%',
          }}
        >
          {detectedNIMs.length === 0 ? (
            <div className="text-gray-400 text-base col-span-full text-center my-10">
              Belum ada mahasiswa yang terdeteksi.
            </div>
          ) : (
            detectedNIMs.map((nim) => {
              const mhs = studentsWithFace.find((m) => m.nim === nim) || { nim, nama: "" };
              const capturedPhoto = capturedPhotos[nim];
              return (
                <div
                  key={nim}
                  className="relative bg-white rounded-lg shadow-md border-2 transition-all duration-300 hover:shadow-lg flex flex-col h-full border-green-400 bg-green-50"
                >
                  <div className="relative flex-1 flex flex-col justify-center">
                    <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden flex items-center justify-center">
                      {capturedPhoto ? (
                        <img
                          src={capturedPhoto}
                          alt={`Foto ${mhs.nama}`}
                          className="w-full h-full object-contain bg-white"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-1 flex items-center justify-center">
                              <Camera size={16} className="text-gray-500" />
                            </div>
                            <p className="text-gray-500 text-xs">Belum ada foto</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white bg-green-500">
                      Terdeteksi
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="font-medium text-sm text-gray-800 truncate" title={`${mhs.nim} - ${mhs.nama}`}>
                      {mhs.nim} - {mhs.nama}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Wajah terdeteksi
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showCameraModal && cameraHidden && (
        <button
          onClick={() => setCameraHidden(false)}
          className="fixed bottom-8 right-8 z-[10000] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce"
          style={{ minWidth: 180 }}
        >
          <Camera className="mr-2" /> Lihat Daftar Presensi Mahasiswa
        </button>
      )}

      {showCameraModal && (
        <div 
          className={`fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center transition-all duration-300 ${
            cameraHidden ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          style={cameraHidden ? { visibility: 'hidden' } : {}}
        >
          <div className="bg-white rounded-none w-screen h-screen p-0 m-0 shadow-none border-none flex flex-col relative overflow-hidden">
            {/* Diagonal Background Lines for Modal */}
            <div className="absolute inset-0 backdrop-blur-sm">
              {/* Alternating diagonal lines */}
              <div className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 transform rotate-20">
                <div className="absolute w-full h-[70px] bg-blue-400/20 top-[0%]"></div>
                <div className="absolute w-full h-[80px] bg-white/40 top-[20%]"></div>
                <div className="absolute w-full h-[80px] bg-white/40 top-[40%]"></div>
                <div className="absolute w-full h-[80px] bg-white/40 top-[60%]"></div>
                <div className="absolute w-full h-[70px] bg-blue-400/20 top-[80%]"></div>
              </div>
            </div>
            <div className="flex justify-between items-center p-6 border-b border-blue-500 relative z-10">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Camera className="text-blue-500" size={28} /> Kamera Presensi Global
              </h2>
              <button
                onClick={() => setCameraHidden(true)}
                className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-base font-semibold shadow flex items-center gap-1"
                type="button"
              >
                <X className="text-xl" /> Minimize
              </button>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden min-h-0 relative z-10">
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
              {/* Galeri mahasiswa di bawah kamera, memenuhi lebar dan tinggi modal, grid responsif tanpa scroll */}
              <div className="flex-1 min-h-0 bg-gray-50 flex flex-col justify-start overflow-auto" style={{paddingTop: 0, paddingBottom: 0}}>
                <h3 className="font-semibold mb-2 text-gray-700 text-xl text-center">Daftar Mahasiswa Terdeteksi</h3>
                <div
                  className="w-full h-full"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gridAutoRows: 'minmax(180px, auto)',
                    gap: 16,
                    alignItems: 'stretch',
                    height: '100%',
                  }}
                >
                  {detectedNIMs.length === 0 ? (
                    <div className="text-gray-400 text-base col-span-full text-center my-10">
                      Belum ada mahasiswa yang terdeteksi.
                    </div>
                  ) : (
                    detectedNIMs.map((nim) => {
                      const mhs = studentsWithFace.find((m) => m.nim === nim) || { nim, nama: "" };
                      const capturedPhoto = capturedPhotos[nim];
                      return (
                        <div
                          key={nim}
                          className="relative bg-white rounded-lg shadow-md border-2 transition-all duration-300 hover:shadow-lg flex flex-col h-full border-green-400 bg-green-50"
                        >
                          <div className="relative flex-1 flex flex-col justify-center">
                            <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden flex items-center justify-center">
                              {capturedPhoto ? (
                                <img
                                  src={capturedPhoto}
                                  alt={`Foto ${mhs.nama}`}
                                  className="w-full h-full object-contain bg-white"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-1 flex items-center justify-center">
                                      <Camera size={16} className="text-gray-500" />
                                    </div>
                                    <p className="text-gray-500 text-xs">Belum ada foto</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white bg-green-500">
                              Terdeteksi
                            </div>
                          </div>
                          <div className="p-3">
                            <div className="font-medium text-sm text-gray-800 truncate" title={`${mhs.nim} - ${mhs.nama}`}>
                              {mhs.nim} - {mhs.nama}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Wajah terdeteksi
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <CheckCircle size={16} className="text-green-500" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 gap-3 border-t border-gray-200 bg-white relative z-10">
              <button
                onClick={() => {
                  stopCamera();
                  setShowCameraModal(false);
                  setCapturedPhotos({});
                  setCameraHidden(false);
                  setSessionUnknownFaces([]);
                }}
                className="!bg-gray-400 px-6 py-3 rounded-lg hover:!bg-gray-500 flex items-center gap-2 text-lg"
              >
                <X size={20} /> Tutup
              </button>
              {isCameraOn && (
                <button
                  onClick={async () => {
                    await startDetectionGlobal();
                    // setCameraHidden(true); // Tidak usah minimize otomatis
                  }}
                  className="!bg-blue-600 text-white px-6 py-3 rounded-lg hover:!bg-blue-700 flex items-center gap-2 text-lg"
                >
                  <CheckCircle size={20} /> Mulai Deteksi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  const { bg, text } = colorClasses[color] || {
    bg: "bg-gray-300",
    text: "text-gray-800",
  };
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <div className={`${bg} shadow-inner rounded-xl p-4`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${text}`}>{value}</p>
      </div>
    </div>
  );
}
