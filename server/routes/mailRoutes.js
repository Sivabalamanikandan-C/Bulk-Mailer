import express from "express";
import { sendMail, verifyMailSetup, scheduleCampaign, retryCampaign, deleteCampaign } from "../controllers/mailcontroller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Mail endpoints
router.post("/sendmail", authMiddleware, sendMail);
router.post("/schedule", authMiddleware, scheduleCampaign);
router.patch("/:id/retry", authMiddleware, retryCampaign);
router.delete("/:id", authMiddleware, deleteCampaign);

export default router;
