import React from "react";
import FaceCapture from "./FaceCapture";

export default function ModalCameraMahasiswa({ user, onClose, onSuccess }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Tombol Close (X) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full !bg-red-600 text-white text-lg font-bold flex items-center justify-center hover:bg-red-700 transition"
          aria-label="Tutup modal"
        >
          ×
        </button>

        {/* Judul */}
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-4 ">
          Ambil Wajah Mahasiswa
        </h2>

        {/* Kamera */}
        <div className="flex justify-center">
          <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm bg-black">
            <FaceCapture user={user} onDescriptorCaptured={onSuccess} />
          </div>
        </div>

        {/* Catatan */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Pastikan wajah terlihat jelas dan pencahayaan cukup.
        </p>
      </div>
    </div>
  );
}
