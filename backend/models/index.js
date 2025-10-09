import Users from "./UserModel.js";
import Mahasiswa from "./MahasiswaModel.js";
import Dosen from "./DosenModel.js"; // kalau kamu pakai juga
import Kelas from "./KelasModel.js";
import Matakuliah from "./MataKuliahModel.js";
import Enrollment from "./EnrollmentModel.js";
import Presensi from "./PresensiModel.js";
import UnknownFace from "./UnknownFaceModel.js";

// === DEFINISI RELASI ANTAR MODEL ===

// 1. User <-> Mahasiswa (One-to-One)
Users.hasOne(Mahasiswa, { foreignKey: "userId", as: "mahasiswa" });
Mahasiswa.belongsTo(Users, { foreignKey: "userId", as: "user" });

// 2. User <-> Dosen (One-to-One)
Users.hasOne(Dosen, { foreignKey: "userId", as: "dosen" });
Dosen.belongsTo(Users, { foreignKey: "userId", as: "user" });

// 3. Matakuliah <-> Kelas (One-to-Many)
Matakuliah.hasMany(Kelas, {
  foreignKey: "matakuliahUuid",
  sourceKey: "uuid",
  as: "kelas",
});
Kelas.belongsTo(Matakuliah, {
  foreignKey: "matakuliahUuid",
  targetKey: "uuid",
  as: "matakuliah",
});

// 4. User (Dosen) <-> Kelas (One-to-Many)
//    Seorang Dosen (User) bisa memiliki banyak Kelas
Users.hasMany(Kelas, {
  foreignKey: "userId",
  sourceKey: "id",
  as: "kelasDosen",
});
Kelas.belongsTo(Users, {
  foreignKey: "userId",
  targetKey: "id",
  as: "dosen",
});

// 5. User (Mahasiswa) & Matakuliah <-> Enrollment (Many-to-Many)
Users.belongsToMany(Matakuliah, { through: Enrollment, foreignKey: "userId" });
Matakuliah.belongsToMany(Users, {
  through: Enrollment,
  foreignKey: "matakuliahId",
});

Enrollment.belongsTo(Users, { foreignKey: "userId", as: "user" });
Users.hasMany(Enrollment, { foreignKey: "userId" });

// Enrollment belongs to Matakuliah
Enrollment.belongsTo(Matakuliah, { foreignKey: "matakuliahId" });
Matakuliah.hasMany(Enrollment, { foreignKey: "matakuliahId" });

// 6. Kelas & Mahasiswa <-> Presensi (Many-to-Many, with custom attributes)
Mahasiswa.belongsToMany(Kelas, {
  through: Presensi,
  foreignKey: "userId",
  otherKey: "kelasUuid",
});
Kelas.belongsToMany(Mahasiswa, {
  through: Presensi,
  foreignKey: "kelasUuid",
  otherKey: "userId",
});

// --- Hubungan Langsung (jika diperlukan selain many-to-many) ---

// Presensi -> Mahasiswa
Presensi.belongsTo(Mahasiswa, { foreignKey: "userId", targetKey: "id" });
Mahasiswa.hasMany(Presensi, {
  foreignKey: "userId",
  sourceKey: "id",
  as: "presensis",
});

// Presensi -> Kelas
Presensi.belongsTo(Kelas, { foreignKey: "kelasUuid", targetKey: "uuid" });
Kelas.hasMany(Presensi, { foreignKey: "kelasUuid", sourceKey: "uuid" });

// --- Ekspor Model ---
export { Users, Mahasiswa, Dosen, Matakuliah, Kelas, Enrollment, Presensi, UnknownFace };
