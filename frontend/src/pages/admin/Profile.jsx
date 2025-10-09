import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUserCircle,
  FaEnvelope,
  FaShieldAlt,
  FaEdit,
  FaTimesCircle,
} from "react-icons/fa";
import PasswordConfirmModal from "../../components/PaswordConfirmModaal";

export default function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/me", {
        withCredentials: true,
      });
      setUser(res.data);
      setLoading(false);
    } catch (err) {
      setMsg("Gagal mengambil data profile");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading)
    return <p className="text-center mt-10 text-lg">Memuat data profile...</p>;

  return (
    <div className="w-full-2xl mx-auto ">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          <FaUserCircle className="text-blue-600" /> Profile
        </h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/admin"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Profile</span>
        </div>
      </div>

      {msg && <p className="text-sm text-red-500 mb-4">{msg}</p>}

      <div className="bg-white rounded-xl shadow p-6 space-y-5">
        <div>
          <label className=" text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <FaUserCircle /> Nama
          </label>
          <input
            type="text"
            disabled
            value={user.name}
            className="w-full p-3 border border-gray-300 rounded bg-gray-100 text-gray-800"
          />
        </div>

        <div>
          <label className=" text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <FaEnvelope /> Email
          </label>
          <input
            type="text"
            disabled
            value={user.email}
            className="w-full p-3 border border-gray-300 rounded bg-gray-100 text-gray-800"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <FaShieldAlt /> Role
          </label>
          <input
            type="text"
            disabled
            value={user.role}
            className="w-full p-3 border border-gray-300 rounded bg-gray-100 text-gray-800"
          />
        </div>

        <div className="text-left">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2 !bg-yellow-500 text-white font-medium rounded-lg hover:!bg-yellow-600 transition"
          >
            <FaEdit /> Edit Profil
          </button>
        </div>
      </div>

      {/* Modal Verifikasi Password */}
      <PasswordConfirmModal
        isOpen={showPasswordModal}
        onCancel={() => setShowPasswordModal(false)}
        onConfirm={async (inputPassword) => {
          try {
            const res = await axios.post(
              "http://localhost:5000/verify-password",
              { password: inputPassword },
              { withCredentials: true }
            );
            if (res.data.success) {
              navigate("/admin/profile/edit");
            } else {
              setErrorMessage("Password salah. Akses ditolak.");
              setShowErrorModal(true);
            }
          } catch (err) {
            setErrorMessage(
              "Verifikasi gagal: " + (err.response?.data?.msg || err.message)
            );
            setShowErrorModal(true);
          } finally {
            setShowPasswordModal(false);
          }
        }}
      />

      {/* Modal Error Verifikasi Password */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center transform transition-all animate-fadeIn">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTimesCircle className="text-2xl text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              Verifikasi Gagal
            </h2>
            <p className="text-gray-700 mb-6">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="px-6 py-3 !bg-red-500 text-white rounded-xl hover:!bg-red-600 transition-all transform hover:scale-105 shadow-md w-full"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
