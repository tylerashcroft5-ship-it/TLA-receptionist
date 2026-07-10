"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/browser.js";

const G = "#00ff66", A = "#ffb300", RED = "#ff5a5a";
const dim = "rgba(150,172,160,.6)";

function Corners() {
  return (<><span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" /></>);
}

// ── Cinematic boot overlay (pure eye-candy; real auth already happened) ──
function Boot({ onDone }) {
  const [stage, setStage] = useState(0);
  const [pct, setPct] = useState(0);
  const timers = useRef([]);
  useEffect(() => {
    [ [400,1],[1000,2],[1600,3],[2600,4],[3400,5] ].forEach(([ms, s]) =>
      timers.current.push(setTimeout(() => setStage(s), ms)));
    const iv = setInterval(() => setPct((p) => Math.min(100, p + 3)), 40);
    const done = setTimeout(onDone, 4200);
    timers.current.push(iv, done);
    return () => timers.current.forEach((t) => { clearTimeout(t); clearInterval(t); });
  }, [onDone]);

  return (
    <div onClick={onDone} style={{ position: "fixed", inset: 0, zIndex: 80, background: "#060706", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", cursor: "pointer" }}>
      <div style={{ position: "absolute", inset: 18, border: "1px solid rgba(0,255,102,.35)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(0,255,102,.5),transparent)", animation: "scanSweep 3.2s linear infinite" }} />

      <div style={{ position: "absolute", top: 34, left: 34, fontSize: 12, letterSpacing: 1, color: A }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span className="blink-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: A }} />SYS.STATUS
        </div>
        <div style={{ color: "rgba(150,172,160,.75)", lineHeight: 1.6, fontSize: 11 }}>
          UPLINK ....... {stage >= 3 ? "SYNC" : "LOCKED"}<br />NODE ......... ORBIT-7<br />CH ........... 14A
        </div>
      </div>
      <div style={{ position: "absolute", top: 34, right: 34, fontSize: 12, letterSpacing: 1, color: A, textAlign: "right" }}>
        AUTH.LEVEL
        <div style={{ color: "rgba(150,172,160,.75)", lineHeight: 1.6, fontSize: 11, marginTop: 6 }}>
          CLEARANCE .... OMEGA<br />DECRYPT ...... {pct}%<br />USER ......... ROOT
        </div>
      </div>

      {stage >= 1 && (
        <div style={{ position: "absolute", top: 130, left: 34, fontSize: 12, color: "#9aa89f", lineHeight: 1.9 }}>
          <div>&gt; ESTABLISHING SECURE UPLINK...</div>
          {stage >= 2 && <div>&gt; DECRYPTING CORE METRICS (RSA-4096)...</div>}
          {stage >= 3 && <div>&gt; SIGNAL STRENGTH: 98% [NOMINAL]</div>}
          {stage >= 4 && <div>&gt; ACCESSING HQ DATABASE [AUTH_LEVEL_OMEGA]</div>}
        </div>
      )}

      {stage >= 3 && (
        <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeUp .6s ease both" }}>
          <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", border: `1.5px solid ${G}`, boxShadow: "0 0 22px rgba(0,255,102,.35)" }} />
          <div style={{ position: "absolute", width: 80, height: 220, borderRadius: "50%", border: "1px solid rgba(0,255,102,.55)", left: 70 }} />
          <div style={{ position: "absolute", width: 220, height: 130, borderRadius: "50%", border: "1px solid rgba(0,255,102,.4)", top: 45 }} />
          <div style={{ position: "absolute", width: 1.5, height: 220, background: "rgba(0,255,102,.55)" }} />
          {stage >= 4 && (
            <div style={{ position: "absolute", padding: "12px 22px", border: `1px solid ${A}`, background: "rgba(6,7,6,.75)", color: A, fontWeight: 700, fontSize: 20, letterSpacing: 3, textShadow: "0 0 10px rgba(255,179,0,.6)", animation: "fadeUp .5s ease both" }}>UPLINK ESTABLISHED</div>
          )}
        </div>
      )}

      <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center", color: "#9aa89f", letterSpacing: 5, fontSize: 14, fontWeight: 500 }}>
        TLA SYSTEMS <span style={{ color: A, letterSpacing: 2, fontSize: 11 }}>// HQ UPLINK</span>
      </div>
      <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", color: "rgba(150,172,160,.35)", fontSize: 10, letterSpacing: 1 }}>CLICK TO SKIP</div>
    </div>
  );
}

export default function Dashboard({ data, operator }) {
  const router = useRouter();
  const [booted, setBooted] = useState(false);
  const [view, setView] = useState("overview");
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const pad = (n) => String(n).padStart(2, "0");
  const clock = now ? `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}` : "--:--:--";

  const nav = [
    { key: "tools", label: "AI AUTOMATION", index: "01" },
    { key: "metrics", label: "METRIC LOGS", index: "02" },
    { key: "clients", label: "CLIENT DATABASE", index: "03" },
    { key: "settings", label: "SYSTEM SETTINGS", index: "04" },
  ];
  const focus = (key) => {
    if (view === "overview") return { opacity: 1, border: "rgba(0,255,102,.3)", shadow: "none" };
    if (view === key) return { opacity: 1, border: G, shadow: "0 0 22px rgba(0,255,102,.25)" };
    return { opacity: 0.35, border: "rgba(0,255,102,.15)", shadow: "none" };
  };

  const statusColor = (s) => (s === "active" ? G : s === "paused" ? A : RED);
  const isSettings = view === "settings";

  return (
    <div className="tla-grid scanlines" style={{ position: "relative", minHeight: "100vh", overflowX: "hidden", color: "var(--text)" }}>
      {!booted && <Boot onDone={() => setBooted(true)} />}

      {/* TOP NAV */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 54, padding: "0 20px", borderBottom: "1px solid rgba(120,180,150,.22)", background: "rgba(9,11,10,.85)", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 220 }}>
          <span className="blink-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: G, boxShadow: "0 0 4px rgba(0,255,102,.7)" }} />
          <span style={{ fontSize: 11, letterSpacing: .5, color: "#5fb98a" }}>SYS_STATUS</span>
          <span style={{ fontSize: 11, letterSpacing: .5, color: "#c8d6ce", fontWeight: 600 }}>OPERATIONAL</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 18, height: 1, background: "rgba(120,180,150,.4)" }} />
          <div style={{ fontSize: 15, letterSpacing: 3, fontWeight: 600, color: "var(--text-bright)" }}>TLA_HQ<span style={{ color: A, fontWeight: 500 }}>_V2.0</span></div>
          <div style={{ width: 18, height: 1, background: "rgba(120,180,150,.4)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 220, justifyContent: "flex-end" }}>
          <div style={{ textAlign: "right", lineHeight: 1.25 }}>
            <div style={{ fontSize: 14, letterSpacing: 1.5, color: "var(--text-bright)" }}>{clock}<span style={{ color: "#7f948a", fontSize: 10, marginLeft: 4 }}>ZULU</span></div>
            <div style={{ fontSize: 9, letterSpacing: 1, color: "#6b7d73" }}>{operator}</div>
          </div>
          <button onClick={logout} style={{ background: "transparent", border: `1px solid ${RED}`, color: RED, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1, padding: "6px 10px", cursor: "pointer" }}>LOGOUT</button>
        </div>
      </div>

      {/* CLASSIFICATION BANNER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 22, padding: "0 20px", background: "rgba(255,179,0,.08)", borderBottom: "1px solid rgba(255,179,0,.28)", position: "relative", zIndex: 2, fontSize: 9.5, letterSpacing: 2, color: A, fontWeight: 600 }}>
        <span>// RESTRICTED · INTERNAL OPERATIONS</span>
        <span style={{ letterSpacing: 3 }}>AUTH_LEVEL_OMEGA</span>
        <span style={{ color: "rgba(255,179,0,.7)" }}>DISTRIBUTION: ROOT ONLY</span>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", alignItems: "stretch", position: "relative", zIndex: 1 }}>
        {/* SIDEBAR */}
        <div style={{ width: 230, flex: "none", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 10, borderRight: "1px solid rgba(0,255,102,.2)", minHeight: "calc(100vh - 76px)" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(150,172,160,.5)", margin: "2px 4px 8px" }}>OPERATIONS MENU</div>
          {nav.map((n) => {
            const active = view === n.key;
            return (
              <div key={n.key} onClick={() => setView((v) => (v === n.key && n.key !== "settings" ? "overview" : n.key))}
                style={{ cursor: "pointer", padding: 14, border: `1px solid ${active ? G : "rgba(0,255,102,.25)"}`, background: active ? "rgba(0,255,102,.08)" : "transparent", color: active ? "#eafff1" : "rgba(150,172,160,.8)", fontSize: 12.5, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", boxShadow: active ? "0 0 14px rgba(0,255,102,.15)" : "none", transition: "all .2s" }}>
                <span>{n.label}</span><span style={{ fontSize: 10, opacity: .6 }}>{n.index}</span>
              </div>
            );
          })}
          <div style={{ marginTop: "auto", padding: "12px 4px", fontSize: 10, color: "rgba(150,172,160,.4)", lineHeight: 1.8, letterSpacing: 1 }}>
            NODE: ORBIT-7<br />CH: 14A<br />AUTH: OMEGA
          </div>
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, padding: 22, minHeight: "calc(100vh - 76px)" }}>
          {isSettings ? (
            <div className="panel" style={{ padding: 20 }}>
              <Corners />
              <div style={{ fontSize: 12, letterSpacing: 2, color: G, marginBottom: 14 }}>SYSTEM_LOG</div>
              <div style={{ fontSize: 11.5, color: "rgba(150,172,160,.6)", lineHeight: 2 }}>
                &gt; OPERATOR {operator} · AUTH_LEVEL_OMEGA CONFIRMED<br />
                &gt; RECEPTIONIST WEBHOOK: LIVE · DB: CONNECTED<br />
                &gt; NO ANOMALIES DETECTED
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>

              {/* COL 1 — AI AUTOMATION (real tools) */}
              <div className="panel" style={{ padding: 18, opacity: focus("tools").opacity, borderColor: focus("tools").border, boxShadow: focus("tools").shadow, display: "flex", flexDirection: "column", gap: 14, transition: "all .35s", minWidth: 0 }}>
                <Corners />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, letterSpacing: 2, color: G }}>AI_AUTOMATION</div>
                  <div style={{ fontSize: 9.5, letterSpacing: 1, color: A, border: "1px solid rgba(255,179,0,.5)", padding: "2px 6px" }}>LIVE</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.tools.map((t) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid rgba(0,255,102,.12)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: 11.5, color: "rgba(216,226,220,.9)", letterSpacing: .5 }}>{t.name.toUpperCase().replace(/ /g, "_")}</span>
                        <span style={{ fontSize: 9.5, color: t.live ? G : A, letterSpacing: 1 }}>{t.live ? `ONLINE · ${t.deploymentCount} DEPLOYED` : "STANDBY"}</span>
                      </div>
                      <span style={{ width: 34, height: 16, border: `1px solid ${G}`, position: "relative", flex: "none", background: t.live ? "rgba(0,255,102,.15)" : "transparent" }}>
                        <span style={{ position: "absolute", top: 1, width: 12, height: 12, background: G, left: t.live ? 18 : 1 }} />
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(0,0,0,.4)", border: "1px solid rgba(0,255,102,.15)", padding: "8px 10px", fontSize: 10, color: G, lineHeight: 1.7, height: 130, overflow: "hidden" }}>
                  {data.calls.length === 0 && <div style={{ opacity: .85 }}>&gt; AWAITING FIRST CALL...</div>}
                  {data.calls.slice(0, 6).map((c) => (
                    <div key={c.id} style={{ opacity: .85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      &gt; {(c.outcome || c.ended_reason || "CALL").toUpperCase()} · {c.clients?.business_name || "?"}
                    </div>
                  ))}
                </div>
              </div>

              {/* COL 2 — METRIC LOGS (real revenue) */}
              <div className="panel" style={{ padding: 18, opacity: focus("metrics").opacity, borderColor: focus("metrics").border, boxShadow: focus("metrics").shadow, display: "flex", flexDirection: "column", gap: 14, transition: "all .35s", minWidth: 0 }}>
                <Corners />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, letterSpacing: 2, color: G }}>METRIC_LOGS</div>
                  <div style={{ fontSize: 9.5, letterSpacing: 1, color: A, border: "1px solid rgba(255,179,0,.5)", padding: "2px 6px" }}>MRR</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: dim, letterSpacing: 1 }}>MONTHLY RECURRING</div>
                  <div style={{ fontSize: 26, color: "#e2ece6", letterSpacing: 1 }}>{data.revenue.mrr}</div>
                  <div style={{ fontSize: 10, color: dim, letterSpacing: 1, marginTop: 2 }}>ANNUAL RUN-RATE {data.revenue.annual}</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { v: data.callStats.conversion + "%", l: "CONV", c: G },
                    { v: data.callStats.booked, l: "BOOKED", c: G },
                    { v: data.callStats.total, l: "CALLS", c: A },
                  ].map((k) => (
                    <div key={k.l} style={{ flex: 1, minWidth: 0, border: "1px solid rgba(0,255,102,.2)", padding: "10px 4px", textAlign: "center" }}>
                      <div style={{ fontSize: 16, color: k.c }}>{k.v}</div>
                      <div style={{ fontSize: 8.5, color: "rgba(150,172,160,.55)", letterSpacing: 1, marginTop: 3 }}>{k.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid rgba(0,255,102,.12)", paddingTop: 10, fontSize: 10.5, color: dim, lineHeight: 1.9 }}>
                  ACTIVE CLIENTS ...... {data.revenue.activeCount}<br />
                  PAYING ............. {data.revenue.payingCount}<br />
                  MESSAGES TAKEN ..... {data.callStats.messages}<br />
                  TRANSFERS ......... {data.callStats.transferred}
                </div>
              </div>

              {/* COL 3 — CLIENT DB (real clients) */}
              <div className="panel" style={{ padding: 18, opacity: focus("clients").opacity, borderColor: focus("clients").border, boxShadow: focus("clients").shadow, display: "flex", flexDirection: "column", gap: 12, transition: "all .35s", minWidth: 0 }}>
                <Corners />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, letterSpacing: 2, color: G }}>CLIENT_DB</div>
                  <div style={{ fontSize: 9.5, letterSpacing: 1, color: A, border: "1px solid rgba(255,179,0,.5)", padding: "2px 6px" }}>ENCRYPTED</div>
                </div>
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr .8fr", fontSize: 9, letterSpacing: 1, color: "rgba(150,172,160,.5)", paddingBottom: 6, borderBottom: "1px solid rgba(0,255,102,.2)" }}>
                    <span>CLIENT</span><span>STATUS</span><span style={{ textAlign: "right" }}>MRR</span>
                  </div>
                  {data.clients.map((c) => (
                    <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr .8fr", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(0,255,102,.08)", fontSize: 10.5 }}>
                      <span style={{ color: "rgba(216,226,220,.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, color: statusColor(c.status), fontSize: 9.5 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor(c.status) }} />{c.status.toUpperCase()}
                      </span>
                      <span style={{ textAlign: "right", color: "rgba(150,172,160,.75)" }}>{c.mrr}</span>
                    </div>
                  ))}
                  {data.clients.length === 0 && <div style={{ padding: "10px 0", fontSize: 10.5, color: dim }}>&gt; NO CLIENTS ON FILE</div>}
                </div>
                <div style={{ marginTop: "auto", overflow: "hidden", borderTop: "1px solid rgba(0,255,102,.15)", paddingTop: 8 }}>
                  <div style={{ whiteSpace: "nowrap", fontSize: 9.5, color: "rgba(255,179,0,.75)", letterSpacing: 1, animation: "marquee 16s linear infinite", display: "inline-block" }}>
                    OPS_STATUS: ALL SYSTEMS NOMINAL · RECEPTIONIST LIVE · {data.clients.length} CLIENTS TRACKED&nbsp;&nbsp;&nbsp;&nbsp;OPS_STATUS: ALL SYSTEMS NOMINAL · RECEPTIONIST LIVE · {data.clients.length} CLIENTS TRACKED&nbsp;&nbsp;&nbsp;&nbsp;
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
