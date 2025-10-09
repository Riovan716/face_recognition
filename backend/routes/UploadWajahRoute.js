import express from "express";
import { uploadWajah } from "../controllers/UploadWajah.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-wajah", upload.single("image"), uploadWajah);

export default router;
