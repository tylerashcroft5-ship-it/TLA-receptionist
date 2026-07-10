// Builds the Vapi assistant config for a specific client: Claude brain,
// ElevenLabs British voice, Deepgram ears, and only the tools that client is
// allowed to use. Sent to Vapi when provisioning (scripts/provision-assistant.js).

import { buildSystemPrompt } from "./prompts/receptionist.js";

// Tool definitions, keyed by capability. Only the ones a client has enabled
// get attached to their assistant.
function toolsFor(client, publicBaseUrl, webhookSecret) {
  const server = (path) => ({ url: `${publicBaseUrl}${path}`, secret: webhookSecret });
  const all = {
    canBook: {
      type: "function",
      function: {
        name: "book_appointment",
        description:
          "Book a call or appointment once you have their name, a contact number, and a preferred day/time.",
        parameters: {
          type: "object",
          properties: {
            caller_name: { type: "string" },
            caller_phone: { type: "string" },
            preferred_time: { type: "string", description: "Natural language, e.g. 'Thursday at 10am'" },
            reason: { type: "string", description: "What it's about" },
          },
          required: ["caller_name", "caller_phone", "preferred_time"],
        },
      },
      server: server("/tools/book_appointment"),
    },
    canMessage: {
      type: "function",
      function: {
        name: "take_message",
        description:
          "Take a message for a callback. Use out of hours or when you can't resolve it live.",
        parameters: {
          type: "object",
          properties: {
            caller_name: { type: "string" },
            caller_phone: { type: "string" },
            message: { type: "string" },
            urgency: { type: "string", enum: ["normal", "urgent"] },
          },
          required: ["caller_name", "caller_phone", "message"],
        },
      },
      server: server("/tools/take_message"),
    },
    canTransfer: {
      type: "function",
      function: {
        name: "transfer_call",
        description: "Transfer to a human when it's urgent or beyond what you can handle.",
        parameters: {
          type: "object",
          properties: { reason: { type: "string" } },
          required: ["reason"],
        },
      },
      server: server("/tools/transfer_call"),
    },
  };
  return Object.entries(all)
    .filter(([cap]) => client.capabilities[cap])
    .map(([, tool]) => tool);
}

export function buildAssistantConfig({ client, publicBaseUrl, webhookSecret }) {
  const timeGreeting = client.greeting || `Good afternoon, ${client.businessName}, how can I help?`;
  return {
    name: `TLA Receptionist — ${client.businessName}`,

    // ── The brain ─────────────────────────────────────────────
    model: {
      provider: "anthropic",
      model: "claude-haiku-4-5-20251001", // fast + cheap; bump to sonnet for tougher clients
      temperature: 0.6,
      messages: [{ role: "system", content: buildSystemPrompt(client) }],
      tools: toolsFor(client, publicBaseUrl, webhookSecret),
    },

    // ── The British human voice (per-client, e.g. a clone) ────
    voice: {
      provider: "11labs",
      voiceId: client.voiceId,
      model: "eleven_turbo_v2_5",
      stability: 0.45,
      similarityBoost: 0.8,
      style: 0.25,
      useSpeakerBoost: true,
    },

    // ── The ears ──────────────────────────────────────────────
    transcriber: { provider: "deepgram", model: "nova-2", language: "en-GB" },

    // ── Feel ──────────────────────────────────────────────────
    firstMessageMode: "assistant-speaks-first",
    firstMessage: timeGreeting,
    backgroundSound: "office",
    silenceTimeoutSeconds: 20,
    maxDurationSeconds: 600,

    // Server events land here. We pass the clientId so the webhook knows who
    // this call belongs to even before we map by number.
    server: { url: `${publicBaseUrl}/vapi/events`, secret: webhookSecret },
    serverMessages: ["end-of-call-report", "status-update", "hang"],
    metadata: { clientId: client.clientId },
  };
}
