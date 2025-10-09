import express from "express";
import { createUnknownFace, getAllUnknownFaces, clearAllUnknownFaces } from "../controllers/UnknownFace.js";
const router = express.Router();

router.post("/unknownface", createUnknownFace);
router.get("/unknownface", getAllUnknownFaces);
router.delete("/unknownface/all", clearAllUnknownFaces);

export default router;
