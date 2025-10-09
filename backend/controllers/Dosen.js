import Dosen from "../models/DosenModel.js";
import Users from "../models/UserModel.js";

export const getAllDosen = async (req, res) => {
  try {
    const dosenList = await Users.findAll({
      where: { role: "dosen" },
      attributes: ["id", "name"],
      include: [{ model: Dosen, as: "dosen", attributes: ["nip"] }],
      order: [["name", "ASC"]],
    });
    // Format agar nip diangkat ke level atas
    const result = dosenList.map(d => ({
      id: d.id,
      name: d.name,
      nip: d.dosen?.nip || "",
    }));
    res.status(200).json(result);
  } catch (error) {
    console.error("Gagal mengambil data dosen:", error);
    res.status(500).json({ msg: "Terjadi kesalahan server", error: error.message });
  }
};

export const updateDosen = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { uuid: req.params.id } });
    if (!user || user.role !== "dosen") {
      return res.status(404).json({ msg: "User dosen tidak ditemukan" });
    }

    const existing = await Dosen.findOne({ where: { userId: user.id } });

    if (!existing) {
      await Dosen.create({
        userId: user.id,
        nip: req.body.nip,
        jurusan: req.body.jurusan,
      });
    } else {
      await Dosen.update(
        {
          nip: req.body.nip,
          jurusan: req.body.jurusan,
        },
        {
          where: { userId: user.id },
        }
      );
    }

    return res.status(200).json({ msg: "Data dosen berhasil diperbarui" });
  } catch (error) {
    console.error("Gagal update dosen:", error);
    return res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};
