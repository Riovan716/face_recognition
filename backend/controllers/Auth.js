import User from "../models/UserModel.js";

import argon2 from "argon2";

import { Users, Mahasiswa, Dosen } from "../models/index.js";

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🟡 Incoming login:", email, password);

    if (!email || !password) {
      return res.status(400).json({ msg: "Email dan password harus diisi" });
    }

    const user = await Users.findOne({ where: { email } });
    if (!user) {
      console.log("❌ User tidak ditemukan:", email);
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    console.log("🔍 User ditemukan, memverifikasi password...");
    const match = await argon2.verify(user.password, password);
    if (!match) {
      console.log("❌ Password salah untuk user:", email);
      return res.status(400).json({ msg: "Password salah" });
    }

    console.log("✅ Login berhasil untuk user:", email);
    req.session.userId = user.uuid;

    const { uuid, name, email: userEmail, role } = user;
    res.status(200).json({ uuid, name, email: userEmail, role });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ msg: "Terjadi kesalahan saat login: " + err.message });
  }
};

export const Me = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ msg: "Belum login atau session habis" });
    }
    const user = await Users.findOne({
      where: { uuid: req.session.userId },
      include: [
        { model: Mahasiswa, as: "mahasiswa" },
        { model: Dosen, as: "dosen" },
      ],
    });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const response = {
      id: user.id,
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    if (user.role === "Mahasiswa" && user.mahasiswa) {
      response.nim = user.mahasiswa.nim;
      response.jurusan = user.mahasiswa.jurusan;
      response.ipk = user.mahasiswa.ipk;
      response.tempatTinggal = user.mahasiswa.tempatTinggal;
    }

    if (user.role === "dosen" && user.dosen) {
      response.nip = user.dosen.nip;
      response.jurusan = user.dosen.jurusan;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error in /me:", error);
    res.status(500).json({ msg: error.message });
  }
};

export const logOut = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(400).json({ msg: "Tidak dapat logout" });
    res.status(200).json({ msg: "Anda telah logout" });
  });
};
