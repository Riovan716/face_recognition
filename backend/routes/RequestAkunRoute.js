import express from "express";
import {
  getAllRequests,
  approveRequest,
  rejectRequest,
} from "../controllers/RequestAkun.js";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/request-akun", verifyUser, adminOnly, getAllRequests);
router.post("/request-akun/approve/:id", verifyUser, adminOnly, approveRequest);
router.delete("/request-akun/reject/:id", verifyUser, adminOnly, rejectRequest);

export default router;
