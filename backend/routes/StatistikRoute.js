import express from "express";
import {
  getStatistikUsers,
  getDosenDashboardData,
  getMahasiswaDashboardData,
} from "../controllers/Statistik.js";

const router = express.Router();

router.get("/statistik/users", getStatistikUsers);
router.get("/dashboard/dosen", getDosenDashboardData);
router.get("/dashboard/mahasiswa", getMahasiswaDashboardData);

export default router;
