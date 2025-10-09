import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  FaUserCircle,
  FaEnvelope,
  FaShieldAlt,
  FaIdCard,
  FaUniversity,
  FaKey,
  FaLock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function DosenEditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    uuid: "",
    name: "",
    email: "",
    role: "dosen",
    password: "",
    confPassword: "",
    nip: "",
    jurusan: "",
  });
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/me", {
          withCredentials: true,
        });
        const { uuid, name, email, role, nip, jurusan } = res.data;

        if (!role || role !== "dosen") {
          setErrorMessage("Akun ini bukan akun dosen.");
          setShowErrorModal(true);
          return;
        }

        setForm({
          uuid,
          name,
          email,
          role,
          password: "",
          confPassword: "",
          nip,
          jurusan,
        });
      } catch (err) {
        setErrorMessage(err.response?.data?.msg || "Gagal memuat data profil");
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (form.password !== form.confPassword) {
      setErrorMessage("Password dan konfirmasi tidak cocok");
      setShowConfirmModal(false);
      setShowErrorModal(true);
      return;
    }

    if (
      !form.nip ||
      !form.jurusan ||
      form.nip.trim() === "" ||
      form.jurusan.trim() === ""
    ) {
      setErrorMessage("NIP dan Jurusan wajib diisi dan tidak boleh kosong");
      setShowConfirmModal(false);
      setShowErrorModal(true);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        ...(form.password
          ? { password: form.password, confPassword: form.confPassword }
          : {}),
        nip: form.nip,
        jurusan: form.jurusan,
      };

      await axios.patch(`http://localhost:5000/users/${form.uuid}`, payload, {
        withCredentials: true,
      });

      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.msg || "Gagal memperbarui profil");
      setShowErrorModal(true);
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Memuat data...</p>;

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto pb-16">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          Edit Profile
        </h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/dosen"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <Link
            to="/dosen/profile"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Profile
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Edit</span>
        </div>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-6 text-black bg-white px-8 pt-8 pb-8 rounded-xl shadow-lg border border-gray-100"
      >
        {/* Informasi Dasar */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaUserCircle className="text-blue-500" size={20} />
            Informasi Dasar
          </h2>
          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <FaUserCircle
              className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              required
            />
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Email
            </label>
            <FaEnvelope
              className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Masukkan alamat email"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              required
            />
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peran
            </label>
            <FaShieldAlt
              className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              name="role"
              value={form.role}
              readOnly
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Informasi Dosen */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaUniversity className="text-blue-500" size={20} />
            Informasi Dosen
          </h2>
          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Induk Pegawai (NIP)
            </label>
            <FaIdCard
              className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              name="nip"
              value={form.nip}
              onChange={handleChange}
              placeholder="Masukkan NIP"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              required
            />
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jurusan
            </label>
            <FaUniversity
              className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              name="jurusan"
              value={form.jurusan}
              onChange={handleChange}
              placeholder="Masukkan jurusan"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              required
            />
          </div>
        </div>

        {/* Informasi Keamanan */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaLock className="text-blue-500" size={20} />
            Informasi Keamanan
          </h2>
          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Baru
            </label>
            <FaKey
              className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password baru (opsional)"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password
            </label>
            <FaLock
              className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="password"
              name="confPassword"
              value={form.confPassword}
              onChange={handleChange}
              placeholder="Masukkan konfirmasi password"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="px-8 py-2.5 !bg-yellow-500 text-white font-semibold rounded-lg hover:!bg-yellow-600 transition shadow-md hover:shadow-lg flex items-center gap-2"
            disabled={loading}
          >
            <FaCheckCircle size={18} />
            Simpan Perubahan
          </button>
        </div>
      </form>

      {/* Modal Konfirmasi */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-sm text-center relative overflow-hidden">
            <div className="h-1.5 bg-yellow-500"></div>
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <FaCheckCircle className="text-5xl text-yellow-500" />
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
                  className="px-6 py-2.5 !bg-yellow-500 text-white font-semibold rounded-lg hover:!bg-yellow-600 transition"
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
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-4xl text-green-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">Berhasil</h3>
                <p className="text-gray-600">Profil berhasil diperbarui.</p>
              </div>

              <button
                onClick={() => navigate("/dosen/profile")}
                className="mt-8 px-8 py-3 !bg-green-500 text-white font-semibold rounded-lg hover:!bg-green-600 transition shadow-md hover:shadow-lg"
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
