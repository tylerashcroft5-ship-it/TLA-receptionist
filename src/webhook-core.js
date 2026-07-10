// Shared webhook logic used by BOTH the local Express server (src/server.js)
// and the Vercel serverless functions (api/*). Keeping it here means the two
// deployment targets run identical code — no drift.

import { loadClientById, loadClientByNumber, loadAllClients } from "./client.js";
import { TOOL_HANDLERS } from "./tools/handlers.js";

export function secretOk(headerValue) {
  const secret = process.env.VAPI_WEBHOOK_SECRET || "";
  return Boolean(secret) && headerValue === secret;
}

// Work out which client a webhook message is about:
//   metadata.clientId → dialled number → first client (dev fallback).
export function resolveClient(msg) {
  const clientId = msg?.call?.metadata?.clientId || msg?.assistant?.metadata?.clientId;
  if (clientId) {
    try {
      return loadClientById(clientId);
    } catch {
      /* fall through */
    }
  }
  const dialled = msg?.call?.phoneNumber?.number || msg?.phoneNumber?.number;
  if (dialled) return loadClientByNumber(dialled);
  return loadAllClients()[0];
}

// Run a tool call. Returns the Vapi-shaped { results: [...] } payload.
export async function handleToolCall(toolName, msg) {
  const handler = TOOL_HANDLERS[toolName];
  if (!handler) return { status: 404, body: { error: `unknown tool ${toolName}` } };

  const client = resolveClient(msg);
  const toolCalls = msg?.toolCalls || [];
  const results = [];
  for (const call of toolCalls) {
    const args =
      typeof call.function?.arguments === "string"
        ? JSON.parse(call.function.arguments || "{}")
        : call.function?.arguments || {};
    const out = await handler(args, client);
    results.push({
      toolCallId: call.id,
      result: out.result,
      ...(out.destination ? { destination: out.destination } : {}),
    });
  }
  return { status: 200, body: { results } };
}

// Handle a server event (end-of-call report, status update).
export function handleEvent(msg) {
  const client = resolveClient(msg);
  const type = msg?.type;
  if (type === "end-of-call-report") {
    console.log(`[end-of-call-report] ${client?.businessName || "?"}`, {
      endedReason: msg.endedReason,
      durationSeconds: msg.durationSeconds,
      cost: msg.cost,
      summary: msg.analysis?.summary,
    });
    // TODO: persist + email client.ownerEmail a call summary.
  } else if (type === "status-update") {
    console.log(`[status-update] ${client?.businessName || "?"}`, msg.status);
  }
  return { status: 200, body: { received: true } };
}
