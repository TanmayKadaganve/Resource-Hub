import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

dotenv.config();

async function main() {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in backend/.env.");
  }
  if (!process.env.MONGODB) throw new Error("MONGODB environment variable is required.");
  await mongoose.connect(process.env.MONGODB);
  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.updateOne({ email }, { $set: { passwordHash } }, { upsert: true });
  console.log(`Admin account configured for ${email}.`);
}

main().catch((error) => {
  console.error("Admin setup failed:", error.message);
  process.exitCode = 1;
}).finally(async () => {
  if (mongoose.connection.readyState) await mongoose.disconnect();
});
