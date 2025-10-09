import express from "express";
import { createUnknownFace } from "../controllers/UnknownFace.js";
const router = express.Router();

router.post("/unknownface", createUnknownFace);

export default router;
