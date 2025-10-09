import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import FaceCapture from "../../components/FaceCapture";
import PasswordConfirmModal from "../../components/PaswordConfirmModaal";
import {
  FaUserCircle,
  FaEnvelope,
  FaShieldAlt,
  FaIdCard,
  FaUniversity,
  FaMedal,
  FaMapMarkerAlt,
  FaEdit,
  FaCamera,
} from "react-icons/fa";
import { Camera, X } from "lucide-react";

export default function MahasiswaProfile() {
  const [user, setUser] = useState({
    uuid: "",
    name: "",
    email: "",
    role: "",
    nim: "",
    jurusan: "",
    ipk: "",
    tempatTinggal: "",
  });

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [descriptorMsg, setDescriptorMsg] = useState("");
  const navigate = useNavigate();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [capturedDescriptor, setCapturedDescriptor] = useState(null);
  const [capturedImageBlob, setCapturedImageBlob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

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

  const handleCaptureSuccess = async ({ descriptor, imageBlob }) => {
    // Set preview image and store data for later saving
    if (imageBlob) {
      setPreviewImageUrl(URL.createObjectURL(imageBlob));
      setCapturedImageBlob(imageBlob);
      setCapturedDescriptor(descriptor);
    }

    // Auto close modal
    setShowModal(false);
  };

  const handleSaveToDatabase = async () => {
    if (!capturedDescriptor || !capturedImageBlob) {
      setDescriptorMsg("❌ Tidak ada data wajah untuk disimpan.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nim", user.nim);
      formData.append("jurusan", user.jurusan);
      formData.append("ipk", user.ipk);
      formData.append("tempatTinggal", user.tempatTinggal);
      formData.append("deskriptorWajah", JSON.stringify(capturedDescriptor));
      formData.append("image", capturedImageBlob, `${user.nim}.jpg`);

      await axios.patch(
        `http://localhost:5000/mahasiswa/${user.uuid}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setDescriptorMsg(
        "✅ Foto wajah dan deskriptor berhasil disimpan ke server."
      );
      setIsSaved(true);

      // Clear the captured data after successful save
      setCapturedDescriptor(null);
      setCapturedImageBlob(null);
    } catch (err) {
      setDescriptorMsg("❌ Gagal menyimpan foto: " + err.message);
    }
  };

  const handleCancelCapture = () => {
    // Reset all captured data
    setPreviewImageUrl(null);
    setCapturedDescriptor(null);
    setCapturedImageBlob(null);
    setIsSaved(false);
    setDescriptorMsg("");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto px-0 sm:px-0 py-0 pb-16">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          <FaUserCircle className="text-blue-600" /> Profile
        </h1>
        <div className="text-sm text-black flex items-center gap-2">
          <Link
            to="/mahasiswa"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Dashboard
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Profile</span>
        </div>
      </div>

      {msg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <p className="text-sm text-red-600">{msg}</p>
        </div>
      )}
      {descriptorMsg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
          <p className="text-sm text-green-600">{descriptorMsg}</p>
        </div>
      )}

      {/* Card Profile */}
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 backdrop-blur-sm bg-opacity-90">
        <ProfileField icon={<FaUserCircle />} label="Nama" value={user.name} />
        <ProfileField icon={<FaEnvelope />} label="Email" value={user.email} />
        <ProfileField icon={<FaShieldAlt />} label="Role" value={user.role} />
        <ProfileField icon={<FaIdCard />} label="NIM" value={user.nim} />
        <ProfileField
          icon={<FaUniversity />}
          label="Jurusan"
          value={user.jurusan}
        />
        <ProfileField icon={<FaMedal />} label="IPK" value={user.ipk} />
        <ProfileField
          icon={<FaMapMarkerAlt />}
          label="Tempat Tinggal"
          value={user.tempatTinggal}
        />

        <div className="flex flex-wrap gap-4 pt-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 !bg-yellow-500 text-white font-medium rounded-xl hover:!bg-yellow-600 transition-all transform hover:scale-105 shadow-md"
          >
            <FaEdit className="text-lg" /> Edit Profil
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 !bg-blue-600 text-white font-medium rounded-xl hover:!bg-blue-700 transition-all transform hover:scale-105 shadow-md"
          >
            <FaCamera className="text-lg" /> Ambil Wajah
          </button>
        </div>

        {/* Preview Image */}
        {previewImageUrl && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCamera className="text-blue-500" /> Foto Wajah
            </h3>
            <div className="flex items-center gap-4">
              <img
                src={previewImageUrl}
                alt="Preview Wajah"
                className="w-40 h-40 object-cover rounded-lg border border-gray-200 shadow-md"
              />
              <div className="text-sm text-gray-600">
                {isSaved ? (
                  <>
                    <p className="text-green-600 font-medium">
                      ✅ Foto wajah berhasil disimpan ke database
                    </p>
                    <p>Deskriptor wajah telah tersimpan</p>
                    <p>Foto dapat digunakan untuk absensi</p>
                  </>
                ) : (
                  <>
                    <p>✅ Foto wajah berhasil diambil</p>
                    <p>Klik tombol simpan untuk menyimpan ke database</p>
                  </>
                )}
              </div>
            </div>
            {!isSaved && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleSaveToDatabase}
                  disabled={!capturedDescriptor}
                  className="inline-flex items-center gap-2 px-6 py-3 !bg-green-600 text-white font-medium rounded-xl hover:!bg-green-700 transition-all transform hover:scale-105 shadow-md disabled:!bg-gray-400 disabled:cursor-not-allowed"
                >
                  <FaShieldAlt className="text-lg" /> Simpan ke Database
                </button>
                <button
                  onClick={handleCancelCapture}
                  className="inline-flex items-center gap-2 px-6 py-3 !bg-red-500 text-white font-medium rounded-xl hover:!bg-red-600 transition-all transform hover:scale-105 shadow-md"
                >
                  <FaEdit className="text-lg" /> Batal
                </button>
              </div>
            )}
            {isSaved && (
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 px-6 py-3 !bg-green-100 text-green-700 font-medium rounded-xl border border-green-200">
                  <FaShieldAlt className="text-lg" /> ✅ Tersimpan di Database
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showModal && (
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
              <FaceCapture
                user={user}
                onDescriptorCaptured={(desc, imageBlob) => {
                  handleCaptureSuccess({
                    descriptor: desc,
                    imageBlob: imageBlob,
                  });
                }}
              />
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 !bg-gray-200 text-gray-800 font-semibold rounded-lg hover:!bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

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
              navigate(`/Mahasiswa/profile/edit/${user.uuid}`);
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
              <FaShieldAlt className="text-2xl text-red-500" />
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

function ProfileField({ icon, label, value }) {
  return (
    <div className="group">
      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 transition-colors">
        {icon} {label}
      </label>
      <input
        type="text"
        disabled
        value={value || "-"}
        className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all group-hover:bg-gray-100"
      />
    </div>
  );
}
