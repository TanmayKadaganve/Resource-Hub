import mongoose from "mongoose";

const academicLinkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  url: { type: String, required: true, trim: true },
  category: { type: String, enum: ["Syllabus", "Scheme", "Academic Calendar", "Other"], default: "Other" },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  branch: { type: String, trim: true, uppercase: true, default: "ALL" },
  scheme: { type: String, enum: ["2022", "2025", "ALL"], default: "ALL" },
}, { timestamps: true });

export default mongoose.models.AcademicLink || mongoose.model("AcademicLink", academicLinkSchema);
