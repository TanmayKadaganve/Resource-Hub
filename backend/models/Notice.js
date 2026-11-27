import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  body: { type: String, required: true, trim: true, maxlength: 5000 },
  category: { type: String, enum: ["Announcement", "Examination", "Academic"], default: "Announcement" },
  published: { type: Boolean, default: true, index: true },
  expiresAt: { type: Date, default: null },
  createdBy: { type: String, default: "admin" },
}, { timestamps: true });

export default mongoose.models.Notice || mongoose.model("Notice", noticeSchema);
