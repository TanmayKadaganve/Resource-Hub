
import express from "express";
import mongoose from "mongoose";

import LabResource from "../models/LabResource.js";
import AdminActivity from "../models/AdminActivity.js";
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

// GET: Public access - list lab resources by branch
router.get("/", async (req, res) => {
  try {
    const branch = req.query.branch?.trim().toUpperCase();

    if (!branch || !allowedBranches.includes(branch)) {
      return res.status(400).json({
        message: "A valid branch is required.",
      });
    }

    const resources = await LabResource.find({ branch })
      .sort({ semester: 1, subject: 1 })
      .lean();

    return res.json({ resources });
  } catch (error) {
    console.error("Get lab resources error:", error);

    return res.status(500).json({
      message: "Could not load lab resources.",
    });
  }
});

// POST: Faculty adds a Google Drive link
router.post("/", facultyAuth, async (req, res) => {
  try {
    const {
      branch,
      semester,
      subjectCode,
      subject,
      googleDriveLink,
    } = req.body;

    const normalizedBranch = branch?.trim().toUpperCase();
    const facultyBranch = req.faculty.branch.trim().toUpperCase();

    if (!allowedBranches.includes(normalizedBranch)) {
      return res.status(400).json({
        message: "Invalid branch.",
      });
    }

    if (normalizedBranch !== facultyBranch) {
      return res.status(403).json({
        message: "You can only add lab resources for your own branch.",
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

    if (
      !subjectCode?.trim() ||
      !subject?.trim() ||
      !googleDriveLink?.trim()
    ) {
      return res.status(400).json({
        message: "All lab resource fields are required.",
      });
    }

    let parsedLink;

    try {
      parsedLink = new URL(googleDriveLink.trim());
    } catch {
      return res.status(400).json({
        message: "Enter a valid Google Drive link.",
      });
    }

    if (
      parsedLink.protocol !== "https:" ||
      !["drive.google.com", "docs.google.com"].includes(
        parsedLink.hostname
      )
    ) {
      return res.status(400).json({
        message: "Only Google Drive links are allowed.",
      });
    }

    const resource = await LabResource.create({
      branch: normalizedBranch,
      semester: semesterNumber,
      subjectCode: subjectCode.trim().toUpperCase(),
      subject: subject.trim(),
      googleDriveLink: parsedLink.toString(),
    });
    AdminActivity.create({ actorRole: "faculty", actor: facultyBranch, action: "upload", itemType: "lab resource", itemId: String(resource._id), description: `Added lab link: ${resource.subject} (${facultyBranch})` }).catch((error) => console.error("Activity log error:", error.message));

    return res.status(201).json({
      message: "Lab resource added successfully.",
      resource,
    });
  } catch (error) {
    console.error("Add lab resource error:", error);

    return res.status(500).json({
      message: "Could not add lab resource.",
    });
  }
});

// DELETE: Faculty can delete only their branch's lab resources
router.delete("/:id", facultyAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid lab resource ID.",
      });
    }

    const facultyBranch = req.faculty.branch.trim().toUpperCase();

    const resource = await LabResource.findOne({
      _id: id,
      branch: facultyBranch,
    });

    if (!resource) {
      return res.status(404).json({
        message: "Lab resource not found in your branch.",
      });
    }

    await LabResource.findByIdAndDelete(id);
    AdminActivity.create({ actorRole: "faculty", actor: facultyBranch, action: "delete", itemType: "lab resource", itemId: String(resource._id), description: `Deleted lab link: ${resource.subject} (${facultyBranch})` }).catch((error) => console.error("Activity log error:", error.message));

    return res.json({
      message: "Lab resource deleted successfully.",
    });
  } catch (error) {
    console.error("Delete lab resource error:", error);

    return res.status(500).json({
      message: "Could not delete lab resource.",
    });
  }
});

export default router;
