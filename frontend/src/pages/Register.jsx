import { useState } from "react";
import { registerUser } from "../api/auth";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaLock,
  FaEnvelope,
  FaUserGraduate,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confPassword: "",
    role: "Mahasiswa",
  });

  const [modalMsg, setModalMsg] = useState("");
  const [modalType, setModalType] = useState("success"); // "success" atau "error"
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confPassword) {
      setModalType("error");
      setModalMsg("Konfirmasi password tidak sesuai.");
      setShowModal(true);
      return;
    }

    try {
      const res = await registerUser(form);
      setModalType("success");
      setModalMsg(res.data.msg);
      setShowModal(true);
      setForm({
        name: "",
        email: "",
        password: "",
        confPassword: "",
        role: "Mahasiswa",
      });
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Gagal mendaftar";
      setModalType("error");
      setModalMsg(errorMsg);
      setShowModal(true);
    }
  };

  return (
    <motion.div className="relative min-h-screen bg-gradient-to-br from-blue-600 to-gray-300 overflow-hidden flex items-center justify-center">
      {/* Diagonal Background Lines */}
      <div className="absolute inset-0 backdrop-blur-sm">
        <div className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 transform rotate-20">
          <div className="absolute w-full h-[70px] bg-blue-400/20 top-[0%]"></div>
          <div className="absolute w-full h-[80px] bg-white/40 top-[20%]"></div>
          <div className="absolute w-full h-[80px] bg-white/40 top-[40%]"></div>
          <div className="absolute w-full h-[80px] bg-white/40 top-[60%]"></div>
          <div className="absolute w-full h-[70px] bg-blue-400/20 top-[80%]"></div>
        </div>
      </div>

      <div className="w-full max-w-5xl flex flex-col items-center">
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-0">
          {/* Image Card - Left Side */}
          <motion.div
            initial={{ x: "-100vw", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100vw", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 40,
              damping: 12,
              duration: 0.6,
            }}
            className="w-full lg:w-[60%] h-[600px] hidden lg:flex items-center justify-center"
          >
            <div className="w-full h-full bg-white backdrop-blur-md rounded-l-4xl rounded-r-none shadow-2xl shadow-gray-800 p-6 border border-white/20 flex items-center justify-center">
              <img
                src="/LOG.jpg"
                alt="Graduation Illustration"
                className="w-full h-full object-cover rounded-xl shadow-lg"
              />
            </div>
          </motion.div>

          {/* Register Form Card - Right Side */}
          <motion.div
            initial={{ x: "100vw", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100vw", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 40,
              damping: 12,
              duration: 0.6,
            }}
            className="w-full lg:w-[55%] h-[600px] flex items-center justify-center"
          >
            <div className="w-full bg-white/10 backdrop-blur-md lg:rounded-r-4xl lg:rounded-l-none rounded-4xl shadow-2xl px-8 py-8 border border-white/20 flex flex-col justify-center shadow-gray-800">
              <h1 className="!text-2xl font-bold text-center bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg mb-6">
                Face Recognition Attendance
              </h1>
              <div className="w-full max-w-md mx-auto flex justify-center gap-4 mb-6 z-10">
                <a
                  href="/login"
                  className="flex-1 !bg-white !text-black py-3 !rounded-full shadow-lg font-semibold text-base text-center text-nowrap hover:!bg-gray-100 transition-all"
                >
                  Login
                </a>
                <button className="flex-1 bg-gradient-to-r !bg-blue-600 hover:!bg-blue-700 text-white py-3 !rounded-full shadow-lg font-semibold text-base text-center text-nowrap">
                  Register
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 max-w-md mx-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2 ml-1">
                      Nama Lengkap
                    </label>
                    <div className="flex items-center border-2 border-white/20 !rounded-full px-5 py-3 bg-white/5 backdrop-blur-sm shadow-sm">
                      <FaUser className="text-white mr-3 text-lg" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Nama Lengkap"
                        onChange={handleChange}
                        value={form.name}
                        className="w-full bg-transparent focus:outline-none text-white placeholder-white/60 text-base"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2 ml-1">
                      Email
                    </label>
                    <div className="flex items-center border-2 border-white/20 !rounded-full px-5 py-3 bg-white/5 backdrop-blur-sm shadow-sm">
                      <FaEnvelope className="text-white mr-3 text-lg" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Alamat Email"
                        onChange={handleChange}
                        value={form.email}
                        className="w-full bg-transparent focus:outline-none text-white placeholder-white/60 text-base"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2 ml-1">
                      Password
                    </label>
                    <div className="flex items-center border-2 border-white/20 !rounded-full px-5 py-3 bg-white/5 backdrop-blur-sm shadow-sm">
                      <FaLock className="text-white mr-3 text-lg" />
                      <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        value={form.password}
                        className="w-full bg-transparent focus:outline-none text-white placeholder-white/60 text-base"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2 ml-1">
                      Konfirmasi Password
                    </label>
                    <div className="flex items-center border-2 border-white/20 !rounded-full px-5 py-3 bg-white/5 backdrop-blur-sm shadow-sm">
                      <FaLock className="text-white mr-3 text-lg" />
                      <input
                        type="password"
                        name="confPassword"
                        placeholder="Konfirmasi Password"
                        onChange={handleChange}
                        value={form.confPassword}
                        className="w-full bg-transparent focus:outline-none text-white placeholder-white/60 text-base"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2 ml-1">
                    Role
                  </label>
                  <div className="flex items-center border-2 border-white/20 !rounded-full px-5 py-3 bg-white/5 backdrop-blur-sm shadow-sm">
                    <FaUserGraduate className="text-white mr-3 text-lg" />
                    <select
                      name="role"
                      onChange={handleChange}
                      value={form.role}
                      className="w-full bg-transparent focus:outline-none text-white text-base appearance-none"
                    >
                      <option value="Mahasiswa" className="text-black">
                        Mahasiswa
                      </option>
                      <option value="admin" className="text-black">
                        Admin
                      </option>
                      <option value="dosen" className="text-black">
                        Dosen
                      </option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r !bg-blue-500 text-white font-semibold py-3 !rounded-full shadow text-base hover:!bg-blue-600 transition-all"
                >
                  Daftar
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className={`relative p-10 rounded-3xl shadow-2xl text-center w-[90%] max-w-sm transform transition-all duration-500 ${
              modalType === "success"
                ? "bg-gradient-to-br from-white to-white border-2 border-green-200"
                : "bg-gradient-to-br from-white to-white border-2 border-red-200"
            } backdrop-blur-md overflow-hidden`}
          >
            <div
              className={`absolute top-0 left-0 w-full h-1.5 ${
                modalType === "success"
                  ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                  : "bg-gradient-to-r from-red-400 via-red-500 to-red-600"
              }`}
            ></div>

            <div className="relative">
              <div
                className={`flex justify-center mb-8 ${
                  modalType === "success"
                    ? "text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                    : "text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                }`}
              >
                {modalType === "success" ? (
                  <FaCheckCircle className="text-7xl animate-bounce" />
                ) : (
                  <FaTimesCircle className="text-7xl animate-bounce" />
                )}
              </div>

              <div className="space-y-3">
                <h3
                  className={`text-3xl font-bold ${
                    modalType === "success" ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {modalType === "success" ? "Success!" : "Error!"}
                </h3>
                <p
                  className={`text-xl ${
                    modalType === "success" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {modalMsg}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className={`mt-10 px-10 py-4 rounded-xl font-medium ${
                  modalType === "success"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                }`}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
