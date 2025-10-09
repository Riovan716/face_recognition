import fs from "fs";
import path from "path";

export const uploadWajah = (req, res) => {
  const { nim } = req.body;
  console.log("📥 Menerima request upload untuk NIM:", nim);
  console.log("📦 File diterima:", req.file?.originalname);

  if (!nim || !req.file) {
    console.warn("⚠️ NIM atau file tidak dikirim.");
    return res.status(400).json({ msg: "NIM dan gambar wajib diisi" });
  }

  const folderPath = path.join(process.cwd(), "face_recognition", "dataset");
  const filePath = path.join(folderPath, `${nim}.jpg`);

  // Buat folder jika belum ada
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log("📁 Folder dataset dibuat:", folderPath);
  }

  fs.writeFile(filePath, req.file.buffer, (err) => {
    if (err) {
      console.error("❌ Gagal menyimpan gambar:", err);
      return res.status(500).json({ msg: "Gagal menyimpan gambar" });
    }
    console.log("✅ Wajah berhasil disimpan di:", filePath);
    return res.status(200).json({ msg: "Wajah berhasil diupload" });
  });
};
