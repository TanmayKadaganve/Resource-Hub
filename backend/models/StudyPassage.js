import mongoose from "mongoose";

const studyPassageSchema = new mongoose.Schema(
  {
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    scheme: { type: String, required: true, index: true },
    branch: { type: String, required: true, index: true },
    semester: { type: Number, required: true, index: true },
    subject: { type: String, required: true },
    subjectCode: { type: String, required: true, index: true },
    module: { type: Number },
    resourceName: { type: String, required: true },
    page: { type: Number, required: true },
    passage: { type: String, required: true },
  },
  { timestamps: true }
);

studyPassageSchema.index({ scheme: 1, branch: 1, semester: 1, subjectCode: 1 });

export default mongoose.models.StudyPassage || mongoose.model("StudyPassage", studyPassageSchema);
