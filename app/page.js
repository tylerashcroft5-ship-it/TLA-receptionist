// Placeholder home page. Tyler is designing the real dashboard UI in Claude
// Design — this just replaces the old "Cannot GET /" 404 with something that
// confirms the platform is alive while that design work happens.

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", letterSpacing: "0.05em" }}>TLA CONTROL ROOM</h1>
        <p style={{ opacity: 0.6, marginTop: "0.5rem" }}>Dashboard UI in progress. Webhooks are live at /api/*.</p>
      </div>
    </main>
  );
}
