import RequestAkun from "../models/RequestAkunModel.js";
import User from "../models/UserModel.js";

export const getAllRequests = async (req, res) => {
  try {
    const requests = await RequestAkun.findAll({
      attributes: ["uuid", "name", "email", "role"],
    });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const request = await RequestAkun.findOne({
      where: { uuid: req.params.id },
    });

    if (!request) return res.status(404).json({ msg: "Data tidak ditemukan" });

    // Cek apakah email sudah ada di User
    const existingUser = await User.findOne({
      where: { email: request.email },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "Akun dengan email ini sudah terdaftar" });
    }

    // Jika tidak ada, buat akun
    await User.create({
      name: request.name,
      email: request.email,
      password: request.password,
      role: request.role,
    });

    // Hapus request setelah approve
    await RequestAkun.destroy({ where: { id: request.id } });

    res.status(200).json({ msg: "Akun berhasil disetujui" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const request = await RequestAkun.findOne({
      where: { uuid: req.params.id },
    });
    if (!request) return res.status(404).json({ msg: "Data tidak ditemukan" });

    await RequestAkun.destroy({ where: { id: request.id } });
    res.status(200).json({ msg: "Akun berhasil ditolak" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
