// Dashboard home — server component. Middleware already guarantees an
// authenticated user here. Loads real data from Supabase and hands it to the
// tactical UI. Not statically cached — always reflects live data.
export const dynamic = "force-dynamic";

import { createClient } from "../lib/supabase/server.js";
import { getClients, getRevenue, getCalls, getCallStats, getTools, poundsFromPence } from "../lib/data.js";
import Dashboard from "./dashboard-client.js";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Read dashboard data through the same authenticated client (anon key + user
  // session). The `authed_read` RLS policies allow any logged-in user to select.
  const [clients, revenue, calls, callStats, tools] = await Promise.all([
    getClients(supabase), getRevenue(supabase), getCalls(supabase, 30),
    getCallStats(supabase), getTools(supabase),
  ]);

  const data = {
    clients: clients.map((c) => ({
      id: c.id, name: c.name, status: c.status,
      mrr: c.monthlyPence ? poundsFromPence(c.monthlyPence) : "—",
    })),
    revenue: {
      mrr: poundsFromPence(revenue.mrrPence),
      annual: poundsFromPence(revenue.annualPence),
      activeCount: revenue.activeCount,
      payingCount: revenue.payingCount,
    },
    calls,
    callStats,
    tools,
  };

  const operator = user?.email ? user.email.toUpperCase() : "ROOT";
  return <Dashboard data={data} operator={operator} />;
}
