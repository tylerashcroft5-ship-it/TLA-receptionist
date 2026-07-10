// Vercel serverless function: POST /api/tools/:name
// Handles a Vapi tool call (book_appointment / take_message / transfer_call).
import { secretOk, handleToolCall } from "../../src/webhook-core.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  if (!secretOk(req.headers["x-vapi-secret"])) return res.status(401).json({ error: "bad secret" });

  const name = req.query.name;
  try {
    const { status, body } = await handleToolCall(name, req.body?.message);
    res.status(status).json(body);
  } catch (err) {
    console.error(`[tool ${name}] error`, err);
    res.status(500).json({ error: "tool failed" });
  }
}
