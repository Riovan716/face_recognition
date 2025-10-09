import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  AlertTriangle,
  School,
  Home,
  CheckCircle,
  UserCog,
  BarChart,
  BookOpen,
  Upload,
} from "lucide-react";

export default function EditDataAkun() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confPassword: "",
    nim: "",
    jurusan: "",
    ipk: "",
    tempatTinggal: "",
    nip: "",
  });
  const [msg, setMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [faceFile, setFaceFile] = useState(null);
  const [facePreview, setFacePreview] = useState(null);
  const [faceImagePath, setFaceImagePath] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/users/${uuid}`, {
          withCredentials: true,
        });

        const { name, email, role, mahasiswa, dosen } = res.data;
        let extra = {};
        let facePath = null;

        if (role === "Mahasiswa" && mahasiswa) {
          extra = {
            nim: mahasiswa.nim || "",
            jurusan: mahasiswa.jurusan || "",
            ipk: mahasiswa.ipk || "",
            tempatTinggal: mahasiswa.tempatTinggal || "",
          };
          facePath = mahasiswa.faceImagePath || null;
        }

        if (role === "dosen" && dosen) {
          extra = {
            nip: dosen.nip || "",
            jurusan: dosen.jurusan || "",
          };
        }

        setForm({
          name,
          email,
          role,
          password: "",
          confPassword: "",
          nim: "",
          jurusan: "",
          ipk: "",
          tempatTinggal: "",
          nip: "",
          ...extra,
        });
        setFaceImagePath(facePath);
        setFacePreview(null);
        setFaceFile(null);
      } catch (err) {
        setMsg("Gagal memuat data user");
      }
    };
    fetchUser();
  }, [uuid]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleFaceFileChange = (e) => {
    const file = e.target.files[0];
    setFaceFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setFacePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setFacePreview(null);
    }
  };

  const confirmEdit = async () => {
    try {
      const {
        name,
        email,
        role,
        password,
        confPassword,
        nim,
        jurusan,
        ipk,
        tempatTinggal,
        nip,
      } = form;

      let payload;
      let config = { withCredentials: true };
      if (role === "Mahasiswa" && (faceFile || true)) {
        payload = new FormData();
        payload.append("name", name);
        payload.append("email", email);
        payload.append("role", role);
        if (password) {
          payload.append("password", password);
          payload.append("confPassword", confPassword);
        }
        payload.append("nim", nim);
        payload.append("jurusan", jurusan);
        payload.append("ipk", parseFloat(ipk) || 0);
        payload.append("tempatTinggal", tempatTinggal);
        if (faceFile) payload.append("file", faceFile);
        config.headers = { "Content-Type": "multipart/form-data" };
      } else {
        payload = {
          name,
          email,
          role,
          ...(password ? { password, confPassword } : {}),
        };
        if (role === "Mahasiswa") {
          Object.assign(payload, {
            nim,
            jurusan,
            ipk: parseFloat(ipk) || 0,
            tempatTinggal,
          });
        }
        if (role === "dosen") {
          Object.assign(payload, { nip, jurusan });
        }
      }

      await axios.patch(`http://localhost:5000/users/${uuid}`, payload, config);

      setShowModal(false);
      setSuccessModal(true);
      setTimeout(() => {
        navigate("/admin/data-akun");
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.msg || "Gagal menyimpan perubahan";
      setErrorModal(message);
      setShowModal(false);
    }
  };

  return (
    <div className="w-full h-[calc(90vh-4rem)] overflow-y-auto  py-0 pb-16">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md ">
        <h1 className="text-sm font-bold text-black mb-1">Edit Akun</h1>
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
          <span className="text-black font-medium">Edit Akun</span>
        </div>
      </div>

      {msg && (
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertTriangle size={18} />
          <span>{msg}</span>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 text-black bg-white px-8 pt-8 pb-8 rounded-xl shadow-lg border border-gray-100"
      >
        {/* Informasi Dasar */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
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
              name="name"
              value={form.name}
              onChange={handleChange}
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
              name="email"
              value={form.email}
              onChange={handleChange}
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
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white appearance-none cursor-not-allowed"
              disabled
            >
              <option value="admin">Admin</option>
              <option value="dosen">Dosen</option>
              <option value="Mahasiswa">Mahasiswa</option>
            </select>
          </div>
        </div>

        {/* Informasi Mahasiswa */}
        {form.role === "Mahasiswa" && (
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <School className="text-blue-500" size={20} />
              Informasi Mahasiswa
            </h2>
            <p className="text-sm text-black mb-1">Nim</p>
            <div className="relative group">
              <User
                className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                name="nim"
                value={form.nim}
                onChange={handleChange}
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
                name="jurusan"
                value={form.jurusan}
                onChange={handleChange}
                placeholder="Jurusan"
                className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                required
              />
            </div>
            <p className="text-sm text-black mb-1">IPK</p>
            <div className="relative group">
              <BarChart
                className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                name="ipk"
                type="number"
                step="0.01"
                value={form.ipk}
                onChange={handleChange}
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
                name="tempatTinggal"
                value={form.tempatTinggal}
                onChange={handleChange}
                placeholder="Tempat Tinggal"
                className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                required
              />
            </div>
            {/* Input file wajah */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto Wajah (jpg, max 2MB)</label>
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-white border-2 border-dashed border-blue-300 rounded-xl p-4">
                <label htmlFor="face-upload" className="block cursor-pointer w-full sm:w-auto">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-4 hover:bg-blue-50 transition min-w-[180px] min-h-[120px]">
                    <Upload size={28} className="text-blue-500 mb-1" />
                    <span className="font-semibold text-blue-700">Pilih File Wajah</span>
                    <span className="text-xs text-gray-500 mt-1">(.jpg)</span>
                  </div>
                  <input
                    id="face-upload"
                    type="file"
                    accept=".jpg,.jpeg"
                    onChange={handleFaceFileChange}
                    className="hidden"
                  />
                </label>
                <div className="flex flex-col items-center gap-2 min-w-[100px]">
                  {facePreview ? (
                    <img src={facePreview} alt="Preview Wajah Baru" className="w-24 h-24 object-cover rounded-lg border shadow" />
                  ) : faceImagePath ? (
                    <img src={`http://localhost:5000/mahasiswa${faceImagePath}`} alt="Foto Wajah Lama" className="w-24 h-24 object-cover rounded-lg border shadow" />
                  ) : (
                    <span className="text-xs text-gray-400">Belum ada foto wajah</span>
                  )}
                  {facePreview && <span className="text-xs text-green-600">Akan diganti</span>}
                  {!facePreview && faceImagePath && <span className="text-xs text-gray-500">Foto Wajah Lama</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informasi Dosen */}
        {form.role === "dosen" && (
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
                name="nip"
                value={form.nip}
                onChange={handleChange}
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
                name="jurusan"
                value={form.jurusan}
                onChange={handleChange}
                placeholder="Jurusan"
                className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                required
              />
            </div>
          </div>
        )}

        {/* Informasi Keamanan */}
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
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password Baru (opsional)"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>
          <p className="text-sm text-black mb-1">Password</p>
          <div className="relative group">
            <Lock
              className="absolute top-3 left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="password"
              name="confPassword"
              value={form.confPassword}
              onChange={handleChange}
              placeholder="Konfirmasi Password Baru"
              className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-2.5 !bg-yellow-500 text-white font-semibold rounded-lg hover:!bg-yellow-600 transition shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <CheckCircle size={18} />
            Simpan Perubahan
          </button>
        </div>
      </form>

      {/* Modal Konfirmasi */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/10 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-yellow-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} className="text-yellow-500" /> Konfirmasi
            </h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menyimpan perubahan?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 !bg-gray-200 text-gray-800 font-semibold rounded hover:!bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={confirmEdit}
                className="px-4 py-2 !bg-yellow-500 text-white font-semibold rounded hover:!bg-yellow-600"
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Error */}
      {errorModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} className="text-red-600" /> Gagal
            </h2>
            <p className="text-gray-700 mb-6">{errorModal}</p>
            <button
              onClick={() => setErrorModal("")}
              className="px-4 py-2 !bg-red-500 text-white font-semibold rounded hover:!bg-red-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Success */}
      {successModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex justify-center items-center gap-2">
              <CheckCircle size={22} className="text-green-600" /> Berhasil
            </h2>
            <p className="text-gray-700 mb-6">Data akun berhasil diperbarui</p>
            <button
              onClick={() => navigate("/admin/data-akun")}
              className="px-4 py-2 !bg-green-500 text-white font-semibold rounded hover:!bg-green-600"
            >
              Kembali ke Data Akun
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
