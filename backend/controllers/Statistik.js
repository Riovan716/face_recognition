import Users from "../models/UserModel.js";
import Mahasiswa from "../models/MahasiswaModel.js";
import Matakuliah from "../models/MataKuliahModel.js";
import Enrollment from "../models/EnrollmentModel.js";
import Presensi from "../models/PresensiModel.js";
import Kelas from "../models/KelasModel.js";
import { Op } from "sequelize";


export const getStatistikUsers = async (req, res) => {
  try {
    const users = await Users.findAll();

    const total = users.length;
    const admin = users.filter((u) => u.role === "admin").length;
    const dosen = users.filter((u) => u.role === "dosen").length;
    const mahasiswa = users.filter((u) => u.role === "Mahasiswa").length;

    res.json({
      total,
      admin,
      dosen,
      mahasiswa,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getDosenDashboardData = async (req, res) => {
  try {
    const userUuid = req.session.userId; // ⬅️ Ambil dari session
    if (!userUuid) return res.status(401).json({ msg: "Unauthorized" });

    const user = await Users.findOne({ where: { uuid: userUuid } });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const dosenId = user.id;

    console.log("✅ Dosen ID dari Session:", dosenId);

    const matakuliah = await Matakuliah.findAll({
      where: { userId: dosenId },
      attributes: ["id", "matakuliah"],
    });

    const chartData = [];

    for (let mk of matakuliah) {
      const count = await Enrollment.count({
        where: { matakuliahId: mk.id },
      });

      chartData.push({
        matakuliah: mk.matakuliah,
        jumlahMahasiswa: count,
      });
    }

    res.json({
      userId: dosenId,
      totalMatakuliah: matakuliah.length,
      chartData,
    });
  } catch (error) {
    console.error("❌ Error di Dashboard Dosen:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

export const getMahasiswaDashboardData = async (req, res) => {
  try {
    const userUuid = req.session.userId;
    if (!userUuid) return res.status(401).json({ msg: "Unauthorized" });

    const user = await Users.findOne({ where: { uuid: userUuid } });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const userId = user.id;

    // Cari data mahasiswa berdasarkan userId
    const mahasiswa = await Mahasiswa.findOne({ where: { userId } });
    if (!mahasiswa) {
      return res.json({
        totalMatakuliah: 0,
        chartData: [],
      });
    }

    // Ambil semua matakuliah yang diikuti
    const enrollments = await Enrollment.findAll({
      where: { userId },
      include: {
        model: Matakuliah,
        attributes: ["id", "matakuliah", "uuid"],
      },
    });

    const chartData = [];

    for (const e of enrollments) {
      const mk = e.matakuliah;

      // Ambil semua kelas dari matakuliah ini
      const kelasList = await Kelas.findAll({
        where: { matakuliahUuid: mk.uuid },
        attributes: ["uuid"],
      });

      const kelasUuids = kelasList.map((k) => k.uuid);
      if (kelasUuids.length === 0) {
        chartData.push({ matakuliah: mk.matakuliah, persenPresensi: 0 });
        continue;
      }

      // Hitung total kelas yang seharusnya diikuti (total kelas dari matakuliah ini)
      const totalKelas = kelasUuids.length;

      // Hitung jumlah hadir atau terlambat (status positif) untuk mahasiswa ini di kelas-kelas ini
      const hadir = await Presensi.count({
        where: {
          userId: mahasiswa.id, // Gunakan mahasiswa.id karena presensi disimpan dengan mahasiswa.id
          kelasUuid: { [Op.in]: kelasUuids },
          status: { [Op.in]: ["hadir", "terlambat"] },
        },
      });

      // Hitung persentase berdasarkan total kelas yang seharusnya diikuti
      const persen =
        totalKelas > 0 ? Math.round((hadir / totalKelas) * 100) : 0;

      chartData.push({
        matakuliah: mk.matakuliah,
        persenPresensi: persen,
      });
    }

    res.json({
      totalMatakuliah: enrollments.length,
      chartData,
    });
  } catch (err) {
    console.error("❌ Error Mahasiswa Dashboard:", err.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};