# TLA Receptionist

AI voice receptionist for TLA Systems' "AI Automation" pillar. Answers the
phone, sounds like a real British receptionist, and books calls / takes
messages / transfers to a human. Resold to UK trades & clinics on a monthly
retainer.

## How it fits together

```
 Caller ──dials──▶ Vapi phone number
                     │  (telephony + turn-taking orchestration)
                     ├─▶ Deepgram   → speech-to-text (en-GB)
                     ├─▶ Claude     → the brain (decides what to say/do)
                     ├─▶ ElevenLabs → the British human VOICE
                     └─▶ THIS SERVER (webhook):
                           /tools/*      → book / message / transfer
                           /vapi/events  → end-of-call report
```

Vapi does the heavy real-time lifting. This repo is **the brain's persona**
(`src/prompts/receptionist.js`), **the assistant config**
(`src/assistant-config.js`), and **the action handlers** (`src/tools/`).

## Cost model (why there's no big upfront bill)

- **Build & demo:** Vapi, ElevenLabs and Deepgram all have free trial credit.
  You can build and do test calls for ~£0.
- **Live client:** pay-per-minute (~£0.10–0.20/min all-in) + ~£1–2/mo for the
  number. A moderate client (150–400 min/mo) ≈ **£15–45/mo raw cost**, funded
  by their retainer (you're charging ~£250–300 → ~85–95% gross).
- **Claude brain:** billed on **api.anthropic.com**, a SEPARATE account from
  your Claude Code plan. Fractions of a penny per call.

## Setup

1. `npm install`
2. `cp .env.example .env` and fill in keys (all have free tiers to start).
3. **Pick the British voice** (this is the make-or-break — see below), put its
   id in `ELEVENLABS_VOICE_ID`.
4. Expose this server publicly for dev: `npx cloudflared tunnel --url http://localhost:3100`
   (or ngrok). Put that URL in `PUBLIC_BASE_URL`.
5. `npm start` (runs the webhook server).
6. `npm run provision` (creates the Vapi assistant from our config).
7. In the Vapi dashboard, attach a phone number to the assistant, then call it.
   Watch the server logs for tool calls and the end-of-call report.

## Picking the British voice (do this properly)

The whole product lives or dies on this. In the ElevenLabs voice library:

- Filter by **accent: British**, **use case: conversational**.
- Shortlist 3–4, generate the same greeting line on each, listen on a phone
  speaker (not laptop — it's a phone product).
- Prefer a voice with natural pace and warmth over a "polished newsreader" one.
- Once chosen, tune `stability` / `similarityBoost` / `style` in
  `src/assistant-config.js` via real test calls until it stops sounding "read".

Honest bar: with a good British voice this is *close to indistinguishable in
short exchanges*; a suspicious listener on a long call may still clock it. Sell
it as "answers like a real receptionist", not "literally undetectable".

## What's stubbed (next steps)

- `src/tools/handlers.js` — booking currently logs; wire real **Cal.com** booking
  + confirmation SMS. Messages log; wire **email (Resend)** + urgent **SMS (Twilio)**.
- `src/client.js` — single client from env; move to a DB keyed by dialled number
  for multi-client.
- `/vapi/events` — persist call summaries + feed the (future) admin dashboard.
