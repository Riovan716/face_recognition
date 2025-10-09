import axios from "axios";

export const matchFace = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "Gambar tidak ditemukan" });

  const base64Image = req.file.buffer.toString("base64");

  try {
    const response = await axios.post("http://localhost:5001/recognize", {
      image: base64Image,
    });

    if (response.data.match) {
      // TODO: tandai kehadiran di DB (pakai NIM)
      return res.json({ success: true, nim: response.data.nim });
    } else {
      return res
        .status(404)
        .json({ success: false, msg: "Wajah tidak dikenali" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Gagal memproses wajah" });
  }
};
