// Server-side data queries for the dashboard. Every function takes an already
// created, request-scoped Supabase client. The dashboard passes the AUTHENTICATED
// anon client (lib/supabase/server.js): the logged-in user's session + the clean
// hardcoded anon key, read-limited by the `authed_read` RLS policies in the schema.
// We deliberately do NOT use the service-role client here — that key lives only in
// the hosting env (where it can be corrupted on paste) and bypassing RLS is
// unnecessary for a read-only, auth-gated page.

export async function getClients(supabase) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, slug, business_name, industry, status, subscriptions(amount_pence, currency, interval, status)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((c) => {
    const sub = (c.subscriptions || []).find((s) => s.status === "active");
    return {
      id: c.id,
      name: c.business_name,
      slug: c.slug,
      industry: c.industry,
      status: c.status,
      monthlyPence: sub && sub.interval === "month" ? sub.amount_pence : 0,
    };
  });
}

// Revenue / MRR summary from active monthly subscriptions.
export async function getRevenue(supabase) {
  const clients = await getClients(supabase);
  const mrrPence = clients.reduce((sum, c) => sum + (c.monthlyPence || 0), 0);
  const activeCount = clients.filter((c) => c.status === "active").length;
  return {
    mrrPence,
    annualPence: mrrPence * 12,
    activeCount,
    payingCount: clients.filter((c) => c.monthlyPence > 0).length,
  };
}

// Recent calls for the terminal log + KPIs.
export async function getCalls(supabase, limit = 30) {
  const { data, error } = await supabase
    .from("call_logs")
    .select("id, summary, outcome, duration_sec, cost_usd, ended_reason, created_at, clients(business_name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getCallStats(supabase) {
  const calls = await getCalls(supabase, 500);
  const total = calls.length;
  const booked = calls.filter((c) => c.outcome === "booked").length;
  const messages = calls.filter((c) => c.outcome === "message").length;
  const transferred = calls.filter((c) => c.outcome === "transferred").length;
  const conversion = total ? Math.round((booked / total) * 100) : 0;
  return { total, booked, messages, transferred, conversion };
}

// Tools + how many clients each is deployed for (the real "automation" panel).
export async function getTools(supabase) {
  const { data, error } = await supabase
    .from("tools")
    .select("id, slug, name, deployments(id, status)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    deploymentCount: (t.deployments || []).filter((d) => d.status === "active").length,
    live: (t.deployments || []).some((d) => d.status === "active"),
  }));
}

// One-off website builds — a separate revenue stream from the receptionist MRR.
// Returns empty gracefully if the table doesn't exist yet (before the migration
// is run) so the dashboard never 500s on a missing table.
export async function getWebProjects(supabase) {
  const { data, error } = await supabase
    .from("web_projects")
    .select("id, name, url, amount_pence, built_on")
    .order("built_on", { ascending: false });
  if (error) return { items: [], totalPence: 0, count: 0 };
  const items = data || [];
  const totalPence = items.reduce((sum, p) => sum + (p.amount_pence || 0), 0);
  return { items, totalPence, count: items.length };
}

export function poundsFromPence(pence) {
  return (pence / 100).toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
}
