import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const router = express.Router();
const attempts = new Map();

function tooManyAttempts(ip) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((timestamp) => now - timestamp < 15 * 60_000);
  attempts.set(ip, recent);
  return recent.length >= 8;
}

router.post("/login", async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (tooManyAttempts(ip)) return res.status(429).json({ message: "Too many login attempts. Try again in 15 minutes." });
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      const recent = attempts.get(ip) || [];
      recent.push(Date.now());
      attempts.set(ip, recent);
      return res.status(401).json({ message: "Invalid email or password." });
    }
    attempts.delete(ip);
    const token = jwt.sign({ email: admin.email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "8h" });
    return res.json({ token, email: admin.email, role: "admin" });
  } catch (error) {
    console.error("Admin login error:", error.message);
    return res.status(500).json({ message: "Could not log in." });
  }
});

export default router;
