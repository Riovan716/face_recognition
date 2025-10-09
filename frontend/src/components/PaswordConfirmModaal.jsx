import React, { useState } from "react";
import { Lock } from "lucide-react";

export default function PasswordConfirmModal({ isOpen, onCancel, onConfirm }) {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-yellow-500">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex justify-center items-center gap-2">
          <Lock size={22} className="text-yellow-500" /> Verifikasi Password
        </h2>
        <p className="text-gray-700 mb-6">
          Masukkan password Anda untuk melanjutkan.
        </p>

        <div className="relative group mb-6">
          <Lock size={18} className="absolute top-3 left-3 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password..."
            className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition bg-white !text-black"
          />
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 !bg-gray-200 text-gray-800 font-semibold rounded-lg hover:!bg-gray-300 transition shadow-md hover:shadow-lg"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(password)}
            className="px-6 py-2.5 !bg-yellow-500 text-white font-semibold rounded-lg hover:!bg-yellow-600 transition shadow-md hover:shadow-lg"
          >
            Verifikasi
          </button>
        </div>
      </div>
    </div>
  );
}
