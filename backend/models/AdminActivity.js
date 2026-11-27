import mongoose from "mongoose";

const adminActivitySchema = new mongoose.Schema({
  actorRole: { type: String, enum: ["admin", "faculty"], required: true },
  actor: { type: String, default: "" },
  action: { type: String, required: true },
  itemType: { type: String, required: true },
  itemId: { type: String, default: "" },
  description: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.AdminActivity || mongoose.model("AdminActivity", adminActivitySchema);
