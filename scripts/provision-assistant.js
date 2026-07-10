// Provision (create or update) a Vapi assistant for ONE client.
//
//   npm run provision -- <clientId>          # create for that client
//   npm run provision -- <clientId> <vapiAssistantId>   # update existing
//
// Prints the assistant id. Store it (e.g. in the client JSON or a map) so you
// can update it later and attach a phone number to it.

import "dotenv/config";
import { loadClientById } from "../src/client.js";
import { buildAssistantConfig } from "../src/assistant-config.js";

const [clientId, existingId] = process.argv.slice(2);
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL;
const SECRET = process.env.VAPI_WEBHOOK_SECRET;

if (!clientId) {
  console.error("Usage: npm run provision -- <clientId> [vapiAssistantId]");
  process.exit(1);
}
if (!VAPI_API_KEY || !PUBLIC_BASE_URL || !SECRET) {
  console.error("Missing VAPI_API_KEY, PUBLIC_BASE_URL or VAPI_WEBHOOK_SECRET in .env");
  process.exit(1);
}

const client = loadClientById(clientId);
if (!client.voiceId) {
  console.error("No voiceId for this client and no ELEVENLABS_VOICE_ID fallback set.");
  process.exit(1);
}

const config = buildAssistantConfig({
  client,
  publicBaseUrl: PUBLIC_BASE_URL,
  webhookSecret: SECRET,
});

const url = existingId
  ? `https://api.vapi.ai/assistant/${existingId}`
  : "https://api.vapi.ai/assistant";

const res = await fetch(url, {
  method: existingId ? "PATCH" : "POST",
  headers: { Authorization: `Bearer ${VAPI_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify(config),
});
const body = await res.json();
if (!res.ok) {
  console.error("Vapi error", res.status, body);
  process.exit(1);
}

console.log(`${existingId ? "Updated" : "Created"} assistant for ${client.businessName}: ${body.id}`);
console.log(`Tools enabled: ${config.model.tools.map((t) => t.function.name).join(", ") || "(none)"}`);
