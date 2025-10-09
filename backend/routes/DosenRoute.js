import express from "express";
import { getAllDosen, updateDosen } from "../controllers/Dosen.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/dosen", verifyUser, getAllDosen);
router.patch("/dosen/:id", updateDosen);

export default router;
