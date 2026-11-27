# AI Study Assistant setup

## Local development

1. In `backend/.env`, add your private `OPENROUTER_API_KEY` from OpenRouter and set `OPENROUTER_MODEL=openrouter/free`. Keep the key in the backend only; do not add it to a `VITE_` variable or commit `.env`.
2. From `backend`, install packages with `npm install`, then run `npm run dev`.
3. From `frontend`, run `npm run dev` and open `/study-assistant`.
4. Newly uploaded PDFs with resource type `Notes` are indexed as part of upload. For existing GridFS PDFs, run `npm run reindex:notes` from `backend` once.

The index is stored in MongoDB's `studypassages` collection. Each record contains one short passage plus the source resource ID, course, module, and PDF page. The original PDF remains in the existing `resourceFiles` GridFS bucket.

## Render and Atlas later

Keep the same database variable and point `MONGODB` to the Atlas connection string when ready. In Render, add `OPENROUTER_API_KEY` and `OPENROUTER_MODEL=openrouter/free` as backend environment variables. Keep the API key private, and keep `VITE_API_URL` on the Vercel frontend pointed at the Render API. Re-deploy the backend after changing Render variables.

If old PDFs are already in Atlas, run the reindex script against the Atlas `MONGODB` value from a trusted machine, or run it as a one-off job using the Render service's environment variables.

## Current retrieval behavior

The first version filters passages by scheme, branch, semester, and subject code, then ranks them by question keyword overlap. The AI receives only the highest-scoring passages and must answer from those excerpts. It returns source labels that the backend maps to real PDF resources and page numbers. Scanned PDFs without selectable text need OCR before they can be indexed; semantic embeddings can be added as a later retrieval upgrade.
