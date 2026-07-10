// Server-side data queries for the dashboard. Uses the service-role client
// (src/db.js) — only ever called from server components / server code.
import { db } from "../src/db.js";

export async function getClients() {
  const supabase = db();
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
export async function getRevenue() {
  const clients = await getClients();
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
export async function getCalls(limit = 30) {
  const supabase = db();
  const { data, error } = await supabase
    .from("call_logs")
    .select("id, summary, outcome, duration_sec, cost_usd, ended_reason, created_at, clients(business_name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getCallStats() {
  const calls = await getCalls(500);
  const total = calls.length;
  const booked = calls.filter((c) => c.outcome === "booked").length;
  const messages = calls.filter((c) => c.outcome === "message").length;
  const transferred = calls.filter((c) => c.outcome === "transferred").length;
  const conversion = total ? Math.round((booked / total) * 100) : 0;
  return { total, booked, messages, transferred, conversion };
}

// Tools + how many clients each is deployed for (the real "automation" panel).
export async function getTools() {
  const supabase = db();
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

export function poundsFromPence(pence) {
  return (pence / 100).toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
}
