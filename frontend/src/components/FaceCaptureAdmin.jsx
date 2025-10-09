import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function FaceCaptureAdmin({
  onDescriptorCaptured,
  onImageCaptured,
}) {
  const videoRef = useRef(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadModelsAndCamera = async () => {
      try {
        const MODEL_URL = "/models";

        // Load only the TINY versions (sesuai yang kamu punya)
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("❌ Kamera atau model gagal dimuat:", err);
        setMsg("❌ Tidak bisa mengakses kamera atau model.");
      }
    };

    loadModelsAndCamera();

    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleCapture = async () => {
    setLoading(true);
    setMsg("");

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true) // ✅ pakai versi TINY
      .withFaceDescriptor();

    if (!detection || !detection.descriptor) {
      setMsg("❌ Wajah tidak terdeteksi. Pastikan wajah terlihat jelas.");
      setLoading(false);
      return;
    }

    const descriptorArray = Array.from(detection.descriptor);
    onDescriptorCaptured?.(descriptorArray);

    // Ambil frame video sebagai gambar
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    canvas
      .getContext("2d")
      .drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        onImageCaptured?.(blob);
        setMsg("✅ Wajah berhasil ditangkap.");
      } else {
        setMsg("❌ Gagal membuat gambar dari video.");
      }
      setLoading(false);
    }, "image/jpeg");
  };

  return (
    <div className="mt-4">
      <video
        ref={videoRef}
        autoPlay
        muted
        width={400}
        height={300}
        className="rounded bg-black"
      />
      <div className="mt-2 flex gap-3">
        <button
          onClick={handleCapture}
          disabled={loading}
          className="px-4 py-2 !bg-green-600 text-white rounded hover:bg-green-700 mt-4 mb-2"
        >
          {loading ? "Memproses..." : "Ambil Foto"}
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-red-600">{msg}</p>}
    </div>
  );
}
