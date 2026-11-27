
import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { Readable } from "stream";

import Resource from "../models/Resource.js";
import StudyPassage from "../models/StudyPassage.js";
import { indexPdf } from "../services/studyIndex.js";
import { facultyAuth } from "../middleware/facultyAuth.js";

const router = express.Router();

const allowedBranches = [
  "FIRST YEAR",
  "CSE",
  "AIML",
  "ECE",
  "MECHANICAL",
  "CIVIL",
];

const allowedResourceTypes = [
  "Notes",
  "Model QP",
  "PYQ",
  "Other",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

function validObjectId(id) {
  return mongoose.isValidObjectId(id);
}

// ==================================================
// GET: List resources
// Public access
// Search using subjectCode and category-specific fields
// ==================================================


router.get("/", async (req, res) => {
  try {
    const {
      scheme,
      branch,
      semester,
      subjectCode,
      resourceType,
      module,
      questionPaperYear,
    } = req.query;

    if (!allowedResourceTypes.includes(resourceType)) {
      return res.status(400).json({
        message: "Invalid resource type.",
      });
    }

    const filter = { resourceType };

    // NOTES: Existing subject-code + module retrieval
    if (resourceType === "Notes") {
      if (!subjectCode) {
        return res.status(400).json({
          message: "Subject code is required.",
        });
      }

      const normalizedCode = subjectCode.trim().toUpperCase();
      const moduleNumber = Number(module);

      if (!normalizedCode) {
        return res.status(400).json({
          message: "Invalid subject code.",
        });
      }

      if (
        !Number.isInteger(moduleNumber) ||
        moduleNumber < 1 ||
        moduleNumber > 5
      ) {
        return res.status(400).json({
          message: "A valid module number is required.",
        });
      }

      filter.subjectCode = normalizedCode;
      filter.module = moduleNumber;
    }

    // MODEL QP and PYQ: Scheme + Branch + Semester
    else if (
      resourceType === "Model QP" ||
      resourceType === "PYQ"
    ) {
      if (!scheme || !branch || !semester) {
        return res.status(400).json({
          message: "Scheme, branch and semester are required.",
        });
      }

      if (!["2022", "2025"].includes(scheme)) {
        return res.status(400).json({
          message: "Invalid scheme.",
        });
      }

      const normalizedBranch = branch.trim().toUpperCase();

      if (!allowedBranches.includes(normalizedBranch)) {
        return res.status(400).json({
          message: "Invalid branch.",
        });
      }

      const semesterNumber = Number(semester);

      if (
        !Number.isInteger(semesterNumber) ||
        semesterNumber < 1 ||
        semesterNumber > 8
      ) {
        return res.status(400).json({
          message: "Invalid semester.",
        });
      }

      filter.scheme = scheme;
      filter.branch = normalizedBranch;
      filter.semester = semesterNumber;

      // Optional subject-code filter
      if (subjectCode) {
        filter.subjectCode = subjectCode.trim().toUpperCase();
      }

      // Optional year filter for PYQ
      if (resourceType === "PYQ" && questionPaperYear) {
        const year = Number(questionPaperYear);

        if (!Number.isInteger(year) || year < 2000) {
          return res.status(400).json({
            message: "Invalid question paper year.",
          });
        }

        filter.questionPaperYear = year;
      }
    }

    // OTHER: Existing subject-code-based retrieval
    else if (resourceType === "Other") {
      if (!subjectCode) {
        return res.status(400).json({
          message: "Subject code is required.",
        });
      }

      filter.subjectCode = subjectCode.trim().toUpperCase();
    }

    const resources = await Resource.find(filter)
      .select("-fileId")
      .sort({ uploadedAt: -1 })
      .lean();

    return res.json({ resources });
  } catch (error) {
    console.error("List resources error:", error);

    return res.status(500).json({
      message: "Could not load resources.",
    });
  }
});


// ==================================================
// POST: Upload PDF
// Faculty authentication required
// Branch comes from verified JWT
// ==================================================

router.post(
  "/upload",
  facultyAuth,
  upload.single("pdf"),
  async (req, res) => {
    let uploadedFileId;

    try {
      const {
        scheme,
        semester,
        subject,
        subjectCode,
        module,
        resourceType,
        questionPaperYear,
      } = req.body;

      // Never trust branch sent by frontend.
      const branch = req.faculty.branch
        .trim()
        .toUpperCase();

      if (!allowedBranches.includes(branch)) {
        return res.status(403).json({
          message: "Invalid faculty branch.",
        });
      }

      if (
        !req.file ||
        !scheme ||
        !semester ||
        !subject ||
        !subjectCode ||
        !resourceType
      ) {
        return res.status(400).json({
          message: "PDF and all required academic fields are required.",
        });
      }

      if (!["2022", "2025"].includes(scheme)) {
        return res.status(400).json({
          message: "Invalid scheme.",
        });
      }

      if (!allowedResourceTypes.includes(resourceType)) {
        return res.status(400).json({
          message: "Invalid resource type.",
        });
      }

      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({
          message: "Only PDF files are allowed.",
        });
      }

      const semesterNumber = Number(semester);

      if (
        !Number.isInteger(semesterNumber) ||
        semesterNumber < 1 ||
        semesterNumber > 8
      ) {
        return res.status(400).json({
          message: "Invalid semester.",
        });
      }

      const normalizedSubject = subject.trim();
      const normalizedCode = subjectCode.trim().toUpperCase();

      if (!normalizedSubject || !normalizedCode) {
        return res.status(400).json({
          message: "Subject name and subject code are required.",
        });
      }

      let moduleNumber;
      let paperYear;

      // Notes require a module.
      if (resourceType === "Notes") {
        moduleNumber = Number(module);

        if (
          !Number.isInteger(moduleNumber) ||
          moduleNumber < 1 ||
          moduleNumber > 5
        ) {
          return res.status(400).json({
            message: "Select a valid module for Notes.",
          });
        }
      }

      // PYQ requires a question paper year.
      if (resourceType === "PYQ") {
        paperYear = Number(questionPaperYear);

        if (
          !Number.isInteger(paperYear) ||
          paperYear < 2000
        ) {
          return res.status(400).json({
            message: "Enter a valid question paper year.",
          });
        }
      }

      const bucket = req.app.locals.gridFSBucket;

      if (!bucket) {
        return res.status(503).json({
          message: "File storage is not ready.",
        });
      }

      const safeName = req.file.originalname
        .replace(/[\\/]/g, "_")
        .slice(0, 180);

      const fileId = new mongoose.Types.ObjectId();

      uploadedFileId = fileId;

      const fileMetadata = {
        scheme,
        branch,
        semester: semesterNumber,
        subject: normalizedSubject,
        subjectCode: normalizedCode,
        resourceType,
      };

      if (resourceType === "Notes") {
        fileMetadata.module = moduleNumber;
      }

      if (resourceType === "PYQ") {
        fileMetadata.questionPaperYear = paperYear;
      }

      // Store PDF in MongoDB GridFS.
      const stream = bucket.openUploadStream(safeName, {
        id: fileId,
        contentType: "application/pdf",
        metadata: fileMetadata,
      });

      await new Promise((resolve, reject) => {
        stream.on("error", reject);
        stream.on("finish", resolve);

        Readable.from([req.file.buffer]).pipe(stream);
      });

      // Store resource details in MongoDB.
      const resource = await Resource.create({
        ...fileMetadata,
        ...(moduleNumber !== undefined && {
          module: moduleNumber,
        }),
        ...(paperYear !== undefined && {
          questionPaperYear: paperYear,
        }),
        originalName: safeName,
        fileId,
        fileSize: req.file.size,
      });

      let indexing = "not-needed";
      if (resourceType === "Notes") {
        try {
          const result = await indexPdf(resource, req.file.buffer);
          indexing = result.indexed ? "ready" : "no-text";
        } catch (error) {
          console.error("Note indexing failed:", error.message);
          indexing = "failed";
        }
      }

      return res.status(201).json({
        message: indexing === "ready"
          ? "PDF uploaded and indexed for the Study Assistant."
          : indexing === "no-text"
            ? "PDF uploaded, but no selectable text was found for the Study Assistant. Scanned PDFs need OCR."
            : indexing === "failed"
              ? "PDF uploaded, but indexing failed. Check the backend logs and run the notes reindex command."
              : "PDF uploaded successfully.",
        indexing,
        resource: {
          _id: resource._id,
          subjectCode: resource.subjectCode,
          originalName: resource.originalName,
          resourceType: resource.resourceType,
          module: resource.module,
          questionPaperYear: resource.questionPaperYear,
        },
      });
    } catch (error) {
      // Remove GridFS file if metadata creation fails.
      if (
        uploadedFileId &&
        req.app.locals.gridFSBucket
      ) {
        try {
          await req.app.locals.gridFSBucket.delete(
            uploadedFileId
          );
        } catch {
          // File may not have completed uploading.
        }
      }

      console.error("Upload resource error:", error);

      return res.status(500).json({
        message: "PDF upload failed.",
      });
    }
  }
);

// ==================================================
// DELETE: Delete resource
// Faculty can delete only their own branch resources
// ==================================================

router.delete(
  "/:id",
  facultyAuth,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!validObjectId(id)) {
        return res.status(400).json({
          message: "Invalid resource ID.",
        });
      }

      const resource = await Resource.findById(id);

      if (!resource) {
        return res.status(404).json({
          message: "Resource not found.",
        });
      }

      const facultyBranch = req.faculty.branch
        .trim()
        .toUpperCase();

      if (
        resource.branch.trim().toUpperCase() !==
        facultyBranch
      ) {
        return res.status(403).json({
          message:
            "You cannot delete resources belonging to another branch.",
        });
      }

      const bucket = req.app.locals.gridFSBucket;

      if (!bucket) {
        return res.status(503).json({
          message: "File storage is not ready.",
        });
      }

      await bucket.delete(resource.fileId);
      await StudyPassage.deleteMany({ resourceId: resource._id });
      await Resource.findByIdAndDelete(id);

      return res.json({
        message: "Resource deleted successfully.",
      });
    } catch (error) {
      console.error("Delete resource error:", error);

      return res.status(500).json({
        message: "Could not delete resource.",
      });
    }
  }
);

// ==================================================
// Shared handler for viewing and downloading PDFs
// Public access
// ==================================================

async function sendPDF(req, res, disposition) {
  try {
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid resource ID.",
      });
    }

    const resource = await Resource.findById(
      req.params.id
    );

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found.",
      });
    }

    const bucket = req.app.locals.gridFSBucket;

    if (!bucket) {
      return res.status(503).json({
        message: "File storage is not ready.",
      });
    }

    const file = await bucket
      .find({ _id: resource.fileId })
      .next();

    if (!file) {
      return res.status(404).json({
        message: "PDF file not found.",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("X-Content-Type-Options", "nosniff");

    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="resource.pdf"`
    );

    const stream = bucket.openDownloadStream(
      resource.fileId
    );

    stream.on("error", (error) => {
      console.error("PDF stream error:", error);

      if (!res.headersSent) {
        res.status(500).end("Unable to stream PDF.");
      } else {
        res.destroy(error);
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error("Read PDF error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Unable to read PDF.",
      });
    }
  }
}

// View PDF
router.get("/:id/view", (req, res) =>
  sendPDF(req, res, "inline")
);

// Download PDF
router.get("/:id/download", (req, res) =>
  sendPDF(req, res, "attachment")
);

export default router;
