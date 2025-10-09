import express from "express";
import {
  createKelas,
  getKelasByMatakuliah,
  deleteKelas,
} from "../controllers/Kelas.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.post("/kelas", verifyUser, createKelas);
router.get(
  "/kelas/by-matakuliah/:matakuliahUuid",
  verifyUser,
  getKelasByMatakuliah
);
router.delete("/kelas/:uuid", verifyUser, deleteKelas);

export default router;
