import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUserCircle, FaEnvelope, FaShieldAlt, FaEdit, FaSave, FaArrowLeft, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import PasswordConfirmModal from "../../components/PaswordConfirmModaal";

export default function EditProfileAdmin() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confPassword: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Ambil data profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/me", {
          withCredentials: true,
        });
        setUser({ ...res.data, password: "", confPassword: "" });
        setLoading(false);
      } catch (err) {
        setMsg("Gagal memuat data profil");
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Simpan perubahan
  const handleUpdate = async () => {
    setShowConfirmModal(false);

    if (user.password !== user.confPassword) {
      setErrorMessage("Password dan konfirmasi tidak cocok");
      setShowErrorModal(true);
      return;
    }

    try {
      await axios.patch(
        `http://localhost:5000/users/${user.uuid}`,
        {
          name: user.name,
          email: user.email,
          password: user.password,
          confPassword: user.confPassword,
          role: user.role,
        },
        { withCredentials: true }
      );
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.msg || "Gagal memperbarui profil");
      setShowErrorModal(true);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-lg">Memuat data profile...</p>;
  }

  return (
    <div className="w-full-2xl mx-auto">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          <FaEdit className="text-blue-600" /> Edit Profile
        </h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/admin"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <Link
            to="/admin/profile"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Profile
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Edit Profile</span>
        </div>
      </div>

      {msg && <p className="text-sm text-red-500 mb-4">{msg}</p>}

      <div className="bg-white rounded-xl shadow p-6 space-y-5">
    <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <FaUserCircle /> Nama
        </label>
        <input
          type="text"
          name="name"
          value={user.name}
          onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <FaEnvelope /> Email
        </label>
        <input
          type="email"
          name="email"
          value={user.email}
          onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1">
          Password (kosongkan jika tidak diubah)
        </label>
        <input
          type="password"
          name="password"
          value={user.password}
          onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan password baru"
        />
      </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1">
          Konfirmasi Password
        </label>
        <input
          type="password"
          name="confPassword"
          value={user.confPassword}
          onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Konfirmasi password baru"
        />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => navigate("/admin/profile")}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition"
          >
            <FaArrowLeft /> Kembali
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
          >
            <FaSave /> Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-sm text-center relative overflow-hidden">
            <div className="h-1.5 bg-green-500"></div>
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <FaCheckCircle className="text-5xl text-green-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">Konfirmasi</h3>
                <p className="text-gray-600">
                  Apakah Anda yakin ingin menyimpan perubahan?
                </p>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-2.5 !bg-gray-100 text-gray-800 font-semibold rounded-lg hover:!bg-gray-200 transition"
                >
                  Batal
                </button>
      <button
        onClick={handleUpdate}
                  className="px-6 py-2.5 !bg-green-500 text-white font-semibold rounded-lg hover:!bg-green-600 transition"
      >
                  Ya, Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-sm text-center relative overflow-hidden">
            <div className="h-1.5 bg-green-500"></div>
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <FaCheckCircle className="text-5xl text-green-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">Berhasil</h3>
                <p className="text-gray-600">Profil berhasil diperbarui.</p>
              </div>

              <button
                onClick={() => navigate("/admin/profile")}
                className="mt-8 px-8 py-3 !bg-green-500 text-white font-semibold rounded-lg hover:!bg-green-600 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Error */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-sm text-center relative overflow-hidden">
            <div className="h-1.5 bg-red-500"></div>
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <FaTimesCircle className="text-5xl text-red-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">
                  Terjadi Kesalahan
                </h3>
                <p className="text-gray-600">{errorMessage}</p>
              </div>

              <button
                onClick={() => setShowErrorModal(false)}
                className="mt-8 px-8 py-3 !bg-red-500 text-white font-semibold rounded-lg hover:!bg-red-600 transition"
              >
                Tutup
      </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
