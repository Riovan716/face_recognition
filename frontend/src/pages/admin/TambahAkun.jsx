import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import FaceCaptureAdmin from "../../components/FaceCaptureAdmin";
import {
  User,
  Mail,
  Lock,
  AlertTriangle,
  School,
  Home,
  CheckCircle,
  Camera,
  X,
  UserCog,
  Layers,
  BarChart,
  BarChart2,
  BookOpen,
  BookOpenCheck,
} from "lucide-react";

export default function TambahAkun() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Mahasiswa");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [nim, setNim] = useState("");
  const [nip, setNip] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [ipk, setIpk] = useState("");
  const [tempatTinggal, setTempatTinggal] = useState("");

  const [fileImage, setFileImage] = useState(null);
  const [descriptor, setDescriptor] = useState(null);
  const [blobImage, setBlobImage] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);

    if (role === "Mahasiswa") {
      formData.append("nim", nim);
      formData.append("jurusan", jurusan);
      formData.append("ipk", parseFloat(ipk) || 0);
      formData.append("tempatTinggal", tempatTinggal);

      if (descriptor) {
        formData.append("deskriptorWajah", JSON.stringify(descriptor));
      }

      if (blobImage) {
        formData.append("file", blobImage, `${nim}.jpg`);
      } else if (fileImage) {
        formData.append("file", fileImage);
      }
    }

    if (role === "dosen") {
      formData.append("nip", nip);
      formData.append("jurusan", jurusan);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/users",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Akun berhasil ditambahkan.");
        setShowSuccessModal(true);
      }
    } catch (err) {
      const msg = err.response?.data?.msg?.toLowerCase();

      if (msg?.includes("nim")) {
        setModalMessage("NIM telah digunakan. Silakan gunakan NIM lain.");
      } else if (msg?.includes("nip")) {
        setModalMessage("NIP telah digunakan. Silakan gunakan NIP lain.");
      } else if (msg?.includes("email")) {
        setModalMessage("Email telah digunakan. Silakan gunakan email lain.");
      } else {
        setModalMessage(
          "Terjadi kesalahan. Silakan periksa data Anda kembali."
        );
      }

      setShowModal(true);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto px-0 sm:px-0 py-0 pb-16">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md ">
        <h1 className="text-sm font-bold text-black mb-1">Tambah Akun</h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/admin"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <Link
            to="/admin/data-akun"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Data Akun
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Tambah Akun</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 text-black bg-white px-8 pt-8 pb-8 rounded-xl shadow-lg"
      >
        {/* Informasi Dasar */}
        <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <User className="text-blue-500" size={20} />
            Informasi Dasar
          </h2>
          <p className="text-sm text-black mb-1">Nama Lengkap</p>
          <div className="relative group">
            <User
              className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              required
            />
          </div>
          <p className="text-sm text-black mb-1">Email</p>
          <div className="relative group">
            <Mail
              className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              required
            />
          </div>
          <p className="text-sm text-black mb-1">Role</p>
          <div className="relative group">
            <UserCog
              className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white appearance-none"
              required
            >
              <option value="admin">Admin</option>
              <option value="Mahasiswa">Mahasiswa</option>
              <option value="dosen">Dosen</option>
            </select>
          </div>
        </div>

        {role === "Mahasiswa" && (
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <School className="text-blue-500" size={20} />
              Informasi Mahasiswa
            </h2>
            <p className="text-sm text-black mb-1">NIM</p>
            <div className="relative group">
              <User
                className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="NIM"
                className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                required
              />
            </div>
            <p className="text-sm text-black mb-1">Jurusan</p>
            <div className="relative group">
              <BookOpen
                className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                value={jurusan}
                onChange={(e) => setJurusan(e.target.value)}
                placeholder="Jurusan"
                className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                required
              />
            </div>
            <p className="text-sm text-black mb-1">IPK</p>
            <div className="relative group">
              <BarChart2
                className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="number"
                step="0.01"
                value={ipk}
                onChange={(e) => setIpk(e.target.value)}
                placeholder="IPK"
                className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              />
            </div>
            <p className="text-sm text-black mb-1">Tempat Tinggal</p>
            <div className="relative group">
              <Home
                className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                value={tempatTinggal}
                onChange={(e) => setTempatTinggal(e.target.value)}
                placeholder="Tempat Tinggal"
                className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Camera className="text-blue-500" size={20} />
                Foto Wajah
              </h3>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setShowCameraModal(true)}
                  className="px-6 py-2.5 !bg-blue-600 text-white rounded-lg hover:!bg-blue-700 transition shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Camera size={18} />
                  Ambil Wajah
                </button>

                <div className="relative">
                  <p className="text-sm text-black mb-1">
                    Upload Foto Wajah (opsional)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setFileImage(e.target.files[0]);
                      setPreviewImageUrl(
                        URL.createObjectURL(e.target.files[0])
                      );
                    }}
                    className="text-black"
                  />
                </div>
              </div>

              {previewImageUrl && (
                <div className="mt-4">
                  <img
                    src={previewImageUrl}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {role === "dosen" && (
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <School className="text-blue-500" size={20} />
              Informasi Dosen
            </h2>
            <p className="text-sm text-black mb-1">NIP</p>
            <div className="relative group">
              <User
                className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="NIP"
                className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                required
              />
            </div>
            <p className="text-sm text-black mb-1">Jurusan</p>
            <div className="relative group">
              <School
                className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                value={jurusan}
                onChange={(e) => setJurusan(e.target.value)}
                placeholder="Jurusan"
                className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Lock className="text-blue-500" size={20} />
            Informasi Keamanan
          </h2>
          <p className="text-sm text-black mb-1">Password</p>
          <div className="relative group">
            <Lock
              className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-2.5 !bg-green-500 text-white font-semibold rounded-lg hover:!bg-green-600 transition shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <CheckCircle size={18} />
            Tambah Akun
          </button>
        </div>
      </form>

      {/* Modal Error */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} className="text-red-600" /> Gagal
            </h2>
            <p className="text-gray-700 mb-6">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 !bg-red-500 text-white font-semibold rounded hover:!bg-red-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Success */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex justify-center items-center gap-2">
              <CheckCircle size={22} className="text-green-600" /> Berhasil
            </h2>
            <p className="text-gray-700 mb-6">{successMessage}</p>
            <button
              onClick={() => navigate("/admin/data-akun")}
              className="px-4 py-2 !bg-green-500 text-white font-semibold rounded hover:!bg-green-600"
            >
              Kembali ke Data Akun
            </button>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 w-full max-w-4xl shadow-xl border-t-4 border-blue-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Camera size={22} className="text-blue-500" /> Ambil Foto Wajah
              </h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-600 text-sm mb-2">Petunjuk:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Pastikan wajah berada di tengah frame</li>
                <li>Pencahayaan harus cukup terang</li>
                <li>Jaga jarak yang sesuai dengan kamera</li>
                <li>Hindari gerakan berlebihan</li>
              </ul>
            </div>
            <div className="flex justify-center items-center">
              <FaceCaptureAdmin
                onDescriptorCaptured={(desc) => {
                  setDescriptor(desc);
                  // Auto close modal after successful capture
                  setTimeout(() => {
                    setShowCameraModal(false);
                  }, 1000);
                }}
                onImageCaptured={(blob) => {
                  setBlobImage(blob);
                  setPreviewImageUrl(URL.createObjectURL(blob));
                  // Auto close modal after successful capture
                  setTimeout(() => {
                    setShowCameraModal(false);
                  }, 1000);
                }}
              />
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCameraModal(false)}
                className="px-4 py-2 !bg-gray-200 text-gray-800 font-semibold rounded-lg hover:!bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
