"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/browser.js";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message.toUpperCase());
      setBusy(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  const field = {
    width: "100%",
    background: "rgba(0,0,0,.4)",
    border: "1px solid rgba(0,255,102,.3)",
    color: "var(--text-bright)",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    letterSpacing: 1,
    padding: "12px 14px",
    outline: "none",
    marginTop: 6,
  };

  return (
    <main className="tla-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="panel" style={{ width: 380, maxWidth: "100%", padding: 34 }}>
        <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span className="blink-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 4px rgba(0,255,102,.7)" }} />
          <span style={{ fontSize: 11, letterSpacing: 1, color: "#5fb98a" }}>SECURE_UPLINK</span>
        </div>
        <div style={{ fontSize: 18, letterSpacing: 4, color: "var(--text-bright)", fontWeight: 600 }}>
          TLA<span style={{ color: "var(--amber)", fontWeight: 500 }}>_HQ</span>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--amber)", marginTop: 8, marginBottom: 22 }}>
          // AUTH_LEVEL_OMEGA · ROOT ONLY
        </div>

        <form onSubmit={onSubmit}>
          <label style={{ fontSize: 10, letterSpacing: 2, color: "var(--text-dim)" }}>OPERATOR_ID</label>
          <input style={field} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@tlasystems.co.uk" required />
          <div style={{ height: 16 }} />
          <label style={{ fontSize: 10, letterSpacing: 2, color: "var(--text-dim)" }}>ACCESS_KEY</label>
          <input style={field} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />

          {error && (
            <div style={{ marginTop: 16, color: "var(--red)", fontSize: 11, letterSpacing: 1 }}>&gt; {error}</div>
          )}

          <button type="submit" disabled={busy} style={{
            marginTop: 24, width: "100%", padding: "13px", cursor: busy ? "wait" : "pointer",
            background: busy ? "transparent" : "rgba(0,255,102,.1)",
            border: "1px solid var(--green)", color: "#eafff1",
            fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: 2,
            boxShadow: "0 0 14px rgba(0,255,102,.15)",
          }}>
            {busy ? "> AUTHENTICATING..." : "> ESTABLISH UPLINK"}
          </button>
        </form>
      </div>
    </main>
  );
}
