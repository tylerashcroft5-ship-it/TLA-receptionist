// GET /api/health — liveness + client/db status.

import { NextResponse } from "next/server";
import { loadAllClients } from "../../../src/client.js";
import { dbEnabled } from "../../../src/db.js";

export async function GET() {
  return NextResponse.json({
    ok: true,
    clients: loadAllClients().length,
    db: dbEnabled(),
  });
}
