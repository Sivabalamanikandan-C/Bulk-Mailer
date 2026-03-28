import express from "express";
import Campaign from "../models/Campaign.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/sent", authMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign
      .find({ 
        user: req.user._id,
        status: { $nin: ['scheduled', 'failed'] }
      })
      .sort({ sentAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sent campaigns" });
  }
});

router.get("/scheduled", authMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign
      .find({ 
        user: req.user._id,
        status: 'scheduled' 
      })
      .sort({ scheduledAt: 1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: "Error fetching scheduled campaigns" });
  }
});

export default router;