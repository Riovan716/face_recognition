import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUserCircle,
  FaEnvelope,
  FaShieldAlt,
  FaIdBadge,
  FaUniversity,
  FaEdit,
} from "react-icons/fa";
import { AlertTriangle, CheckCircle } from "lucide-react";
import PasswordConfirmModal from "../../components/PaswordConfirmModaal"; // pastikan path ini benar

export default function DosenProfile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    nip: "",
    jurusan: "",
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordToVerify, setPasswordToVerify] = useState("");
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

  const handlePasswordVerify = async (password) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/verify-password",
        { password },
        { withCredentials: true }
      );
      if (res.data.success) {
        setShowPasswordModal(false);
        navigate("/dosen/profile/edit");
      } else {
        setShowPasswordModal(false); // Tutup modal password
        setErrorMessage("Password salah. Akses ditolak.");
        setShowErrorModal(true);
      }
    } catch (err) {
      setShowPasswordModal(false); // Tutup modal password
      setErrorMessage(
        "Verifikasi gagal: " + (err.response?.data?.msg || err.message)
      );
      setShowErrorModal(true);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-lg">Memuat data profile...</p>;

  return (
    <div className="w-full px-0 pb-10">
      {/* Header */}
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          <FaUserCircle className="text-blue-600" /> Profile
        </h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/dosen"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Profile</span>
        </div>
      </div>

      {msg && <p className="text-sm text-red-500 mb-4">{msg}</p>}

      {/* Card Profile */}
      <div className="bg-white rounded-xl shadow p-6 space-y-5">
        <ProfileField icon={<FaUserCircle />} label="Nama" value={user.name} />
        <ProfileField icon={<FaEnvelope />} label="Email" value={user.email} />
        <ProfileField icon={<FaShieldAlt />} label="Role" value={user.role} />
        <ProfileField icon={<FaIdBadge />} label="NIP" value={user.nip} />
        <ProfileField
          icon={<FaUniversity />}
          label="Jurusan"
          value={user.jurusan}
        />

        <div className="text-left">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2 !bg-yellow-400 text-white font-medium rounded-lg hover:!bg-yellow-500 transition"
          >
            <FaEdit /> Edit Profil
          </button>
        </div>
      </div>

      {/* Modal Verifikasi Password */}
      <PasswordConfirmModal
        isOpen={showPasswordModal}
        onCancel={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordVerify}
      />
      {/* Modal Error Password */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} className="text-red-600" /> Gagal
            </h2>
            <p className="text-gray-700 mb-6">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="px-6 py-2.5 !bg-red-500 text-white font-semibold rounded-lg hover:!bg-red-600 transition shadow-md hover:shadow-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileField({ icon, label, value }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
        {icon} {label}
      </label>
      <input
        type="text"
        disabled
        value={value || "-"}
        className="w-full p-3 border border-gray-300 rounded bg-gray-100 text-gray-800"
      />
    </div>
  );
}
