// Tool handlers — the actual "actions" the receptionist can take.
// Vapi calls these over HTTP when Claude decides to use a tool. Each returns
// a short string result that Vapi speaks back through the assistant.
//
// These are deliberately simple/pluggable for the first build:
//   - book_appointment → log + (TODO) create a real Cal.com booking / send link
//   - take_message     → log + (TODO) email/SMS the owner
//   - transfer_call    → tell Vapi to forward to the client's human number
// Swap the TODOs for real integrations (Cal.com, Resend/SendGrid, Twilio SMS)
// once the call flow is verified end to end.

export async function bookAppointment(args, client) {
  const { caller_name, caller_phone, preferred_time, reason } = args;
  console.log("[book_appointment]", { caller_name, caller_phone, preferred_time, reason });

  // TODO: create real booking via client.bookingUrl provider (Cal.com API)
  //       and/or text the caller a confirmation link.

  return {
    result: `Booked ${caller_name} for ${preferred_time}. Confirmation will be sent to ${caller_phone}.`,
  };
}

export async function takeMessage(args, client) {
  const { caller_name, caller_phone, message, urgency = "normal" } = args;
  console.log("[take_message]", { caller_name, caller_phone, message, urgency });

  // TODO: email client.ownerEmail (Resend/SendGrid) and/or SMS on urgent.

  return {
    result: `Message taken from ${caller_name}${
      urgency === "urgent" ? " (marked urgent)" : ""
    }. The team will call back on ${caller_phone}.`,
  };
}

export async function transferCall(args, client) {
  const { reason } = args;
  console.log("[transfer_call]", { reason, to: client.transferNumber });

  // Returning a destination tells Vapi to forward the live call.
  return {
    result: `Transferring now.`,
    destination: {
      type: "number",
      number: client.transferNumber,
      message: "Just putting you through now, bear with me.",
    },
  };
}

export const TOOL_HANDLERS = {
  book_appointment: bookAppointment,
  take_message: takeMessage,
  transfer_call: transferCall,
};
