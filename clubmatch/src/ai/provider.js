// Which AI backend the app uses.
//
// 'demo'  — the local engine in ./engine.js. Deterministic, runs in the browser,
//           no API key, nothing leaves the device. This is what the hackathon demo ships with.
//
// To go live: add a small server route (e.g. POST /api/ai/profile) that calls a model
// through Replit AI Integrations, then swap the matching function below.
// Keep the same return shapes so the UI doesn't change. Recommended split:
//   - extractProfile      -> LLM with a JSON schema (major, year, skills, interests)
//   - clubVector          -> text embeddings of each club, cached server-side
//   - explainMatch        -> LLM, grounded only in the club's stored fields
//   - parseQuery          -> LLM that returns the same {tags, open, beginner} object
//   - draftClubProfile    -> LLM with a JSON schema; officer reviews before publishing
// Keep scrubPII and moderate running before any text is sent to a model.
export const AI_MODE = 'demo';
export const AI_LABEL = 'Local demo engine';
