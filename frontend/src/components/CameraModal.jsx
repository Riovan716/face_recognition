import React, { useEffect, useRef } from "react";

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef();

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error starting camera:", err);
      }
    };

    if (isOpen) startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        {/* Tombol close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-700 transition"
          aria-label="Tutup modal"
        >
          ✖
        </button>

        <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
          Ambil Foto Wajah
        </h2>

        <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-64 object-cover"
          />
        </div>

        <button
          onClick={() => onCapture(videoRef.current)}
          className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Ambil Foto
        </button>
      </div>
    </div>
  );
}
