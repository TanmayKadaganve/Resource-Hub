import express from "express";
import Notice from "../models/Notice.js";
import AcademicLink from "../models/AcademicLink.js";

const router = express.Router();

router.get("/notices", async (_req, res) => {
  try {
    const now = new Date();
    const notices = await Notice.find({ published: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] })
      .sort({ createdAt: -1 }).lean();
    res.json({ notices });
  } catch (error) {
    console.error("Public notices error:", error.message);
    res.status(500).json({ message: "Could not load notices." });
  }
});

router.get("/links", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.branch) filter.branch = { $in: [String(req.query.branch).toUpperCase(), "ALL"] };
    if (req.query.scheme) filter.scheme = { $in: [String(req.query.scheme), "ALL"] };
    const links = await AcademicLink.find(filter).sort({ category: 1, title: 1 }).lean();
    res.json({ links });
  } catch (error) {
    console.error("Academic links error:", error.message);
    res.status(500).json({ message: "Could not load academic links." });
  }
});

export default router;
