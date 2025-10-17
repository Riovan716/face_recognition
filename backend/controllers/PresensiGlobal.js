import PresensiGlobal from "../models/PresensiGlobalModel.js";
import Mahasiswa from "../models/MahasiswaModel.js"; // asumsikan model ini ada
import { Users } from "../models/index.js";
import { Op } from "sequelize";

// GET /mahasiswa/deskriptor/all
export const getAllDeskriptorMahasiswa = async (req, res) => {
  try {
    const mahasiswaList = await Mahasiswa.findAll({
      where: {
        deskriptorWajah: {
          [Op.ne]: null,
        },
      },
      attributes: ["nim", "deskriptorWajah"],
    });

    const data = mahasiswaList.map((m) => ({
      nim: m.nim,
      descriptor: JSON.parse(m.deskriptorWajah),
    }));

    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Gagal ambil deskriptor all:", err.message);
    return res.status(500).json({ msg: "Server error" });
  }
};

// POST /presensiglobal
export const createPresensiGlobal = async (req, res) => {
  const { nims } = req.body;

  if (!Array.isArray(nims) || nims.length === 0)
    return res.status(400).json({ msg: "NIM tidak valid" });

  try {
    const mahasiswaList = await Mahasiswa.findAll({
      where: { nim: nims },
    });

    const insertData = mahasiswaList.map((m) => ({
      nim: m.nim,
      nama: m.nama || null,
      waktu: new Date(),
      status: "hadir",
    }));

    await PresensiGlobal.bulkCreate(insertData);

    return res.status(201).json({
      msg: "Presensi global dicatat",
      total: insertData.length,
      data: insertData,
    });
  } catch (err) {
    console.error("❌ Gagal simpan presensi global:", err.message);
    return res.status(500).json({ msg: "Server error" });
  }
};

// GET /presensiglobal
export const getPresensiGlobal = async (req, res) => {
  try {
    const data = await PresensiGlobal.findAll({
      order: [["waktu", "DESC"]],
    });
    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Gagal mengambil data presensi global" });
  }
};

export const getGlobalDeskriptor = async (req, res) => {
  try {
    const mahasiswaList = await Mahasiswa.findAll({
      where: { deskriptorWajah: { [Op.ne]: null } },
      attributes: ["nim", "deskriptorWajah"],
      include: [{ model: Users, as: "user", attributes: ["name"] }],
    });

    const data = mahasiswaList.map((m) => {
      let descriptor = null;
      try {
        console.log(
          "📦 NIM:", m.nim,
          "| Type:", typeof m.deskriptorWajah,
          "| Value:", m.deskriptorWajah
        );

        let raw = m.deskriptorWajah;
        if (Buffer.isBuffer(raw)) raw = raw.toString("utf8");
        else if (typeof raw === "object") raw = JSON.stringify(raw);
        else raw = String(raw);

        raw = raw.trim();

        // coba parse
        const arr = eval(raw);
        if (Array.isArray(arr)) descriptor = Array.from(arr);
      } catch (err) {
        console.warn(`⚠️ Gagal parse deskriptor NIM ${m.nim}:`, err.message);
      }

      return {
        nim: m.nim,
        nama: m.user?.name || null,
        descriptor,
      };
    });

    const validData = data.filter((d) => d.descriptor && d.descriptor.length > 0);
    console.log("✅ Total deskriptor valid:", validData.length);

    res.status(200).json(validData);
  } catch (err) {
    console.error("🔥 Gagal ambil deskriptor global:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


