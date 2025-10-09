import Enrollment from "../models/EnrollmentModel.js";
import MataKuliah from "../models/MataKuliahModel.js";
import Users from "../models/UserModel.js";
import argon2 from "argon2";
import Mahasiswa from "../models/MahasiswaModel.js";
import Kelas from "../models/KelasModel.js"; // ✅ tambahkan ini
import Presensi from "../models/PresensiModel.js";
import { Op } from "sequelize";

// GET /enrollments/check/:userUuid/:matakuliahId
export const checkEnrollment = async (req, res) => {
  const { userUuid, matakuliahId } = req.params;

  const user = await Users.findOne({ where: { uuid: userUuid } });
  if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

  const enrolled = await Enrollment.findOne({
    where: { userId: user.id, matakuliahId },
  });

  return res.json({ enrolled: !!enrolled });
};

// POST /enrollments
export const enrollMatkul = async (req, res) => {
  const { userUuid, matakuliahUuid, password } = req.body;

  if (!userUuid || !matakuliahUuid || !password) {
    return res.status(400).json({ msg: "Data tidak lengkap" });
  }

  const user = await Users.findOne({ where: { uuid: userUuid } });
  if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

  const matkul = await MataKuliah.findOne({ where: { uuid: matakuliahUuid } });
  if (!matkul)
    return res.status(404).json({ msg: "Mata kuliah tidak ditemukan" });

  const match = await argon2.verify(matkul.password, password);
  if (!match) return res.status(401).json({ msg: "Password salah" });

  const existing = await Enrollment.findOne({
    where: { userId: user.id, matakuliahId: matkul.id },
  });
  if (existing) return res.status(400).json({ msg: "Sudah terdaftar" });

  await Enrollment.create({
    userId: user.id,
    matakuliahId: matkul.id,
  });

  res.status(201).json({ msg: "Berhasil enrol" });
};

export const getMahasiswaEnrolledInMatkul = async (req, res) => {
  try {
    const matkul = await MataKuliah.findOne({
      where: { uuid: req.params.uuid },
    });
    if (!matkul) {
      return res.status(404).json({ msg: "Matakuliah tidak ditemukan" });
    }

    const enrollments = await Enrollment.findAll({
      where: { matakuliahId: matkul.id },
      include: [
        {
          model: Users,
          as: "user", // ✅ Pastikan alias 'user' ada di relasi
          attributes: ["uuid", "name", "email"],
          include: [
            {
              model: Mahasiswa,
              as: "mahasiswa", // ✅ Pastikan alias 'mahasiswa' ada
              attributes: ["nim", "jurusan", "faceImagePath"],
              required: false, // Gunakan LEFT JOIN untuk mahasiswa
            },
          ],
        },
      ],
    });

    const result = enrollments
      .map((e) => {
        // Filter jika user atau mahasiswa tidak ada (misal, user adalah dosen)
        if (!e.user || !e.user.mahasiswa) {
          return null;
        }
        return {
          uuid: e.user.uuid,
          name: e.user.name,
          email: e.user.email,
          nim: e.user.mahasiswa.nim,
          jurusan: e.user.mahasiswa.jurusan,
          faceImagePath: e.user.mahasiswa.faceImagePath,
        };
      })
      .filter(Boolean); // Hapus semua hasil null dari array

    res.json(result);
  } catch (error) {
    console.error("🔥 Error getMahasiswaEnrolledInMatkul:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan di server." });
  }
};

export const unenrollMatkul = async (req, res) => {
  const { userUuid, matakuliahUuid } = req.body;

  console.log("🧾 Body Request:", req.body);

  try {
    // Cari user berdasarkan UUID
    const user = await Users.findOne({ where: { uuid: userUuid } });
    // Cari matakuliah berdasarkan UUID
    const matkul = await MataKuliah.findOne({
      where: { uuid: matakuliahUuid },
    });

    // Debug log tambahan
    console.log("🔥 userUuid:", userUuid, "matakuliahUuid:", matakuliahUuid);
    console.log("🔥 user.id:", user?.id, "matkul.id:", matkul?.id);

    if (!user || !matkul) {
      console.log("❌ Data user atau matkul tidak ditemukan.");
      return res.status(404).json({ msg: "Data tidak ditemukan" });
    }

    // Hapus data enrollment
    const deleted = await Enrollment.destroy({
      where: {
        userId: user.id,
        matakuliahId: matkul.id,
      },
    });

    if (!deleted) {
      console.log("❌ Tidak ada data yang dihapus.");
      return res.status(400).json({ msg: "Belum terdaftar" });
    }

    console.log("✅ Mahasiswa berhasil dihapus dari enrolment.");
    res.json({ msg: "Berhasil unenrol" });
  } catch (error) {
    console.error("🔥 Error saat unenroll:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan di server" });
  }
};

export const getMatkulEnrolledByUser = async (req, res) => {
  const { userUuid } = req.params;

  try {
    const user = await Users.findOne({ where: { uuid: userUuid } });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const enrollments = await Enrollment.findAll({
      where: { userId: user.id },
      include: [
        {
          model: MataKuliah,
          as: "matakuliah", // pastikan alias ini sesuai dengan relasi di model
        },
      ],
    });

    const result = enrollments.map((e) => ({
      uuid: e.matakuliah.uuid,
      id: e.matakuliah.id,
      matakuliah: e.matakuliah.matakuliah,
      kodematakuliah: e.matakuliah.kodematakuliah,
      tahunajaran: e.matakuliah.tahunajaran,
      // tambahkan jika perlu
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Error getMatkulEnrolledByUser:", err.message);
    res.status(500).json({ msg: err.message });
  }
};

// GET /enrollments/matakuliah/:uuid/with-presensi
export const getMahasiswaEnrolledWithPresensi = async (req, res) => {
  const { uuid } = req.params;

  try {
    const matkul = await MataKuliah.findOne({
      where: { uuid },
      // 1. Ambil semua kelas yang terkait dengan matakuliah ini
      include: [{ model: Kelas, as: "kelas", attributes: ["uuid"] }],
    });

    if (!matkul) {
      return res.status(404).json({ msg: "Matakuliah tidak ditemukan" });
    }

    const totalKelas = matkul.kelas.length;
    const kelasUuids = matkul.kelas.map((k) => k.uuid);

    // 2. Ambil semua mahasiswa yang terdaftar di matakuliah ini
    const enrollments = await Enrollment.findAll({
      where: { matakuliahId: matkul.id },
      include: [
        {
          model: Users,
          as: "user", // Pastikan alias ini sesuai dengan yang ada di model
          attributes: ["uuid", "name", "email"],
          include: [
            {
              model: Mahasiswa,
              as: "mahasiswa", // Alias untuk relasi User -> Mahasiswa
              attributes: ["nim", "jurusan", "userId", "faceImagePath"],
              // 3. Hitung presensi untuk setiap mahasiswa di kelas-kelas terkait
              include: [
                {
                  model: Presensi,
                  as: "presensis", // Ganti ke alias yang benar
                  attributes: ["status"],
                  where: {
                    kelasUuid: { [Op.in]: kelasUuids },
                    status: "Hadir", // Hanya hitung yang 'Hadir'
                  },
                  required: false, // Gunakan LEFT JOIN
                },
              ],
            },
          ],
        },
      ],
    });

    // 4. Proses data untuk response
    const result = enrollments.map((e) => {
      const user = e.user;
      const mhs = user?.mahasiswa;
      const hadir = mhs?.presensis?.length || 0;
      const persentase =
        totalKelas > 0 ? Math.round((hadir / totalKelas) * 100) : 0;

      return {
        uuid: user?.uuid,
        name: user?.name,
        email: user?.email,
        nim: mhs?.nim || "-",
        jurusan: mhs?.jurusan || "-",
        faceImagePath: mhs?.faceImagePath || null,
        persentaseHadir: persentase,
      };
    });

    res.json(result);
  } catch (error) {
    console.error(
      "🔥 Error in getMahasiswaEnrolledWithPresensi:",
      error.message
    );
    res.status(500).json({ msg: "Terjadi kesalahan di server." });
  }
};
