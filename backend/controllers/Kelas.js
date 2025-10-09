import Kelas from "../models/KelasModel.js";
import Users from "../models/UserModel.js";
import PresensiGlobal from "../models/PresensiGlobalModel.js";
import Mahasiswa from "../models/MahasiswaModel.js";
import Enrollment from "../models/EnrollmentModel.js";
import Matakuliah from "../models/MataKuliahModel.js";
import Presensi from "../models/PresensiModel.js";
import { Op } from "sequelize";

export const createKelas = async (req, res) => {
  const { materi, matakuliahUuid, waktuMulai, waktuSelesai } = req.body;

  try {
    // Validasi input
    if (!materi || !matakuliahUuid || !waktuMulai || !waktuSelesai) {
      return res.status(400).json({ msg: "Semua field harus diisi" });
    }

    // 1. Buat kelas baru
    const kelas = await Kelas.create({
      materi,
      waktuMulai,
      waktuSelesai,
      userId: req.userId, // Menggunakan req.userId dari middleware
      matakuliahUuid, // ✅ match field name
    });

    // 2. Cari presensi global pada rentang waktu
    const presensiGlobal = await PresensiGlobal.findAll({
      where: {
        waktu: {
          [Op.between]: [waktuMulai, waktuSelesai],
        },
      },
    });

    if (presensiGlobal.length > 0) {
      // Ambil NIM dari presensi global
      const nims = presensiGlobal.map((p) => p.nim);
      // Ambil matakuliah id
      const matkul = await Matakuliah.findOne({
        where: { uuid: matakuliahUuid },
      });
      // Cari mahasiswa yang sudah enrol di matakuliah
      const mahasiswaList = await Mahasiswa.findAll({ where: { nim: nims } });
      const userIds = mahasiswaList.map((m) => m.userId);
      const enrolled = await Enrollment.findAll({
        where: { userId: userIds, matakuliahId: matkul.id },
      });
      const enrolledUserIds = enrolled.map((e) => e.userId);
      // Filter mahasiswa yang benar-benar enrol
      const validMahasiswa = mahasiswaList.filter((m) =>
        enrolledUserIds.includes(m.userId)
      );
      // Buat map nim -> waktu presensi global
      const waktuGlobalMap = new Map();
      presensiGlobal.forEach((pg) => {
        waktuGlobalMap.set(pg.nim, pg.waktu);
      });
      // Buat presensi otomatis untuk kelas baru
      const insertData = validMahasiswa.map((m) => ({
        userId: m.id, // Gunakan mahasiswa.id sebagai foreign key
        kelasUuid: kelas.uuid,
        status: "Hadir",
        waktu: waktuGlobalMap.get(m.nim) || new Date(),
      }));
      if (insertData.length > 0) {
        await Presensi.bulkCreate(insertData);
      }
    }

    res.status(201).json({ msg: "Kelas berhasil ditambahkan" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: err.message });
  }
};

export const getKelasByMatakuliah = async (req, res) => {
  try {
    console.log(
      "Fetching kelas for matakuliah UUID:",
      req.params.matakuliahUuid
    );
    const kelas = await Kelas.findAll({
      where: { matakuliahUuid: req.params.matakuliahUuid },
    });
    res.status(200).json(kelas);
  } catch (err) {
    console.error("Server error in getKelasByMatakuliah:", err.message);
    res.status(500).json({ msg: err.message });
  }
};

export const deleteKelas = async (req, res) => {
  try {
    const { uuid } = req.params;

    // Cari kelas berdasarkan UUID
    const kelas = await Kelas.findOne({ where: { uuid } });

    if (!kelas) {
      return res.status(404).json({ msg: "Kelas tidak ditemukan" });
    }

    // Hapus semua presensi terkait kelas ini
    await Presensi.destroy({
      where: { kelasUuid: uuid },
    });

    // Hapus kelas
    await Kelas.destroy({
      where: { uuid },
    });

    res.status(200).json({ msg: "Kelas berhasil dihapus" });
  } catch (err) {
    console.error("Error deleting kelas:", err);
    res.status(500).json({ msg: err.message });
  }
};
