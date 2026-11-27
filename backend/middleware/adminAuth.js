import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Admin authentication required." });
  }
  try {
    const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    if (decoded.role !== "admin" || !decoded.email) {
      return res.status(403).json({ message: "Admin access required." });
    }
    req.admin = { email: decoded.email, role: decoded.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired admin session." });
  }
};
