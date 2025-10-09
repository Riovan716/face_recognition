import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Book,
  Code,
  Layers,
  ListOrdered,
  Calendar,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function DosenEditMatakuliah() {
  const { uuid } = useParams();
  const [form, setForm] = useState({
    matakuliah: "",
    kodematakuliah: "",
    semester: "",
    sks: "",
    tahunajaran: "",
    password: "",
  });
  const [msg, setMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/matakuliah/${uuid}`,
          { withCredentials: true }
        );
        setForm({ ...res.data, password: "" });
      } catch (err) {
        setMsg("Gagal memuat data");
      }
    };
    fetchDetail();
  }, [uuid]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmEdit = async () => {
    try {
      const dataToSend = { ...form };
      if (!form.password) delete dataToSend.password;

      await axios.patch(
        `http://localhost:5000/matakuliah/${form.id}`,
        dataToSend,
        { withCredentials: true }
      );

      setShowModal(false);
      setSuccessMessage("Perubahan berhasil disimpan");
      setShowSuccessModal(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || "Gagal menyimpan perubahan";
      setMsg(errorMessage);
      setShowModal(false);
      setShowErrorModal(true);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto px-0 sm:px-0 py-0 pb-16">
      <div className="bg-white p-6 rounded-md mb-6 border-t-4 border-blue-500 shadow-md">
        <h1 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
       Edit Matakuliah
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
            to="/dosen/matakuliah"
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Matakuliah
          </Link>
          <span className="text-black-500">●</span>
          <Link
            to={`/dosen/matakuliah/${uuid}`}
            className="hover:underline !text-black hover:!text-blue-600 transition duration-150 ease-in-out"
          >
            Detail
          </Link>
          <span className="text-black-500">●</span>
          <span className="text-black font-medium">Edit</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-lg border">
        {msg && (
          <div className="text-red-600 flex gap-2 items-center mb-4">
            <AlertTriangle size={18} /> {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informasi Matakuliah */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Book className="text-blue-500" size={20} />
              Informasi Matakuliah
            </h2>

            {[
              {
                name: "matakuliah",
                label: "Nama Mata Kuliah",
                icon: <Book size={18} />,
              },
              {
                name: "kodematakuliah",
                label: "Kode Mata Kuliah",
                icon: <Code size={18} />,
              },
              {
                name: "semester",
                label: "Semester",
                icon: <Layers size={18} />,
              },
              { name: "sks", label: "SKS", icon: <ListOrdered size={18} /> },
              {
                name: "tahunajaran",
                label: "Tahun Ajaran",
                icon: <Calendar size={18} />,
              },
            ].map((field) => (
              <div key={field.name} className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <span className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  {field.icon}
                </span>
                <input
                  type="text"
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={`Masukkan ${field.label.toLowerCase()}`}
                  className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white !text-black"
                  required
                />
              </div>
            ))}

            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Key
                size={18}
                className="absolute top-[38px] left-3 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password (opsional)"
                className="w-full p-2.5 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white !text-black"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 !bg-yellow-500 text-white font-semibold rounded-lg hover:!bg-yellow-600 transition shadow-md hover:shadow-lg"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>

      {/* Modal Konfirmasi */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-yellow-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex justify-center items-center gap-2">
              <AlertTriangle size={22} className="text-yellow-500" /> Konfirmasi
            </h2>
            <p className="text-gray-700 mb-6">
              Apakah Anda yakin ingin menyimpan perubahan?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 !bg-gray-200 text-gray-800 font-semibold rounded-lg hover:!bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={confirmEdit}
                className="px-6 py-2.5 !bg-yellow-500 text-white font-semibold rounded-lg hover:!bg-yellow-600"
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex justify-center items-center gap-2">
              <CheckCircle size={22} /> Berhasil
            </h2>
            <p className="text-gray-700 mb-6">{successMessage}</p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate(`/dosen/matakuliah/${uuid}`);
              }}
              className="px-4 py-2 !bg-green-500 text-white font-semibold rounded hover:!bg-green-600"
            >
              Kembali ke Detail
            </button>
          </div>
        </div>
      )}

      {/* Modal Error */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex justify-center items-center gap-2">
              <XCircle size={22} /> Gagal
            </h2>
            <p className="text-gray-700 mb-6">{msg}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="px-4 py-2 !bg-red-500 text-white font-semibold rounded hover:!bg-red-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
