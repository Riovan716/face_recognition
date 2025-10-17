// controllers/MataKuliahController.js
import MataKuliah from "../models/MataKuliahModel.js";
import Users from "../models/UserModel.js";
import argon2 from "argon2";
import { Op } from "sequelize";
import { UniqueConstraintError } from "sequelize";
import Kelas from "../models/KelasModel.js";

export const getAllMataKuliah = async (req, res) => {
  try {
    const filter = req.query.filter;

    let whereClause = {};
    if (filter === "me") {
      if (!req.session.userId) {
        return res.status(401).json({ msg: "Unauthorized" });
      }

      const user = await Users.findOne({ where: { uuid: req.session.userId } });
      if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

      whereClause.userId = user.id;
    }

    const data = await MataKuliah.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const verifyMatkulPassword = async (req, res) => {
  const { uuid, password } = req.body;

  try {
    const matkul = await MataKuliah.findOne({ where: { uuid } });
    if (!matkul)
      return res.status(404).json({ msg: "Mata kuliah tidak ditemukan" });

    // Jika user login adalah dosen pengampu, langsung valid
    if (req.session.userId) {
      const user = await Users.findOne({ where: { uuid: req.session.userId } });
      if (user && user.role === "dosen" && user.id === matkul.userId) {
        return res.json({ valid: true });
      }
    }

    const match = await argon2.verify(matkul.password, password);
    res.json({ valid: match });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getMatakuliahByUuid = async (req, res) => {
  try {
    console.log("Fetching matakuliah with UUID:", req.params.uuid);
    const matkul = await MataKuliah.findOne({
      where: { uuid: req.params.uuid },
    });
    if (!matkul) return res.status(404).json({ msg: "Data tidak ditemukan" });
    res.json(matkul);
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ msg: err.message });
  }
};

// Tambah
export const createMataKuliah = async (req, res) => {
  const {
    matakuliah,
    kodematakuliah,
    semester,
    sks,
    tahunajaran,
    userId,
    password,
  } = req.body;

  try {
    const hash = await argon2.hash(password); // 🔐 Hash password pakai Argon2

    await MataKuliah.create({
      matakuliah,
      kodematakuliah,
      semester,
      sks,
      tahunajaran,
      userId,
      password: hash, // ✅ Simpan hash, bukan password asli
    });

    res.status(201).json({ msg: "Mata kuliah berhasil ditambahkan" });
  } catch (error) {
    // Deteksi error karena field unik
    if (error instanceof UniqueConstraintError) {
      const field = error.errors[0]?.path;
      if (field === "matakuliah") {
        return res
          .status(400)
          .json({ msg: "Nama mata kuliah sudah digunakan" });
      }
    }

    res.status(500).json({ msg: error.message });
  }
};
// Tambah oleh Admin
export const createMataKuliahByAdmin = async (req, res) => {
  const {
    matakuliah,
    kodematakuliah,
    semester,
    sks,
    tahunajaran,
    dosenId,
    password,
  } = req.body;

  try {
    // 🔐 Verifikasi bahwa user yang request adalah admin
    if (!req.session.userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const admin = await Users.findOne({ where: { uuid: req.session.userId } });
    if (!admin || admin.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "Hanya admin yang dapat menambah mata kuliah" });
    }

    // 🎓 Cari dosen yang dipilih
    const dosen = await Users.findOne({
      where: { id: dosenId, role: "dosen" },
    });
    if (!dosen) {
      return res.status(404).json({ msg: "Dosen tidak ditemukan" });
    }

    // 🧠 Pre-check: pastikan kode & nama belum digunakan
    const existingKode = await MataKuliah.findOne({
      where: { kodematakuliah },
    });
    if (existingKode) {
      return res.status(400).json({ msg: "Kode mata kuliah sudah digunakan" });
    }

    const existingNama = await MataKuliah.findOne({
      where: { matakuliah },
    });
    if (existingNama) {
      return res.status(400).json({ msg: "Nama mata kuliah sudah digunakan" });
    }

    // 🔑 Hash password matakuliah
    const hash = await argon2.hash(password);

    // 🧾 Buat matakuliah baru dengan userId dosen yang dipilih
    await MataKuliah.create({
      matakuliah,
      kodematakuliah,
      semester,
      sks,
      tahunajaran,
      userId: dosen.id,
      password: hash,
    });

    return res
      .status(201)
      .json({ msg: "Mata kuliah berhasil ditambahkan" });
  } catch (error) {
    console.error("❌ Error createMataKuliahByAdmin:", error);

    // 🎯 Tangani error unik dari Sequelize
    if (
      error.name === "SequelizeUniqueConstraintError" ||
      error instanceof UniqueConstraintError
    ) {
      const field = error?.errors?.[0]?.path || "unknown";
      const message =
        field === "matakuliah"
          ? "Nama mata kuliah sudah digunakan"
          : field === "kodematakuliah"
          ? "Kode mata kuliah sudah digunakan"
          : "Data sudah digunakan, harap gunakan nilai unik";
      return res.status(400).json({ msg: message });
    }

    // 🎯 Tangani error validasi (misalnya field kosong, panjang field tidak sesuai)
    if (error.name === "SequelizeValidationError") {
      const message =
        error.errors?.map((e) => e.message).join(", ") ||
        "Input tidak valid, periksa kembali data yang dimasukkan.";
      return res.status(400).json({ msg: message });
    }

    // 🧱 Tangani error database umum (misalnya koneksi atau query)
    if (error.name === "SequelizeDatabaseError") {
      return res
        .status(500)
        .json({ msg: "Terjadi kesalahan pada database: " + error.message });
    }

    // 🔥 Fallback untuk error tak terduga
    return res
      .status(500)
      .json({ msg: error.message || "Terjadi kesalahan pada server" });
  }
};

// Edit
// PATCH /matakuliah/:id

export const updateMataKuliah = async (req, res) => {
  try {
    const mataKuliah = await MataKuliah.findByPk(req.params.id);
    if (!mataKuliah)
      return res.status(404).json({ msg: "Data tidak ditemukan" });

    // Cek apakah nama matakuliah sudah dipakai oleh ID lain
    if (req.body.matakuliah) {
      const existing = await MataKuliah.findOne({
        where: {
          matakuliah: req.body.matakuliah,
          id: { [Op.ne]: req.params.id }, // bukan dirinya sendiri
        },
      });

      if (existing) {
        return res.status(400).json({ msg: "Nama mata kuliah sudah ada" });
      }
    }

    const updatedData = { ...req.body };

    if (req.body.password && req.body.password.trim() !== "") {
      updatedData.password = await argon2.hash(req.body.password);
    } else {
      delete updatedData.password;
    }

    await mataKuliah.update(updatedData);
    res.status(200).json({ msg: "Mata kuliah berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Hapus
export const deleteMataKuliah = async (req, res) => {
  try {
    const mataKuliah = await MataKuliah.findByPk(req.params.id);
    if (!mataKuliah)
      return res.status(404).json({ msg: "Mata kuliah tidak ditemukan" });

    // Hapus semua kelas yang terkait dengan matakuliah ini
    await Kelas.destroy({ where: { matakuliahUuid: mataKuliah.uuid } });

    // Setelah itu, hapus matakuliah-nya
    await mataKuliah.destroy();

    res
      .status(200)
      .json({ msg: "Mata kuliah dan semua kelas berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ msg: "Gagal menghapus: " + err.message });
  }
};
