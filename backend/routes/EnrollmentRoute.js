import express from "express";
import {
  checkEnrollment,
  enrollMatkul,
  getMahasiswaEnrolledInMatkul,
  unenrollMatkul,
  getMatkulEnrolledByUser,
  getMahasiswaEnrolledWithPresensi,
} from "../controllers/Enrollment.js";

const router = express.Router();

router.get("/enrollments/check/:userUuid/:matakuliahId", checkEnrollment);
router.post("/enrollments", enrollMatkul);
router.get("/enrollments/matakuliah/:uuid", getMahasiswaEnrolledInMatkul);
router.delete("/enrollments", unenrollMatkul);
router.get("/enrollments/by-user/:userUuid", getMatkulEnrolledByUser);
router.get(
  "/enrollments/matakuliah/:uuid/with-presensi",
  getMahasiswaEnrolledWithPresensi
);

export default router;
