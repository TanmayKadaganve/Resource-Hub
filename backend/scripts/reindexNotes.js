import dotenv from "dotenv";
import mongoose from "mongoose";
import Resource from "../models/Resource.js";
import { indexPdf } from "../services/studyIndex.js";

dotenv.config();

async function readGridFile(bucket, fileId) {
  const chunks = [];
  await new Promise((resolve, reject) => {
    const stream = bucket.openDownloadStream(fileId);
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return Buffer.concat(chunks);
}

async function main() {
  if (!process.env.MONGODB) throw new Error("MONGODB environment variable is required.");
  await mongoose.connect(process.env.MONGODB);
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "resourceFiles" });
  const notes = await Resource.find({ resourceType: "Notes" }).lean();
  let indexed = 0;
  let skipped = 0;

  for (const note of notes) {
    try {
      const buffer = await readGridFile(bucket, note.fileId);
      const result = await indexPdf(note, buffer);
      if (result.indexed) indexed += 1;
      else {
        skipped += 1;
        console.log(`No selectable text: ${note.originalName}`);
      }
    } catch (error) {
      skipped += 1;
      console.error(`Failed to index ${note.originalName}: ${error.message}`);
    }
  }

  console.log(`Finished indexing ${notes.length} Notes PDFs. Ready: ${indexed}; skipped/failed: ${skipped}.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Notes reindex failed:", error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
