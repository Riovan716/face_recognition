// routes/MataKuliahRoute.js
import express from "express";
import {
  getAllMataKuliah,
  createMataKuliah,
  createMataKuliahByAdmin,
  updateMataKuliah,
  deleteMataKuliah,
  getMatakuliahByUuid,
  verifyMatkulPassword,
} from "../controllers/MataKuliah.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/matakuliah", verifyUser, getAllMataKuliah);
router.post("/matakuliah", createMataKuliah);
router.post("/matakuliah/admin", verifyUser, createMataKuliahByAdmin);
router.patch("/matakuliah/:id", updateMataKuliah);
router.delete("/matakuliah/:id", deleteMataKuliah);
router.get("/matakuliah/:uuid", getMatakuliahByUuid);
router.post("/matakuliah/verify-password", verifyMatkulPassword);

export default router;
