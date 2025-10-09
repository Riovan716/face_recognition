import express from "express";
import multer from "multer";
import {
  updateMahasiswa,
  getDeskriptorByMatakuliah,
} from "../controllers/Mahasiswa.js";
import path from "path";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.patch("/mahasiswa/:id", upload.single("image"), updateMahasiswa);
router.get("/mahasiswa/deskriptor/:matakuliahUuid", getDeskriptorByMatakuliah);
router.use(
  "/face_recognition/dataset",
  express.static(path.join(process.cwd(), "face_recognition/dataset"))
);

export default router;
