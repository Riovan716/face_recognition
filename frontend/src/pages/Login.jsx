import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaLock,
  FaCamera,
} from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { motion } from "framer-motion";
import * as faceapi from "face-api.js";
import axios from "axios";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [modal, setModal] = useState({
    show: false,
    message: "",
    success: false,
  });
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [status, setStatus] = useState("Kamera belum aktif");
  const [detectedNIMs, setDetectedNIMs] = useState([]);
  const [studentsWithFace, setStudentsWithFace] = useState([]);
  const [capturedPhotos, setCapturedPhotos] = useState({});
  const [unknownFaces, setUnknownFaces] = useState([]);
  const [sessionUnknownFaces, setSessionUnknownFaces] = useState([]);
  const [cameraHidden, setCameraHidden] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  let detectionSessionId = "";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showModal = (message, success = false) => {
    setModal({ show: true, message, success });
  };

  const closeModal = () => {
    setModal({ show: false, message: "", success: false });

    if (modal.success) {
      const role = JSON.parse(localStorage.getItem("user"))?.role;
      if (role === "admin") navigate("/admin");
      else if (role === "Mahasiswa") navigate("/Mahasiswa");
      else if (role === "dosen") navigate("/dosen");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        const role = data.role;
        if (role === "admin") navigate("/admin");
        else if (role === "Mahasiswa") navigate("/Mahasiswa");
        else if (role === "dosen") navigate("/dosen");
      } else {
        showModal(data.msg || "Login gagal", false);
      }
    } catch (err) {
      showModal("Login error: " + err.message, false);
    }
  };

  // Tambahkan fungsi untuk fetch unknown face dari backend
  const fetchUnknownFaces = async () => {
    try {
      const res = await axios.get("http://localhost:5000/unknownface", { withCredentials: true });
      setUnknownFaces(res.data);
    } catch (err) {
      setUnknownFaces([]);
    }
  };

  // Camera functions for global attendance
  const openCamera = async () => {
  setShowCameraModal(true);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setIsCameraOn(true);
    setStatus("Kamera aktif");
  } catch {
    setStatus("❌ Gagal mengakses kamera");
    return;
  }

  try {
    const res = await axios.get("http://localhost:5000/presensiglobal/deskriptor");
    console.log("✅ Deskriptor diterima:", res.data);
    setStudentsWithFace(
      res.data.map((item) => ({
        nim: item.nim,
        nama: item.nama,
        descriptor: item.descriptor,
      }))
    );
    await fetchUnknownFaces();
  } catch (err) {
    console.error("❌ Gagal ambil deskriptor global:", err.message);
    setStatus("❌ Gagal memuat data wajah");
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
  };

  // Capture hanya area box wajah, tanpa margin
  const capturePhoto = (nim, box) => {
    if (videoRef.current && box) {
      const video = videoRef.current;
      const tempCanvas = document.createElement("canvas");
      const context = tempCanvas.getContext("2d");
      // Hanya area box wajah, tanpa margin
      const x = Math.max(0, Math.floor(box.x));
      const y = Math.max(0, Math.floor(box.y));
      const width = Math.min(video.videoWidth - x, Math.floor(box.width));
      const height = Math.min(video.videoHeight - y, Math.floor(box.height));
      tempCanvas.width = width;
      tempCanvas.height = height;
      context.drawImage(
        video,
        x, y, width, height, // sumber (area wajah)
        0, 0, width, height  // tujuan (full canvas)
      );
      const photoDataUrl = tempCanvas.toDataURL("image/jpeg", 0.8);
      setCapturedPhotos((prev) => ({
        ...prev,
        [nim]: photoDataUrl,
      }));
    }
  };

  const startDetectionGlobal = async () => {
    // Generate UUID baru untuk sessionId
    let uuid = "";
    if (window.crypto && window.crypto.randomUUID) {
      uuid = window.crypto.randomUUID();
    } else {
      uuid = Date.now().toString() + Math.random().toString(16).slice(2);
    }
    setSessionId(uuid);
    detectionSessionId = uuid; // Gunakan variabel lokal agar selalu terisi
    setSessionUnknownFaces([]); // Reset setiap mulai deteksi
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
      console.log("✅ Deskriptor diterima:", res.data);
      setStudentsWithFace(
        res.data.map((item) => ({ nim: item.nim, nama: item.nama }))
      );
    } catch (err) {
      console.error(
        "❌ Gagal mengambil deskriptor:",
        err.response?.data || err.message
      );
      return;
    }

    const labeled = res.data
      .map((item) => {
        const rawDescriptor = Array.isArray(item.descriptor)
          ? item.descriptor
          : JSON.parse(item.descriptor);

        if (!Array.isArray(rawDescriptor) || rawDescriptor.length !== 128) {
          console.warn(`❌ Descriptor invalid untuk NIM ${item.nim}, dilewati`);
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

      // Capture foto mahasiswa terdeteksi
      const matched = detections
        .map((d) => matcher.findBestMatch(d.descriptor))
        .filter((m) => m.label !== "unknown")
        .map((m) => m.label);
      const newDetected = matched.filter((nim) => !detectedSet.has(nim));
      if (newDetected.length > 0) {
        newDetected.forEach((nim) => {
          // Cari detection yang match dengan nim
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

      // Tangkap wajah unknown (fitur cadangan, di-comment) a
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
            // Crop hanya area box wajah (tanpa margin)
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
            if (!detectionSessionId) return; // Jangan POST jika sessionId kosong
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

  return (
    <motion.div className="relative min-h-screen bg-gradient-to-br from-blue-600 to-gray-300 overflow-hidden flex items-center justify-center">
      {/* Diagonal Background Lines */}
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

      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-0">
          {/* Login Form Card */}
          <motion.div
            initial={{ x: "-100vw", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100vw", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 40,
              damping: 12,
              duration: 0.6,
            }}
            className="w-full lg:w-[45%] h-[530px] flex items-center justify-center"
          >
            <div className="w-full bg-white/10 backdrop-blur-md rounded-l-4xl rounded-r-none shadow-2xl px-6 py-8 border border-white/20 flex flex-col justify-center shadow-gray-800">
              <h1 className="!text-xl font-bold text-center bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg mb-5">
                Face Recognition Attendance
              </h1>
              <div className="w-full max-w-sm flex justify-center gap-4 mb-5 z-10">
                <button className="flex-1 bg-gradient-to-r !bg-blue-600 hover:!bg-blue-700 text-white py-3 !rounded-4xl shadow-lg font-semibold text-base text-center text-nowrap">
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="flex-1 !bg-white text-black py-3 !rounded-4xl shadow-lg font-semibold text-base text-center text-nowrap hover:!bg-gray-300"
                >
                  Register
                </button>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2 ml-1">
                    Username / Email
                  </label>
                  <div className="flex items-center border-2 border-white/20 !rounded-4xl px-5 py-3 bg-white/5 backdrop-blur-sm shadow-sm">
                    <FaUser className="text-white mr-3 text-lg" />
                    <input
                      type="text"
                      name="email"
                      placeholder="Enter Your Username or Email"
                      onChange={handleChange}
                      className="w-full bg-transparent focus:outline-none text-white placeholder-white/60 text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2 ml-1">
                    Password
                  </label>
                  <div className="flex items-center border-2 border-white/20 rounded-full px-5 py-3 bg-white/5 backdrop-blur-sm shadow-sm">
                    <FaLock className="text-white mr-3 text-lg" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter Your Password"
                      onChange={handleChange}
                      className="w-full bg-transparent focus:outline-none text-white placeholder-white/60 text-base"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r !bg-blue-500 text-white font-semibold py-3 !rounded-4xl shadow text-base hover:!bg-blue-600"
                >
                  Log In
                </button>
              </form>

              {/* Global Attendance Button */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <button
                  onClick={openCamera}
                  className="w-full bg-gradient-to-r !bg-green-500 hover:!bg-green-600 text-white font-semibold py-3 !rounded-4xl shadow text-base flex items-center justify-center gap-2"
                >
                  <FaCamera className="text-lg" />
                  Presensi Global
                </button>
              </div>
            </div>
          </motion.div>

          {/* Image Card */}
          <motion.div
            initial={{ x: "100vw", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100vw", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 40,
              damping: 12,
              duration: 0.6,
            }}
            className="w-full lg:w-[55%] h-[560px] flex items-center justify-center !rounded-r-full"
          >
            <div className="w-full h-full bg-white backdrop-blur-md rounded-r-4xl rounded-l-none shadow-2xl shadow-gray-800 p-6 border border-white/20 flex items-center justify-center">
              <img
                src="/LOG.jpg"
                alt="Graduation Illustration"
                className="w-full h-full object-cover rounded-xl shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Camera Modal for Global Attendance */}
      {showCameraModal && (
        <>
          {/* Floating Show Camera Button when hidden */}
          {cameraHidden && (
            <button
              onClick={() => setCameraHidden(false)}
              className="fixed bottom-8 right-8 z-[10000] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce"
              style={{ minWidth: 180 }}
            >
              <FaCamera className="mr-2" /> Lihat Daftar Presensi Mahasiswa
            </button>
          )}

          {/* Camera Modal UI */}
          <div 
            className={`fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center transition-all duration-300 ${
              cameraHidden ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
            style={cameraHidden ? { visibility: 'hidden' } : {}}
          >
            <div className="bg-white rounded-none w-screen h-screen p-0 m-0 shadow-none border-none flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-blue-500">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaCamera className="text-blue-500" size={28} /> Kamera Presensi Global
                </h2>
                <button
                  onClick={() => setCameraHidden(true)}
                  className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-base font-semibold shadow flex items-center gap-1"
                  type="button"
                >
                  <FaXmark className="text-xl" /> Minimize
                </button>
              </div>
              <div className="flex flex-col flex-1 overflow-hidden min-h-0">
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
                          <FaCamera size={10} className="mx-auto mb-0 opacity-50" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {status && (
                  <p className="text-center text-base text-gray-700 flex items-center gap-2 justify-center mb-2">
                    <span className="text-blue-500">ℹ️</span> {status}
                  </p>
                )}
                {/* Galeri mahasiswa di bawah kamera, memenuhi lebar dan tinggi modal, grid responsif tanpa scroll */}
                <div className="flex-1 min-h-0 bg-gray-50 flex flex-col justify-start overflow-auto" style={{paddingTop: 0, paddingBottom: 0}}>
                  <h3 className="font-semibold mb-2 text-gray-700 text-xl text-center">Daftar Mahasiswa Terdaftar</h3>
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
                            className={`relative bg-white rounded-lg shadow-md border-2 transition-all duration-300 hover:shadow-lg flex flex-col h-full border-green-400 bg-green-50`}
                          >
                            {/* Student Photo */}
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
                                        <FaCamera size={16} className="text-gray-500" />
                                      </div>
                                      <p className="text-gray-500 text-xs">Belum ada foto</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {/* Status Badge */}
                              <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white bg-green-500">
                                Terdeteksi
                              </div>
                            </div>
                            {/* Student Info */}
                            <div className="p-3">
                              <div className="font-medium text-sm text-gray-800 truncate" title={`${mhs.nim} - ${mhs.nama}`}>
                                {mhs.nim} - {mhs.nama}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Wajah terdeteksi
                              </div>
                            </div>
                            {/* Status indicator */}
                            <div className="absolute bottom-2 right-2">
                              <FaCheckCircle size={16} className="text-green-500" />
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
                    setCapturedPhotos({});
                    setCameraHidden(false);
                    setSessionUnknownFaces([]);
                  }}
                  className="!bg-gray-400 px-6 py-3 rounded-lg hover:!bg-gray-500 flex items-center gap-2 text-lg"
                >
                  <FaXmark size={20} /> Tutup
                </button>
                {isCameraOn && (
                  <button
                    onClick={async () => {
                      await startDetectionGlobal();
                      // setCameraHidden(true); // Tidak usah minimize otomatis
                    }}
                    className="!bg-blue-600 text-white px-6 py-3 rounded-lg hover:!bg-blue-700 flex items-center gap-2 text-lg"
                  >
                    <FaCheckCircle size={20} /> Mulai Deteksi
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Login Modal */}
      {modal.show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className={`relative p-10 rounded-3xl shadow-2xl text-center w-[90%] max-w-sm transform transition-all duration-500 ${
              modal.success
                ? "bg-gradient-to-br from-white to-white border-2 border-green-200"
                : "bg-gradient-to-br from-white to-white border-2 border-red-200"
            } backdrop-blur-md overflow-hidden`}
          >
            <div
              className={`absolute top-0 left-0 w-full h-1.5 ${
                modal.success
                  ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                  : "bg-gradient-to-r from-red-400 via-red-500 to-red-600"
              }`}
            ></div>

            <div className="relative">
              <div
                className={`flex justify-center mb-8 ${
                  modal.success
                    ? "text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                    : "text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                }`}
              >
                {modal.success ? (
                  <FaCheckCircle className="text-7xl animate-bounce" />
                ) : (
                  <FaTimesCircle className="text-7xl animate-bounce" />
                )}
              </div>

              <div className="space-y-3">
                <h3
                  className={`text-3xl font-bold ${
                    modal.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {modal.success ? "Success!" : "Error!"}
                </h3>
                <p
                  className={`text-xl ${
                    modal.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {modal.message}
                </p>
              </div>

              <button
                onClick={closeModal}
                className={`mt-10 px-10 py-4 rounded-xl font-medium ${
                  modal.success
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                }`}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Login;
