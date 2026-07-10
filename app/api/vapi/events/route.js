// POST /api/vapi/events — server events from Vapi (end-of-call report, etc).

import { NextResponse } from "next/server";
import { secretOk, handleEvent } from "../../../../src/webhook-core.js";

export async function POST(request) {
  if (!secretOk(request.headers.get("x-vapi-secret"))) {
    return NextResponse.json({ error: "bad secret" }, { status: 401 });
  }

  const body = await request.json();
  const { status, body: respBody } = await handleEvent(body?.message);
  return NextResponse.json(respBody, { status });
}
