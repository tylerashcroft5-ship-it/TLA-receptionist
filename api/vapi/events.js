// Vercel serverless function: POST /api/vapi/events
// Server events from Vapi (end-of-call report, status updates).

import { secretOk, handleEvent } from "../../src/webhook-core.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  if (!secretOk(req.headers["x-vapi-secret"])) return res.status(401).json({ error: "bad secret" });

  const { status, body } = handleEvent(req.body?.message);
  return res.status(status).json(body);
}
