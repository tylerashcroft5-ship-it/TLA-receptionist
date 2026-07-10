// POST /api/tools/:name — Vapi tool calls (book_appointment / take_message /
// transfer_call). Same shared logic as before (webhook-core.js), now served
// by a Next.js Route Handler instead of a standalone Vercel function — the
// URL is identical, so the existing Vapi assistant needs no changes.

import { NextResponse } from "next/server";
import { secretOk, handleToolCall } from "../../../../src/webhook-core.js";

export async function POST(request, { params }) {
  if (!secretOk(request.headers.get("x-vapi-secret"))) {
    return NextResponse.json({ error: "bad secret" }, { status: 401 });
  }

  const { name } = await params;
  try {
    const body = await request.json();
    const { status, body: respBody } = await handleToolCall(name, body?.message);
    return NextResponse.json(respBody, { status });
  } catch (err) {
    console.error(`[tool ${name}] error`, err);
    return NextResponse.json({ error: "tool failed" }, { status: 500 });
  }
}
