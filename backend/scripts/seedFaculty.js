import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

import Faculty from "../models/Faculty.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const branches = [
  {
  branch: "FIRST YEAR",
  password: process.env.FIRST_YEAR_FACULTY_PASSWORD,
},
  {
    branch: "CSE",
    password: process.env.CSE_FACULTY_PASSWORD,
  },
  {
    branch: "AIML",
    password: process.env.AIML_FACULTY_PASSWORD,
  },
  {
    branch: "ECE",
    password: process.env.ECE_FACULTY_PASSWORD,
  },
  {
    branch: "MECHANICAL",
    password: process.env.MECHANICAL_FACULTY_PASSWORD,
  },
  {
    branch: "CIVIL",
    password: process.env.CIVIL_FACULTY_PASSWORD,
  },
];

async function seedFaculty() {
  try {
    await mongoose.connect(process.env.MONGODB);

    console.log("MongoDB connected");

    for (const item of branches) {
      if (!item.password) {
        throw new Error(
          `Password missing for ${item.branch}`
        );
      }

      const passwordHash = await bcrypt.hash(
        item.password,
        12
      );

      await Faculty.updateOne(
        { branch: item.branch },
        {
          $setOnInsert: {
            branch: item.branch,
            passwordHash,
          },
        },
        { upsert: true }
      );

      console.log(`${item.branch} faculty configured`);
    }

    console.log("Faculty setup completed");
  } catch (error) {
    console.error("Faculty setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedFaculty();
