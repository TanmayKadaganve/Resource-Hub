import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import bcrypt from "bcryptjs";
import { Readable } from "stream";
import { adminAuth } from "../middleware/adminAuth.js";
import Resource from "../models/Resource.js";
import StudyPassage from "../models/StudyPassage.js";
import Faculty from "../models/Faculty.js";
import LabResource from "../models/LabResource.js";
import Notice from "../models/Notice.js";
import AcademicLink from "../models/AcademicLink.js";
import AdminActivity from "../models/AdminActivity.js";
import { indexPdf } from "../services/studyIndex.js";

const router = express.Router();
const branches = ["FIRST YEAR", "CSE", "AIML", "ECE", "MECHANICAL", "CIVIL"];
const resourceTypes = ["Notes", "Syllabus", "Model QP", "PYQ", "Other"];
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
router.use(adminAuth);

async function logActivity(req, action, itemType, itemId, description) {
  await AdminActivity.create({ actorRole: "admin", actor: req.admin.email, action, itemType, itemId: String(itemId || ""), description });
}

router.get("/overview", async (_req, res) => {
  try {
    const [resources, faculties, labs, notices, links, byType, byBranch, activities] = await Promise.all([
      Resource.countDocuments(), Faculty.countDocuments(), LabResource.countDocuments(),
      Notice.countDocuments(), AcademicLink.countDocuments(),
      Resource.aggregate([{ $group: { _id: "$resourceType", count: { $sum: 1 } } }]),
      Resource.aggregate([{ $group: { _id: "$branch", count: { $sum: 1 } } }]),
      AdminActivity.find().sort({ createdAt: -1 }).limit(8).lean(),
    ]);
    res.json({ stats: { resources, faculties, branches: branches.length, labs, notices, links }, byType, byBranch, activities });
  } catch (error) {
    console.error("Admin overview error:", error.message);
    res.status(500).json({ message: "Could not load dashboard overview." });
  }
});

router.get("/resources", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const filter = {};
    if (branches.includes(String(req.query.branch || "").toUpperCase())) filter.branch = String(req.query.branch).toUpperCase();
    if (resourceTypes.includes(req.query.resourceType)) filter.resourceType = req.query.resourceType;
    const search = String(req.query.search || "").trim();
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = ["subject", "subjectCode", "originalName"].map((field) => ({ [field]: { $regex: escaped, $options: "i" } }));
    }
    const [items, total] = await Promise.all([
      Resource.find(filter).select("-fileId").sort({ uploadedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Resource.countDocuments(filter),
    ]);
    res.json({ resources: items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Admin resource list error:", error.message);
    res.status(500).json({ message: "Could not load resources." });
  }
});

router.post("/resources/upload", upload.single("pdf"), async (req, res) => {
  let fileId;
  try {
    const { scheme, branch: rawBranch, semester, subject, subjectCode, module, resourceType, questionPaperYear } = req.body;
    const branch = String(rawBranch || "").trim().toUpperCase();
    const semesterNumber = Number(semester);
    const code = String(subjectCode || "").trim().toUpperCase();
    if (!req.file || !["2022", "2025"].includes(scheme) || !branches.includes(branch) || !Number.isInteger(semesterNumber) || semesterNumber < 1 || semesterNumber > 8 || !subject?.trim() || !code || !resourceTypes.includes(resourceType)) {
      return res.status(400).json({ message: "Select a PDF and enter valid scheme, branch, semester, subject, code, and resource type." });
    }
    if (req.file.mimetype !== "application/pdf") return res.status(400).json({ message: "Only PDF files are allowed." });
    let moduleNumber;
    let paperYear;
    if (resourceType === "Notes") {
      moduleNumber = Number(module);
      if (!Number.isInteger(moduleNumber) || moduleNumber < 1 || moduleNumber > 5) return res.status(400).json({ message: "Select a valid Notes module." });
    }
    if (resourceType === "PYQ") {
      paperYear = Number(questionPaperYear);
      if (!Number.isInteger(paperYear) || paperYear < 2000) return res.status(400).json({ message: "Enter a valid PYQ year." });
    }
    const bucket = req.app.locals.gridFSBucket;
    if (!bucket) return res.status(503).json({ message: "File storage is not ready." });
    const originalName = req.file.originalname.replace(/[\\/]/g, "_").slice(0, 180);
    fileId = new mongoose.Types.ObjectId();
    const stream = bucket.openUploadStream(originalName, {
      id: fileId,
      contentType: "application/pdf",
      metadata: { scheme, branch, semester: semesterNumber, subject: subject.trim(), subjectCode: code, resourceType, ...(moduleNumber && { module: moduleNumber }), ...(paperYear && { questionPaperYear: paperYear }) },
    });
    await new Promise((resolve, reject) => {
      stream.on("error", reject);
      stream.on("finish", resolve);
      Readable.from([req.file.buffer]).pipe(stream);
    });
    const resource = await Resource.create({ scheme, branch, semester: semesterNumber, subject: subject.trim(), subjectCode: code, resourceType, ...(moduleNumber && { module: moduleNumber }), ...(paperYear && { questionPaperYear: paperYear }), originalName, fileId, fileSize: req.file.size });
    let indexing = "not-needed";
    if (resourceType === "Notes") {
      try {
        const result = await indexPdf(resource, req.file.buffer);
        indexing = result.indexed ? "ready" : "no-text";
      } catch (error) {
        indexing = "failed";
        console.error("Admin note indexing failed:", error.message);
      }
    }
    await logActivity(req, "upload", "resource", resource._id, `Uploaded ${resourceType}: ${originalName} (${branch})`);
    res.status(201).json({ message: "Resource uploaded.", indexing, resource: { _id: resource._id, originalName } });
  } catch (error) {
    if (fileId && req.app.locals.gridFSBucket) await req.app.locals.gridFSBucket.delete(fileId).catch(() => {});
    console.error("Admin resource upload error:", error.message);
    res.status(500).json({ message: "Could not upload resource." });
  }
});

router.delete("/resources/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid resource ID." });
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found." });
    const bucket = req.app.locals.gridFSBucket;
    if (!bucket) return res.status(503).json({ message: "File storage is not ready." });
    await bucket.delete(resource.fileId);
    await Promise.all([StudyPassage.deleteMany({ resourceId: resource._id }), Resource.findByIdAndDelete(resource._id)]);
    await logActivity(req, "delete", "resource", resource._id, `Deleted ${resource.resourceType}: ${resource.originalName} (${resource.branch})`);
    res.json({ message: "Resource and its indexed passages deleted." });
  } catch (error) {
    console.error("Admin resource delete error:", error.message);
    res.status(500).json({ message: "Could not delete resource." });
  }
});

router.get("/faculties", async (_req, res) => {
  const faculties = await Faculty.find().select("branch createdAt updatedAt").sort({ branch: 1 }).lean();
  res.json({ faculties });
});

router.put("/faculties/:id/password", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid faculty account ID." });
    const password = String(req.body.password || "");
    if (password.length < 12) return res.status(400).json({ message: "Use a temporary password of at least 12 characters." });
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: "Faculty account not found." });
    faculty.passwordHash = await bcrypt.hash(password, 12);
    await faculty.save();
    await logActivity(req, "password reset", "faculty account", faculty._id, `Reset faculty password for ${faculty.branch}`);
    res.json({ message: `Password reset for ${faculty.branch}.` });
  } catch (error) {
    console.error("Faculty password reset error:", error.message);
    res.status(500).json({ message: "Could not reset faculty password." });
  }
});

router.get("/labs", async (_req, res) => {
  const labs = await LabResource.find().sort({ createdAt: -1 }).lean();
  res.json({ labs });
});

router.post("/labs", async (req, res) => {
  try {
    const branch = String(req.body.branch || "").trim().toUpperCase();
    const semester = Number(req.body.semester);
    const subjectCode = String(req.body.subjectCode || "").trim().toUpperCase();
    const subject = String(req.body.subject || "").trim();
    const parsedLink = new URL(String(req.body.googleDriveLink || ""));
    if (!branches.includes(branch) || !Number.isInteger(semester) || semester < 1 || semester > 8 || !subjectCode || !subject || parsedLink.protocol !== "https:" || !["drive.google.com", "docs.google.com"].includes(parsedLink.hostname)) {
      return res.status(400).json({ message: "Enter valid branch, semester, subject details, and Google Drive link." });
    }
    const lab = await LabResource.create({ branch, semester, subjectCode, subject, googleDriveLink: parsedLink.toString() });
    await logActivity(req, "upload", "lab resource", lab._id, `Added lab link: ${lab.subject} (${lab.branch})`);
    res.status(201).json({ lab });
  } catch (error) {
    res.status(400).json({ message: "Could not add lab resource. Check that the link is a valid Google Drive URL." });
  }
});

router.delete("/labs/:id", async (req, res) => {
  try {
    const item = await LabResource.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Lab resource not found." });
    await logActivity(req, "delete", "lab resource", item._id, `Deleted lab link: ${item.subject} (${item.branch})`);
    res.json({ message: "Lab resource deleted." });
  } catch (error) {
    res.status(400).json({ message: "Could not delete lab resource." });
  }
});

router.get("/activity", async (_req, res) => {
  const activities = await AdminActivity.find().sort({ createdAt: -1 }).limit(100).lean();
  res.json({ activities });
});

router.get("/notices", async (_req, res) => res.json({ notices: await Notice.find().sort({ createdAt: -1 }).lean() }));
router.post("/notices", async (req, res) => {
  try {
    const notice = await Notice.create({ ...req.body, createdBy: req.admin.email });
    await logActivity(req, "create", "notice", notice._id, `Published notice: ${notice.title}`);
    res.status(201).json({ notice });
  } catch (error) { res.status(400).json({ message: "Enter a valid title, message, and category." }); }
});
router.put("/notices/:id", async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!notice) return res.status(404).json({ message: "Notice not found." });
    await logActivity(req, "update", "notice", notice._id, `Updated notice: ${notice.title}`);
    res.json({ notice });
  } catch { res.status(400).json({ message: "Could not update notice." }); }
});
router.delete("/notices/:id", async (req, res) => {
  const notice = await Notice.findByIdAndDelete(req.params.id);
  if (!notice) return res.status(404).json({ message: "Notice not found." });
  await logActivity(req, "delete", "notice", notice._id, `Deleted notice: ${notice.title}`);
  res.json({ message: "Notice deleted." });
});

router.get("/academic-links", async (_req, res) => res.json({ links: await AcademicLink.find().sort({ category: 1, title: 1 }).lean() }));
router.post("/academic-links", async (req, res) => {
  try {
    const url = new URL(req.body.url);
    if (url.protocol !== "https:") return res.status(400).json({ message: "Only HTTPS links are allowed." });
    const link = await AcademicLink.create({ ...req.body, url: url.toString() });
    await logActivity(req, "create", "academic link", link._id, `Added academic link: ${link.title}`);
    res.status(201).json({ link });
  } catch { res.status(400).json({ message: "Enter a valid title and HTTPS URL." }); }
});
router.put("/academic-links/:id", async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.url && new URL(updates.url).protocol !== "https:") return res.status(400).json({ message: "Only HTTPS links are allowed." });
    const link = await AcademicLink.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!link) return res.status(404).json({ message: "Academic link not found." });
    await logActivity(req, "update", "academic link", link._id, `Updated academic link: ${link.title}`);
    res.json({ link });
  } catch { res.status(400).json({ message: "Could not update academic link." }); }
});
router.delete("/academic-links/:id", async (req, res) => {
  const link = await AcademicLink.findByIdAndDelete(req.params.id);
  if (!link) return res.status(404).json({ message: "Academic link not found." });
  await logActivity(req, "delete", "academic link", link._id, `Deleted academic link: ${link.title}`);
  res.json({ message: "Academic link deleted." });
});

export default router;
