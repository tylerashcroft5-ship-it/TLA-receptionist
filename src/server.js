// Local dev webhook server (multi-tenant). Thin Express wrapper over the
// shared logic in webhook-core.js — the SAME code the Vercel functions run.
// Use this for local testing via a tunnel; Vercel (api/*) is production.

import "dotenv/config";
import express from "express";
import { loadAllClients } from "./client.js";
import { secretOk, handleToolCall, handleEvent } from "./webhook-core.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

function verify(req, res, next) {
  if (!process.env.VAPI_WEBHOOK_SECRET) return res.status(500).json({ error: "server misconfigured" });
  if (!secretOk(req.get("x-vapi-secret"))) return res.status(401).json({ error: "bad secret" });
  next();
}

app.get("/health", (_req, res) => res.json({ ok: true, clients: loadAllClients().length }));

app.post("/tools/:name", verify, async (req, res) => {
  try {
    const { status, body } = await handleToolCall(req.params.name, req.body?.message);
    res.status(status).json(body);
  } catch (err) {
    console.error(`[tool ${req.params.name}] error`, err);
    res.status(500).json({ error: "tool failed" });
  }
});

app.post("/vapi/events", verify, (req, res) => {
  const { status, body } = handleEvent(req.body?.message);
  res.status(status).json(body);
});

const port = process.env.PORT || 3100;
app.listen(port, () => {
  const clients = loadAllClients();
  console.log(`TLA Receptionist webhook (local) on :${port}`);
  console.log(`Serving ${clients.length} client(s): ${clients.map((c) => c.businessName).join(", ")}`);
});
