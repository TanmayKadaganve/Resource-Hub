import express from "express";
import StudyPassage from "../models/StudyPassage.js";

const router = express.Router();
const validSchemes = new Set(["2022", "2025"]);
const validBranches = new Set(["FIRST YEAR", "CSE", "AIML", "ECE", "MECHANICAL", "CIVIL"]);
const requestLog = new Map();
const STOP_WORDS = new Set("a an and are as at be but by can could did do does for from had has have how i in is it of on or please show that the their them this to was what when where which who why with explain using my".split(" "));

function limited(ip) {
  const now = Date.now();
  const recent = (requestLog.get(ip) || []).filter((time) => now - time < 60_000);
  if (recent.length >= 8) {
    requestLog.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

function tokens(text) {
  return [...new Set(text.toLowerCase().match(/[a-z0-9]{2,}/g) || [])]
    .filter((word) => !STOP_WORDS.has(word));
}

function scorePassage(passage, queryTokens) {
  const words = passage.toLowerCase().match(/[a-z0-9]{2,}/g) || [];
  if (!words.length) return 0;
  const counts = new Map();
  for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);
  let score = 0;
  for (const token of queryTokens) {
    const count = counts.get(token) || 0;
    if (count) score += 1 + Math.min(count - 1, 2) * 0.15;
  }
  return score / Math.sqrt(words.length);
}

router.post("/ask", async (req, res) => {
  try {
    if (limited(req.ip || req.socket.remoteAddress || "unknown")) {
      return res.status(429).json({ message: "Please wait a minute before asking another question." });
    }

    const scheme = String(req.body.scheme || "");
    const branch = String(req.body.branch || "").trim().toUpperCase();
    const semester = Number(req.body.semester);
    const subjectCode = String(req.body.subjectCode || "").trim().toUpperCase();
    const question = String(req.body.question || "").trim();

    if (!validSchemes.has(scheme) || !validBranches.has(branch) || !Number.isInteger(semester) || semester < 1 || semester > 8 || !subjectCode) {
      return res.status(400).json({ message: "Select a valid scheme, branch, semester, and subject." });
    }
    if (question.length < 4 || question.length > 1200) {
      return res.status(400).json({ message: "Enter a question between 4 and 1,200 characters." });
    }
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ message: "The Study Assistant is not configured yet. Add OPENROUTER_API_KEY to backend/.env and restart the backend." });
    }

    const queryTokens = tokens(question);
    const passages = await StudyPassage.find({ scheme, branch, semester, subjectCode }).lean();
    const matches = passages
      .map((item) => ({ ...item, score: scorePassage(item.passage, queryTokens) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7);

    if (!matches.length) {
      const existing = await StudyPassage.exists({ scheme, branch, semester, subjectCode });
      return res.status(404).json({
        message: existing
          ? "I could not find a matching passage in this subject’s indexed notes. Try a more specific term from the notes."
          : "There are no indexed note passages for this subject yet. Ask faculty to upload notes, or run the notes reindex command for existing PDFs.",
      });
    }

    const sources = matches.map((item, index) => ({
      label: `S${index + 1}`,
      resourceId: String(item.resourceId),
      resourceName: item.resourceName,
      subject: item.subject,
      subjectCode: item.subjectCode,
      page: item.page,
      passage: item.passage,
    }));
    const excerpts = sources.map((source) => `[${source.label}] ${source.resourceName}, page ${source.page}\n${source.passage}`).join("\n\n");

    const model = process.env.OPENROUTER_MODEL || "openrouter/free";
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "Resource Hub Study Assistant",
      },
      body: JSON.stringify({
        model,
        max_tokens: 900,
        messages: [
          {
            role: "system",
            content: "You are the Resource Hub AI Study Assistant. Answer using only the supplied college-note excerpts. Explain clearly in simple language, use steps or a small example when helpful. Cite factual claims with the exact source labels such as [S1]. If the excerpts do not contain enough information, say so clearly and do not fill gaps from general knowledge. Your answer is AI-generated and should be checked against the cited PDF.",
          },
          {
            role: "user",
            content: `Student question: ${question}\n\nRelevant excerpts:\n${excerpts}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(45_000),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("OpenRouter provider error:", response.status, data?.error?.message || "request failed");
      return res.status(502).json({ message: "The AI service could not answer right now. Please try again shortly." });
    }

    const answerContent = data.choices?.[0]?.message?.content;
    const answer = (Array.isArray(answerContent)
      ? answerContent.map((part) => part.text || "").join("\n")
      : answerContent || "").trim();
    if (!answer) return res.status(502).json({ message: "The AI service returned an empty answer. Please try again." });
    const citedLabels = new Set([...answer.matchAll(/\[(S\d+)\]/g)].map((match) => match[1]));
    const citedSources = sources.filter((source) => citedLabels.has(source.label));
    return res.json({
      answer,
      citations: citedSources.length ? citedSources : sources,
      aiGenerated: true,
    });
  } catch (error) {
    console.error("Study assistant error:", error.message);
    const status = error.name === "TimeoutError" ? 504 : 500;
    return res.status(status).json({ message: status === 504 ? "The AI response took too long. Please try again." : "Could not answer the question right now." });
  }
});

export default router;
