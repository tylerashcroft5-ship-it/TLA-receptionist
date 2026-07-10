// Loads per-client configs from clients/*.json and merges them with their
// industry playbook. This is the heart of the multi-tenant system: an inbound
// call is routed to a client by the number that was dialled; a browser/test
// call is selected by clientId.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getPlaybook } from "./industry-playbooks.js";

// Resolve the clients/ dir in a way that works both locally and on Vercel.
// Local: relative to this module (src/../clients). Vercel: bundled at the
// project root via vercel.json includeFiles, so process.cwd()/clients.
function resolveClientsDir() {
  const candidates = [
    join(process.cwd(), "clients"),
    join(dirname(fileURLToPath(import.meta.url)), "..", "clients"),
  ];
  return candidates.find((p) => existsSync(p)) || candidates[0];
}

const CLIENTS_DIR = resolveClientsDir();

// Read + merge one raw JSON config with its industry playbook.
function hydrate(raw) {
  const playbook = getPlaybook(raw.industry);
  const o = raw.overrides || {};
  return {
    clientId: raw.clientId,
    businessName: raw.businessName,
    industry: raw.industry,
    industryLabel: playbook.label,
    phoneNumbers: raw.phoneNumbers || [],
    hours: raw.hours || "Mon-Fri 9am-5pm",
    timezone: raw.timezone || "Europe/London",
    services: raw.services?.length ? raw.services : playbook.defaultServices,
    faqs: raw.faqs || [],
    capabilities: {
      canBook: true,
      canTransfer: true,
      canMessage: true,
      ...(raw.capabilities || {}),
    },
    transferNumber: raw.transferNumber || "",
    bookingUrl: raw.bookingUrl || "",
    ownerEmail: raw.ownerEmail || "",
    ownerPhone: raw.ownerPhone || "",
    voiceId: raw.voiceId || process.env.ELEVENLABS_VOICE_ID || "",
    // Behaviour: playbook defaults, overridable per client.
    greeting: o.greeting || "",
    emergencyPolicy: o.emergencyPolicy || playbook.emergencyPolicy,
    collectFields: o.collectFields?.length ? o.collectFields : playbook.collectFields,
    rules: [...(playbook.rules || []), ...(o.extraRules || [])],
  };
}

function readConfig(file) {
  return hydrate(JSON.parse(readFileSync(join(CLIENTS_DIR, file), "utf8")));
}

// Load every client (skips the _template).
export function loadAllClients() {
  return readdirSync(CLIENTS_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map(readConfig);
}

export function loadClientById(clientId) {
  const match = loadAllClients().find((c) => c.clientId === clientId);
  if (!match) throw new Error(`No client config for clientId "${clientId}"`);
  return match;
}

// Route an inbound call to a client by the number that was dialled.
export function loadClientByNumber(dialledNumber) {
  const clients = loadAllClients();
  const match = clients.find((c) => c.phoneNumbers.includes(dialledNumber));
  // Fall back to the first client if the number isn't mapped (dev convenience).
  return match || clients[0];
}
