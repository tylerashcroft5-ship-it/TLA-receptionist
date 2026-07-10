// Vercel serverless function: GET /api/health — quick liveness + client count.

import { loadAllClients } from "../src/client.js";

export default function handler(_req, res) {
  res.status(200).json({ ok: true, clients: loadAllClients().length });
}
