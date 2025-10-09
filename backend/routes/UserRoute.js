import express from "express";
import multer from "multer";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  verifyPassword,
  createUserWithRole,
  importUsersFromExcel,
} from "../controllers/Users.js";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";

const upload = multer();
const router = express.Router();

router.get("/users", verifyUser, adminOnly, getUsers);
router.get("/users/:id", verifyUser, adminOnly, getUserById);
router.post("/register", createUser);
router.patch("/users/:id", verifyUser, upload.single("file"), updateUser);
router.delete("/users/:id", verifyUser, adminOnly, deleteUser);
router.post("/verify-password", verifyPassword);
router.post("/users", upload.single("file"), createUserWithRole);
router.post("/users/import-excel", verifyUser, adminOnly, upload.single("file"), importUsersFromExcel);
export default router;
