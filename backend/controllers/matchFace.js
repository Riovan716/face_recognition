import axios from "axios";
import Presensi from "../models/PresensiModel.js";
import Mahasiswa from "../models/MahasiswaModel.js";
import Users from "../models/UserModel.js";
import { Op } from "sequelize";

export const matchFace = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "Gambar tidak ditemukan" });

  const base64Image = req.file.buffer.toString("base64");
  const { kelasUuid } = req.body; // Ambil kelasUuid dari body request

  try {
    const response = await axios.post("http://localhost:5001/recognize", {
      image: base64Image,
    });

    if (response.data.match) {
      const nim = response.data.nim;
      
      try {
        // Cari data mahasiswa berdasarkan NIM
        const mahasiswa = await Mahasiswa.findOne({ 
          where: { nim: nim },
          include: [
            {
              model: Users,
              as: "user",
              attributes: ["uuid", "name"]
            }
          ]
        });

        if (!mahasiswa) {
          return res.status(404).json({ 
            success: false, 
            msg: "Data mahasiswa tidak ditemukan" 
          });
        }

        // Cek apakah sudah ada presensi hari ini untuk kelas tertentu
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const whereCondition = {
          userId: mahasiswa.id,
          waktu: {
            [Op.between]: [startOfDay, endOfDay]
          }
        };

        // Jika ada kelasUuid, tambahkan ke kondisi
        if (kelasUuid) {
          whereCondition.kelasUuid = kelasUuid;
        }

        const existingPresensi = await Presensi.findOne({
          where: whereCondition
        });

        if (existingPresensi) {
          return res.json({ 
            success: true, 
            nim: nim,
            msg: "Presensi sudah pernah dilakukan hari ini",
            alreadyPresent: true
          });
        }

        // Simpan presensi ke database
        const presensiData = {
          userId: mahasiswa.id,
          waktu: new Date(),
          status: "hadir"
        };

        // Tambahkan kelasUuid jika ada
        if (kelasUuid) {
          presensiData.kelasUuid = kelasUuid;
        }

        const newPresensi = await Presensi.create(presensiData);

        console.log(`✅ Presensi berhasil disimpan untuk NIM: ${nim}, Kelas: ${kelasUuid || 'Umum'}`);
        
        return res.json({ 
          success: true, 
          nim: nim,
          msg: "Presensi berhasil dicatat",
          presensiId: newPresensi.uuid,
          kelasUuid: kelasUuid || null
        });

      } catch (dbError) {
        console.error("❌ Error menyimpan presensi ke database:", dbError);
        return res.status(500).json({ 
          success: false, 
          msg: "Gagal menyimpan presensi ke database" 
        });
      }
    } else {
      return res
        .status(404)
        .json({ success: false, msg: "Wajah tidak dikenali" });
    }
  } catch (error) {
    console.error("❌ Error dalam matchFace:", error);
    return res.status(500).json({ msg: "Gagal memproses wajah" });
  }
};
