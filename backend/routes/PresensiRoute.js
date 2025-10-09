import express from "express";
import multer from "multer";
import { matchFace } from "../controllers/matchFace.js";
import {
  presensiOtomatis,
  createPresensiOtomatis,
  getPresensiByKelas,
  getStatusPresensiMahasiswa,
} from "../controllers/PresensiController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/api/presensi", upload.single("image"), matchFace);
router.post("/presensi/otomatis/:kelasUuid", presensiOtomatis);
router.post("/createpresensi/otomatis/:kelasUuid", createPresensiOtomatis);
router.get("/presensi/by-kelas/:kelasUuid", getPresensiByKelas);
router.get("/presensi/status-mahasiswa", getStatusPresensiMahasiswa);

export default router;
