import User from "../models/UserModel.js";
import argon2 from "argon2";
import RequestAkun from "../models/RequestAkunModel.js";
import Users from "../models/UserModel.js";
import Mahasiswa from "../models/MahasiswaModel.js";
import Dosen from "../models/DosenModel.js";
import path from "path";
import fs from "fs";
import * as faceapi from 'face-api.js';
import * as canvas from "canvas";
import { Op } from "sequelize";
import xlsx from "xlsx";

export const getUsers = async (req, res) => {
  try {
    const response = await User.findAll({
      attributes: ["uuid", "name", "email", "role"],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: { uuid: req.params.id },
      include: [
        { model: Mahasiswa, as: "mahasiswa" },
        { model: Dosen, as: "dosen" },
      ],
    });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, confPassword, role } = req.body;

  // Cek apakah password dan konfirmasi cocok
  if (password !== confPassword) {
    return res.status(400).json({ msg: "Password dan Konfirmasi tidak cocok" });
  }

  try {
    // Cek apakah email sudah ada di tabel users
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email sudah digunakan" });
    }

    // Cek apakah email sudah request sebelumnya
    const existingRequest = await RequestAkun.findOne({ where: { email } });
    if (existingRequest) {
      return res
        .status(400)
        .json({ msg: "Email sudah pernah mengajukan permintaan akun" });
    }

    // Simpan ke tabel request akun
    const hashPassword = await argon2.hash(password);
    await RequestAkun.create({ name, email, password: hashPassword, role });

    res.status(201).json({
      msg: "Permintaan akun berhasil dikirim. Menunggu persetujuan admin.",
    });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updateUser = async (req, res) => {
  const user = await Users.findOne({ where: { uuid: req.params.id } });
  if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

  const {
    name,
    email,
    password,
    confPassword,
    role,
    nim,
    jurusan,
    ipk,
    tempatTinggal,
    nip,
  } = req.body;

  let hashPassword = user.password;
  if (password && password !== "") {
    if (password !== confPassword) {
      return res
        .status(400)
        .json({ msg: "Password dan konfirmasi tidak cocok" });
    }
    hashPassword = await argon2.hash(password);
  }

  try {
    // VALIDASI EMAIL DUPLIKAT
    const existingEmail = await Users.findOne({
      where: {
        email,
        id: { [Op.ne]: user.id },
      },
    });
    if (existingEmail) {
      return res
        .status(400)
        .json({ msg: "Email sudah digunakan oleh akun lain" });
    }

    // VALIDASI NIM DUPLIKAT (jika Mahasiswa)
    if (role === "Mahasiswa" && nim) {
      const existingNIM = await Mahasiswa.findOne({
        where: {
          nim,
          userId: { [Op.ne]: user.id },
        },
      });
      if (existingNIM) {
        return res
          .status(400)
          .json({ msg: "NIM sudah digunakan oleh akun lain" });
      }
    }

    // VALIDASI NIP DUPLIKAT (jika Dosen)
    if (role === "dosen" && nip) {
      const existingNIP = await Dosen.findOne({
        where: {
          nip,
          userId: { [Op.ne]: user.id },
        },
      });
      if (existingNIP) {
        return res
          .status(400)
          .json({ msg: "NIP sudah digunakan oleh akun lain" });
      }
    }

    // Update users table
    await Users.update(
      { name, email, password: hashPassword, role },
      { where: { id: user.id } }
    );

    if (role === "Mahasiswa") {
      const existing = await Mahasiswa.findOne({ where: { userId: user.id } });

      let faceImagePath = existing?.faceImagePath || null;
      let deskriptorWajah = existing?.deskriptorWajah || null;

      // --- Perbaikan Double Stringify ---
      // Jika deskriptor sudah ada dan berupa string, parse dulu.
      // Sequelize akan otomatis stringify ulang saat menyimpan.
      if (typeof deskriptorWajah === "string") {
        try {
          deskriptorWajah = JSON.parse(deskriptorWajah);
        } catch (e) {
          console.error("Deskriptor wajah lama tidak valid:", e);
          deskriptorWajah = null; // Set jadi null jika formatnya salah
        }
      }
      // --- Akhir Perbaikan ---

      if (req.file) {
        const datasetDir = path.join(
          process.cwd(),
          "face_recognition",
          "dataset"
        );
        if (!fs.existsSync(datasetDir))
          fs.mkdirSync(datasetDir, { recursive: true });

        const filename = `${nim}.jpg`;
        const filePath = path.join(datasetDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);

        faceImagePath = `/face_recognition/dataset/${filename}`;

        const modelPath = path.join(process.cwd(), "models");
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);

        const img = await canvas.loadImage(filePath);
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection?.descriptor?.length === 128) {
          // deskriptorWajah sudah dalam bentuk array, tidak perlu stringify
          deskriptorWajah = Array.from(detection.descriptor);
        }
      }

      const data = {
        userId: user.id,
        nim,
        jurusan,
        ipk: parseFloat(ipk) || 0,
        tempatTinggal,
        faceImagePath,
        deskriptorWajah,
      };

      if (existing) {
        await Mahasiswa.update(data, { where: { userId: user.id } });
      } else {
        await Mahasiswa.create(data);
      }
    }

    if (role === "dosen") {
      const existing = await Dosen.findOne({ where: { userId: user.id } });
      if (existing) {
        await Dosen.update({ nip, jurusan }, { where: { userId: user.id } });
      } else {
        await Dosen.create({ userId: user.id, nip, jurusan });
      }
    }

    res.status(200).json({ msg: "Data user berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const user = await User.findOne({
    where: {
      uuid: req.params.id,
    },
  });
  if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
  try {
    await User.destroy({
      where: {
        id: user.id,
      },
    });
    res.status(200).json({ msg: "User Deleted" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const verifyPassword = async (req, res) => {
  const { password } = req.body;

  try {
    // Ambil user dari session
    const user = await User.findOne({ where: { uuid: req.session.userId } });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const match = await argon2.verify(user.password, password);
    if (!match)
      return res.status(401).json({ success: false, msg: "Password salah" });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

const { loadImage } = canvas;

export const createUserWithRole = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ msg: "Semua field umum wajib diisi." });
  }

  try {
    // Cek apakah email sudah digunakan
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email sudah terdaftar." });
    }

    // === Validasi tambahan sebelum membuat user ===
    if (role === "Mahasiswa") {
      const { nim } = req.body;
      if (!nim) {
        return res.status(400).json({ msg: "NIM wajib diisi." });
      }

      const existingNIM = await Mahasiswa.findOne({ where: { nim } });
      if (existingNIM) {
        return res.status(400).json({ msg: "NIM telah digunakan." });
      }
    }

    if (role === "dosen") {
      const { nip } = req.body;
      if (!nip) {
        return res.status(400).json({ msg: "NIP wajib diisi." });
      }

      const existingNIP = await Dosen.findOne({ where: { nip } });
      if (existingNIP) {
        return res.status(400).json({ msg: "NIP telah digunakan." });
      }
    }

    // Hash password
    const hashedPassword = await argon2.hash(password);

    // Buat user
    const newUser = await Users.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // === Mahasiswa ===
    if (role === "Mahasiswa") {
      const {
        nim,
        jurusan,
        ipk = 0,
        tempatTinggal,
        deskriptorWajah: bodyDeskriptor,
      } = req.body;

      if (!jurusan || !tempatTinggal) {
        return res.status(400).json({ msg: "Data Mahasiswa tidak lengkap." });
      }

      let faceImagePath = null;
      let deskriptorWajah = null;

      // Upload file wajah
      if (req.file) {
        const datasetDir = path.join(
          process.cwd(),
          "face_recognition",
          "dataset"
        );
        if (!fs.existsSync(datasetDir))
          fs.mkdirSync(datasetDir, { recursive: true });

        const filename = `${nim}.jpg`;
        const filePath = path.join(datasetDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);

        faceImagePath = `/face_recognition/dataset/${filename}`;

        const modelPath = path.join(process.cwd(), "models");
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);

        const img = await loadImage(filePath);
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection?.descriptor?.length === 128) {
          deskriptorWajah = Array.from(detection.descriptor);
          console.log("✅ Deskriptor dari file wajah berhasil");
        } else {
          console.warn("⚠️ Tidak ditemukan wajah dalam file yang diupload");
        }
      }

      // Alternatif: deskriptor dikirim dari kamera
      if (!req.file && bodyDeskriptor) {
        try {
          const parsed = Array.isArray(bodyDeskriptor)
            ? bodyDeskriptor
            : JSON.parse(bodyDeskriptor);
          if (parsed.length === 128) {
            deskriptorWajah = parsed;
            console.log("✅ Deskriptor dari kamera diterima");
          }
        } catch (err) {
          console.error("❌ Parsing deskriptor gagal:", err.message);
        }
      }

      await Mahasiswa.create({
        userId: newUser.id,
        nim,
        jurusan,
        ipk,
        tempatTinggal,
        faceImagePath,
        deskriptorWajah,
      });
    }

    // === Dosen ===
    if (role === "dosen") {
      const { nip, jurusan } = req.body;

      if (!jurusan) {
        return res.status(400).json({ msg: "Jurusan Dosen wajib diisi." });
      }

      await Dosen.create({
        userId: newUser.id,
        nip,
        jurusan,
      });
    }

    return res.status(201).json({ msg: "Akun berhasil dibuat." });
  } catch (err) {
    console.error("❌ Gagal membuat akun:", err);
    return res.status(500).json({ msg: "Terjadi kesalahan server." });
  }
};

export const importUsersFromExcel = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "File tidak ditemukan" });
  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: ["name", "email", "password", "role"], defval: "" });
    // Hapus header jika ada
    if (rows.length && rows[0].name === "name" && rows[0].email === "email") rows.shift();
    let inserted = 0, skipped = 0, errors = [];
    for (const row of rows) {
      const { name, email, password, role } = row;
      if (!name || !email || !password || !role) {
        skipped++;
        errors.push(`Baris dengan data tidak lengkap: ${JSON.stringify(row)}`);
        continue;
      }
      // Cek email unik
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        skipped++;
        errors.push(`Email sudah ada: ${email}`);
        continue;
      }
      // Hash password
      const hashPassword = await argon2.hash(password);
      await User.create({ name, email, password: hashPassword, role });
      inserted++;
    }
    res.json({ msg: `Import selesai. Berhasil: ${inserted}, Dilewati: ${skipped}`, errors });
  } catch (err) {
    res.status(500).json({ msg: "Gagal import file: " + err.message });
  }
};
