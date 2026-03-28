import express from "express";
import {
  register,
  login,
  verifyToken,
  // forgotPassword,
  // resetPassword
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", protect, verifyToken);
// Reset password route
// router.post("/reset-password", resetPassword);

export default router;
