import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

const PresensiPage = () => {
  const videoRef = useRef(null);
  const [msg, setMsg] = useState("Memuat kamera...");

  const loadModels = async () => {
    const MODEL_URL = "/models"; // tempat kamu simpan model face-api.js
    await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)]);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      setMsg("Gagal mengakses kamera.");
    }
  };

  const captureSnapshot = async () => {
    const video = videoRef.current;
    if (!video) return;

    const detection = await faceapi.detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );
    if (detection) {
      setMsg("Wajah terdeteksi. Mengirim untuk pencocokan...");

      const canvas = faceapi.createCanvasFromMedia(video);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, video.width, video.height);

      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("image", blob);

        try {
          const res = await axios.post(
            "http://localhost:5000/api/presensi",
            formData,
            {
              withCredentials: true,
            }
          );
          setMsg(`✅ Presensi berhasil! NIM: ${res.data.nim}`);
        } catch (err) {
          setMsg("❌ Wajah tidak dikenali atau gagal.");
        }
      }, "image/jpeg");
    } else {
      setMsg("⏳ Tidak ada wajah, coba hadapkan kamera.");
    }
  };

  useEffect(() => {
    loadModels().then(startCamera);

    const interval = setInterval(() => {
      captureSnapshot();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Presensi Mahasiswa (Real-Time)</h2>
      <video ref={videoRef} autoPlay muted width="480" height="360" />
      <p>{msg}</p>
    </div>
  );
};

export default PresensiPage;
