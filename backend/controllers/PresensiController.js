import Presensi from "../models/PresensiModel.js";
import Mahasiswa from "../models/MahasiswaModel.js";
import Enrollment from "../models/EnrollmentModel.js";
import Kelas from "../models/KelasModel.js";
import Matakuliah from "../models/MataKuliahModel.js";
import { Op } from "sequelize";
import Users from "../models/UserModel.js";

export const presensiOtomatis = async (req, res) => {
  const { nims } = req.body;
  const { kelasUuid } = req.params;

  if (!Array.isArray(nims) || nims.length === 0) {
    return res.status(400).json({ msg: "Data NIM tidak valid atau kosong." });
  }

  try {
    const kelas = await Kelas.findOne({ where: { uuid: kelasUuid } });
    if (!kelas) return res.status(404).json({ msg: "Kelas tidak ditemukan" });

    const matakuliah = await Matakuliah.findOne({
      where: { uuid: kelas.matakuliahUuid },
    });

    const mahasiswaList = await Mahasiswa.findAll({
      where: { nim: nims },
    });

    const userIds = mahasiswaList.map((m) => m.userId);

    const enrolled = await Enrollment.findAll({
      where: {
        userId: userIds,
        matakuliahId: matakuliah.id,
      },
    });

    const enrolledUserIds = enrolled.map((e) => e.userId);

    const validMahasiswa = mahasiswaList.filter((m) =>
      enrolledUserIds.includes(m.userId)
    );

    const now = new Date();
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));

    // Gunakan mahasiswa.id untuk query presensi
    const mahasiswaIds = validMahasiswa.map((m) => m.id);

    const already = await Presensi.findAll({
      where: {
        userId: mahasiswaIds,
        kelasUuid,
        waktu: {
          [Op.between]: [start, end],
        },
      },
    });

    const alreadyUserIds = already.map((p) => p.userId);

    const insertData = validMahasiswa
      .filter((m) => !alreadyUserIds.includes(m.id))
      .map((m) => ({
        userId: m.id, // Gunakan mahasiswa.id sebagai foreign key
        kelasUuid,
        status: "hadir",
        waktu: new Date(),
      }));

    await Presensi.bulkCreate(insertData);

    return res.status(200).json({
      msg: "Presensi berhasil dicatat",
      total: insertData.length,
      data: insertData,
    });
  } catch (error) {
    console.error("❌ Gagal presensi otomatis:", error);
    return res.status(500).json({ msg: "Gagal melakukan presensi otomatis" });
  }
};

export const createPresensiOtomatis = async (req, res) => {
  try {
    const { nims } = req.body;
    const { kelasUuid } = req.params;

    console.log("📥 [REQ] Presensi otomatis diterima");
    console.log("➡️ Kelas UUID:", kelasUuid);
    console.log("➡️ NIMs diterima:", nims);

    if (!Array.isArray(nims) || nims.length === 0) {
      console.warn("⚠️ NIM kosong atau tidak valid");
      return res.status(400).json({ msg: "NIM kosong atau tidak valid" });
    }

    const kelas = await Kelas.findOne({ where: { uuid: kelasUuid } });
    if (!kelas) {
      console.error("❌ Kelas tidak ditemukan:", kelasUuid);
      return res.status(404).json({ msg: "Kelas tidak ditemukan" });
    }

    console.log("✅ Kelas ditemukan:", kelas.materi);
    const inserted = [];
    const skipped = [];

    for (const nim of nims) {
      console.log(`🔍 Mencari mahasiswa dengan NIM: ${nim}`);
      const mhs = await Mahasiswa.findOne({ where: { nim } });

      if (!mhs) {
        console.warn(`⚠️ Mahasiswa tidak ditemukan: ${nim}`);
        skipped.push({ nim, reason: "Mahasiswa tidak ditemukan" });
        continue;
      }

      const mahasiswaId = mhs.id; // Gunakan mahasiswa.id sebagai foreign key

      console.log(
        `🔎 Cek presensi existing untuk mahasiswaId=${mahasiswaId}, kelasUuid=${kelasUuid}`
      );
      const already = await Presensi.findOne({
        where: {
          userId: mahasiswaId,
          kelasUuid,
        },
      });

      if (already) {
        console.log(
          `⚠️ Ditemukan presensi existing untuk NIM ${nim}:`,
          already.toJSON()
        );
        skipped.push({ nim, reason: "Presensi sudah ada" });
        continue;
      }

      const newPresensi = await Presensi.create({
        kelasUuid,
        userId: mahasiswaId, // Gunakan mahasiswa.id
        waktu: new Date(),
        status: "hadir",
      });

      console.log(
        `✅ INSERTED: Presensi dicatat untuk ${nim}, UUID: ${newPresensi.uuid}`
      );
      inserted.push(nim);
    }

    console.log("🎉 Presensi otomatis selesai:", { inserted, skipped });
    res.status(200).json({
      msg: "Presensi berhasil diproses",
      total: inserted.length,
      terisi: inserted,
      skipped: skipped,
    });
  } catch (err) {
    console.error("❌ [ERROR] Gagal menyimpan presensi otomatis:", err);
    res.status(500).json({
      msg: "Terjadi kesalahan server",
      error: err.message,
    });
  }
};

export const getPresensiByKelas = async (req, res) => {
  try {
    const { kelasUuid } = req.params;

    console.log(`[DEBUG] Mengambil presensi untuk kelasUuid: ${kelasUuid}`);
    const presensi = await Presensi.findAll({
      where: { kelasUuid },
      include: [
        {
          model: Mahasiswa,
          attributes: ["nim", "jurusan"],
          include: [
            {
              model: Users,
              as: "user",
              attributes: ["uuid", "name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log("[DEBUG] Data presensi yang diambil:", presensi);
    if (presensi.length === 0) {
      console.log(
        "[DEBUG] Tidak ada data presensi untuk kelasUuid:",
        kelasUuid
      );
    }

    res.status(200).json(presensi);
  } catch (err) {
    console.error("❌ ERROR getPresensiByKelas:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const getStatusPresensiMahasiswa = async (req, res) => {
  try {
    const userUuid = req.session.userId;
    if (!userUuid) return res.status(401).json({ msg: "Unauthorized" });

    const user = await Users.findOne({
      where: { uuid: userUuid },
    });

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Cari data mahasiswa berdasarkan userId
    const mahasiswa = await Mahasiswa.findOne({ where: { userId: user.id } });
    if (!mahasiswa) {
      return res.status(404).json({ msg: "Mahasiswa data not found" });
    }

    const records = await Presensi.findAll({
      where: { userId: mahasiswa.id }, // Gunakan mahasiswa.id karena presensi disimpan dengan mahasiswa.id
      attributes: ["kelasUuid"],
      group: ["kelasUuid"],
    });

    const hadirKelasUuids = records.map((r) => r.kelasUuid);
    res.status(200).json({ hadir: hadirKelasUuids });
  } catch (err) {
    console.error("❌ getStatusPresensiMahasiswa error:", err.message);
    res.status(500).json({ msg: "Terjadi kesalahan", error: err.message });
  }
};
