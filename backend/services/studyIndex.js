import StudyPassage from "../models/StudyPassage.js";

const MAX_PASSAGE_LENGTH = 1400;
const PASSAGE_OVERLAP = 180;

function splitText(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const passages = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + MAX_PASSAGE_LENGTH, normalized.length);
    if (end < normalized.length) {
      const boundary = normalized.lastIndexOf(" ", end);
      if (boundary > start + MAX_PASSAGE_LENGTH * 0.65) end = boundary;
    }
    const passage = normalized.slice(start, end).trim();
    if (passage) passages.push(passage);
    if (end >= normalized.length) break;
    start = Math.max(end - PASSAGE_OVERLAP, start + 1);
  }
  return passages;
}

export async function indexPdf(resource, buffer) {
  if (resource.resourceType !== "Notes") {
    return { indexed: 0, reason: "Only Notes PDFs are indexed." };
  }

  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = getDocument({ data: new Uint8Array(buffer) });
  const pdf = await task.promise;
  const docs = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items.map((item) => item.str || "").join(" ");
      for (const passage of splitText(text)) {
        docs.push({
          resourceId: resource._id,
          scheme: resource.scheme,
          branch: resource.branch,
          semester: resource.semester,
          subject: resource.subject,
          subjectCode: resource.subjectCode,
          module: resource.module,
          resourceName: resource.originalName,
          page: pageNumber,
          passage,
        });
      }
    }
  } finally {
    await task.destroy();
  }

  await StudyPassage.deleteMany({ resourceId: resource._id });
  if (docs.length) await StudyPassage.insertMany(docs, { ordered: false });
  return {
    indexed: docs.length,
    pages: pdf.numPages,
    reason: docs.length ? undefined : "No selectable text was found; the PDF may be scanned.",
  };
}
