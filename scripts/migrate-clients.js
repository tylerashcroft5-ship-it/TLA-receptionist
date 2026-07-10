// One-time migration: read clients/*.json and upsert them into the database
// (clients + deployments rows). Safe to re-run — upserts by slug.
//
//   node scripts/migrate-clients.js
//
// After this, the receptionist reads clients from the DB; the JSON files stay
// as a reference/backup but are no longer the source of truth.

import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { db } from "../src/db.js";

const CLIENTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "clients");
const supabase = db();

// receptionist tool id
const { data: tool, error: toolErr } = await supabase
  .from("tools").select("id").eq("slug", "receptionist").single();
if (toolErr) throw toolErr;

const files = readdirSync(CLIENTS_DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
const assistantId = process.env.VAPI_ASSISTANT_ID || null;

for (const file of files) {
  const raw = JSON.parse(readFileSync(join(CLIENTS_DIR, file), "utf8"));

  // upsert client
  const { data: client, error: cErr } = await supabase
    .from("clients")
    .upsert(
      {
        slug: raw.clientId,
        business_name: raw.businessName,
        industry: raw.industry,
        contact_email: raw.ownerEmail || null,
        contact_phone: raw.ownerPhone || null,
        status: "active",
      },
      { onConflict: "slug" }
    )
    .select("id, slug")
    .single();
  if (cErr) throw cErr;

  // deployment config = everything the receptionist needs (minus identity)
  const config = {
    hours: raw.hours,
    timezone: raw.timezone,
    services: raw.services || [],
    faqs: raw.faqs || [],
    capabilities: raw.capabilities || {},
    transferNumber: raw.transferNumber || "",
    bookingUrl: raw.bookingUrl || "",
    voiceId: raw.voiceId || "",
    overrides: raw.overrides || {},
  };

  const { error: dErr } = await supabase.from("deployments").upsert(
    {
      client_id: client.id,
      tool_id: tool.id,
      config,
      // only the plumbing client currently has a provisioned assistant
      vapi_assistant_id: raw.clientId === "example-plumbing" ? assistantId : null,
      phone_numbers: raw.phoneNumbers || [],
      status: "active",
    },
    { onConflict: "client_id,tool_id" }
  );
  if (dErr) throw dErr;

  console.log(`migrated ${client.slug} (${raw.industry})`);
}

console.log(`\nDone — ${files.length} client(s) migrated to the database.`);
