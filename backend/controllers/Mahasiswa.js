import fs from "fs";
import path from "path";
import * as faceapi from 'face-api.js';
import canvas from "canvas";
import Mahasiswa from "../models/MahasiswaModel.js";
import Users from "../models/UserModel.js";
import MataKuliah from "../models/MataKuliahModel.js";
import Enrollment from "../models/EnrollmentModel.js";

// Set environment untuk memaksa TensorFlow.js menggunakan CPU backend
process.env.TF_CPP_MIN_LOG_LEVEL = '2';
process.env.TF_FORCE_GPU_ALLOW_GROWTH = 'true';
process.env.TF_CPP_VLOG_LEVEL = '0';

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Cache untuk model face-api agar tidak di-load berulang
let modelsLoaded = false;
let modelsLoading = false;

const loadModels = async () => {
  if (modelsLoaded) return;
  if (modelsLoading) {
    // Tunggu sampai model selesai di-load
    while (modelsLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }
  
  modelsLoading = true;
  
  try {
    console.log("🔄 Loading face-api models...");
    const modelPath = path.join(process.cwd(), "models");
    
    // Cek apakah model files ada
    const requiredModels = [
      'ssd_mobilenetv1_model-weights_manifest.json',
      'face_landmark_68_model-weights_manifest.json',
      'face_recognition_model-weights_manifest.json'
    ];
    
    for (const model of requiredModels) {
      const modelFile = path.join(modelPath, model);
      if (!fs.existsSync(modelFile)) {
        throw new Error(`Model file tidak ditemukan: ${model}`);
      }
    }
    
    // Load models dengan timeout dan error handling yang lebih baik
    const loadWithTimeout = async (loadFn, modelName, timeout = 30000) => {
      return Promise.race([
        loadFn,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout loading ${modelName}`)), timeout)
        )
      ]);
    };
    
    // Load models satu per satu dengan timeout
    try {
      await loadWithTimeout(faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath), 'SSD MobileNet');
      console.log("✅ SSD MobileNet model loaded");
    } catch (error) {
      console.error("❌ Error loading SSD MobileNet:", error.message);
      throw error;
    }
    
    try {
      await loadWithTimeout(faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath), 'Face Landmark');
      console.log("✅ Face Landmark model loaded");
    } catch (error) {
      console.error("❌ Error loading Face Landmark:", error.message);
      throw error;
    }
    
    try {
      await loadWithTimeout(faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath), 'Face Recognition');
      console.log("✅ Face Recognition model loaded");
    } catch (error) {
      console.error("❌ Error loading Face Recognition:", error.message);
      throw error;
    }
    
    modelsLoaded = true;
    console.log("✅ All face-api models loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load face-api models:", error);
    modelsLoading = false;
    throw new Error(`Gagal memuat model face recognition: ${error.message}`);
  } finally {
    modelsLoading = false;
  }
};

export const updateMahasiswa = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { uuid: req.params.id } });
    if (!user || user.role !== "Mahasiswa") {
      return res.status(404).json({ msg: "User mahasiswa tidak ditemukan" });
    }

    const existing = await Mahasiswa.findOne({ where: { userId: user.id } });
    let faceImagePath = existing?.faceImagePath || null;
    let deskriptorWajah = existing?.deskriptorWajah || null;

    // ==== 1. Jika ada file diupload ====
    if (req.file) {
      try {
        // Pastikan directory dataset ada
        const datasetDir = path.join(process.cwd(), "face_recognition", "dataset");
        if (!fs.existsSync(datasetDir)) {
          fs.mkdirSync(datasetDir, { recursive: true });
        }

        const filename = `${req.body.nim}.jpg`;
        const filePath = path.join(datasetDir, filename);
        
        // Simpan file
        fs.writeFileSync(filePath, req.file.buffer);
        console.log("✅ File berhasil disimpan:", filePath);

        // Update path untuk database (samakan dengan admin)
        faceImagePath = `/face_recognition/dataset/${filename}`;

        // Coba load model face-api dengan fallback
        try {
          await loadModels();
          
          // Proses face detection dengan error handling yang lebih baik
          const img = await canvas.loadImage(filePath);
          console.log("🔄 Processing face detection...");
          
          // Coba deteksi wajah dengan API standar (sama seperti alur admin)
          // Hindari opsi custom yang menyebabkan error tipe options
          const detectionPromise = faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
          
          const detection = await Promise.race([
            detectionPromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Face detection timeout")), 30000)
            )
          ]);

          if (detection?.descriptor?.length === 128) {
            // Simpan sebagai array (konsisten dengan alur admin)
            deskriptorWajah = Array.from(detection.descriptor);
            console.log("✅ Deskriptor berhasil dibuat dari file");
          } else {
            console.warn("⚠️ Tidak ditemukan wajah dalam file atau wajah tidak jelas");
            // Hapus file jika tidak ada wajah yang terdeteksi
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            return res.status(400).json({ 
              msg: "Tidak dapat mendeteksi wajah dalam gambar. Pastikan wajah terlihat jelas dan tidak blur." 
            });
          }
        } catch (faceError) {
          console.error("❌ Error saat face detection:", faceError);
          // Jika face detection gagal, simpan foto tanpa deskriptor
          console.log("⚠️ Face detection gagal, menyimpan foto tanpa deskriptor");
          deskriptorWajah = null;
        }
      } catch (error) {
        console.error("❌ Error saat memproses gambar:", error);
        return res.status(500).json({ 
          msg: "Gagal memproses gambar. Pastikan format gambar valid (JPG/PNG) dan ukuran tidak terlalu besar." 
        });
      }
    }

    // ==== 2. Jika deskriptor dikirim langsung dari frontend ====
    if (req.body.deskriptorWajah && !req.file) {
      try {
        const parsed = Array.isArray(req.body.deskriptorWajah)
          ? req.body.deskriptorWajah
          : JSON.parse(req.body.deskriptorWajah);
        
        if (parsed.length === 128) {
          // Simpan sebagai array, bukan string
          deskriptorWajah = parsed;
          console.log("✅ Deskriptor diterima dari kamera dan disimpan");
        } else {
          console.warn("⚠️ Deskriptor tidak valid (harus 128 elemen)");
          return res.status(400).json({ msg: "Deskriptor wajah tidak valid" });
        }
      } catch (err) {
        console.error("❌ Parsing deskriptor gagal:", err);
        return res.status(400).json({ msg: "Format deskriptor wajah tidak valid" });
      }
    }

    const dataMahasiswa = {
      userId: user.id,
      nim: req.body.nim,
      jurusan: req.body.jurusan,
      ipk: req.body.ipk,
      tempatTinggal: req.body.tempatTinggal,
      faceImagePath,
      deskriptorWajah,
    };

    if (!existing) {
      await Mahasiswa.create(dataMahasiswa);
      console.log("✅ Data mahasiswa baru berhasil dibuat");
    } else {
      await Mahasiswa.update(dataMahasiswa, { where: { userId: user.id } });
      console.log("✅ Data mahasiswa berhasil diperbarui");
    }

    res.status(200).json({ 
      msg: "Data mahasiswa berhasil diperbarui",
      faceImagePath,
      hasFaceDescriptor: !!deskriptorWajah
    });
  } catch (error) {
    console.error("❌ Gagal update mahasiswa:", error);
    res.status(500).json({ 
      msg: "Terjadi kesalahan server",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
export const getDeskriptorByMatakuliah = async (req, res) => {
  try {
    const matakuliahUuid = req.params.matakuliahUuid;
    console.log("📥 UUID diterima untuk get deskriptor:", matakuliahUuid);
    const matkul = await MataKuliah.findOne({
      where: { uuid: matakuliahUuid },
    });
    if (!matkul)
      return res.status(404).json({ msg: "Matakuliah tidak ditemukan" });

    const enrollments = await Enrollment.findAll({
      where: { matakuliahId: matkul.id },
    });
    const userIds = enrollments.map((e) => e.userId);
    if (userIds.length === 0) return res.status(200).json([]);

    // Ambil mahasiswa beserta user (nama)
    const mahasiswaList = await Mahasiswa.findAll({
      where: { userId: userIds },
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["name"],
        },
      ],
    });
    const datasetPath = path.join(process.cwd(), "face_recognition", "dataset");

    // Load models menggunakan cache
    await loadModels();

    const deskriptorData = [];

    for (const m of mahasiswaList) {
      const filePath = path.join(datasetPath, `${m.nim}.jpg`);
      if (!fs.existsSync(filePath)) {
        console.warn(`\u26A0\uFE0F File tidak ditemukan: ${filePath}`);
        continue;
      }

      try {
        const img = await canvas.loadImage(filePath);
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection?.descriptor?.length === 128) {
          deskriptorData.push({
            nim: m.nim,
            nama: m.user ? m.user.name : null,
            descriptor: Array.from(detection.descriptor),
          });
        } else {
          console.warn(`\u26A0\uFE0F Descriptor tidak valid untuk ${m.nim}`);
        }
      } catch (imgErr) {
        console.error(
          `\u274C Gagal proses gambar untuk ${m.nim}:`,
          imgErr.message
        );
      }
    }

    return res.status(200).json(deskriptorData);
  } catch (error) {
    console.error(
      "\u274C Error fatal getDeskriptorByMatakuliah:",
      error.message
    );
    return res.status(500).json({ msg: "Internal server error" });
  }
};
