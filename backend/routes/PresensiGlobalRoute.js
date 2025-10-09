import express from "express";
import {
  getAllDeskriptorMahasiswa,
  createPresensiGlobal,
  getPresensiGlobal,
  getGlobalDeskriptor,
} from "../controllers/PresensiGlobal.js";

const router = express.Router();

router.post("/presensiglobal", createPresensiGlobal);
router.get("/presensiglobal", getPresensiGlobal);
router.get("/presensiglobal/deskriptor", getGlobalDeskriptor);
export default router;
