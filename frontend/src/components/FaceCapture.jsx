import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

export default function FaceCapture({ user, onDescriptorCaptured }) {
  const videoRef = useRef(null);
  const [msg, setMsg] = useState("");
  const [descriptor, setDescriptor] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [blobImage, setBlobImage] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        startVideo();
      } catch (err) {
        console.error("Gagal load model:", err);
        setMsg("❌ Gagal memuat model wajah.");
      }
    };

    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Gagal akses kamera:", err);
        setMsg("❌ Kamera tidak bisa diakses.");
      });
  };

  const handleCapture = async () => {
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    if (!detection?.descriptor) {
      setMsg("❌ Tidak ditemukan wajah.");
      return;
    }

    const descriptorArray = Array.from(detection.descriptor);
    setDescriptor(descriptorArray);

    // Buat gambar preview dari video
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      setBlobImage(blob);
      const imageUrl = URL.createObjectURL(blob);
      setImagePreview(imageUrl);
      setMsg("✅ Wajah dikenali. Silakan simpan.");
      
      // Pass both descriptor and blob to parent
      onDescriptorCaptured?.(descriptorArray, blob);
    }, "image/jpeg");
  };

  const handleSave = async () => {
    if (!descriptor || !blobImage) return;

    // Pass both descriptor and blob to parent
    onDescriptorCaptured?.(descriptor, blobImage);
  };

  return (
    <div className="mt-4">
      <video
        ref={videoRef}
        autoPlay
        muted
        width="400"
        height="300"
        className="border border-gray-400 rounded bg-black"
      />

      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleCapture}
          className="px-5 py-2 rounded-lg !bg-blue-600 text-white hover:!bg-blue-700 transition-colors"
        >
          Ambil Wajah
        </button>

        {descriptor && imagePreview && (
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg !bg-green-600 text-white hover:!bg-green-700 transition-colors"
          >
            Simpan
          </button>
        )}
      </div>

      {imagePreview && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-1">Preview Gambar:</p>
          <img
            src={imagePreview}
            alt="Preview wajah"
            className="w-[200px] rounded shadow"
          />
        </div>
      )}

      {msg && <p className="mt-2 text-sm text-gray-700">{msg}</p>}
    </div>
  );
}
