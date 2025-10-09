import UnknownFace from "../models/UnknownFaceModel.js";
import { Op } from "sequelize";

// Fungsi untuk cek kemiripan descriptor (Euclidean distance)
function isSimilarDescriptor(desc1, desc2, threshold = 0.6) {
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += (desc1[i] - desc2[i]) ** 2;
  }
  return Math.sqrt(sum) < threshold;
}

// POST /unknownface
export const createUnknownFace = async (req, res) => {
  const { photo, descriptor, sessionId } = req.body;
  console.log("POST /unknownface => photo:", !!photo, "descriptor:", Array.isArray(descriptor) ? descriptor.length : typeof descriptor, "sessionId:", sessionId);
  if (!photo || !descriptor || !sessionId) {
    return res.status(400).json({
      msg: "Data tidak lengkap",
      debug: {
        photo: !!photo,
        descriptor: Array.isArray(descriptor) ? descriptor.length : typeof descriptor,
        sessionId: sessionId
      }
    });
  }

  // Cek duplikat descriptor di database untuk sessionId yang sama
  const allUnknowns = await UnknownFace.findAll({
    where: { sessionId },
    attributes: ["descriptor"],
  });

  const isDuplicate = allUnknowns.some((uf) =>
    isSimilarDescriptor(JSON.parse(uf.descriptor), descriptor)
  );

  if (isDuplicate) {
    return res.status(200).json({ msg: "Wajah sudah pernah disimpan di sesi ini" });
  }

  const newUnknown = await UnknownFace.create({
    photo,
    descriptor: JSON.stringify(descriptor),
    waktu: new Date(),
    sessionId,
  });

  return res.status(201).json(newUnknown);
};

export const getAllUnknownFaces = async (req, res) => {
    const data = await UnknownFace.findAll({ order: [["waktu", "DESC"]] });
    res.json(data);
  };

export const clearAllUnknownFaces = async (req, res) => {
  try {
    await UnknownFace.destroy({ where: {} });
    res.json({ msg: "Semua data wajah tidak dikenali berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ msg: "Gagal menghapus data: " + err.message });
  }
};