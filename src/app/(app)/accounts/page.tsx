import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/session";
import { getDictionary } from "@/lib/i18n";
import { AccountsView, type AccountStats } from "@/components/accounts/AccountsView";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const user = await requireUser();
  const [accountsRes, tradesRes, dict] = await Promise.all([
    supabase
      .from("FundedAccount")
      .select("*")
      .eq("userId", user.userId)
      .order("createdAt", { ascending: false }),
    supabase
      .from("Trade")
      .select("fundedAccountId, netPnl, status")
      .eq("userId", user.userId)
      .not("fundedAccountId", "is", null),
    getDictionary(),
  ]);

  // Aggregate P&L stats per account
  const statsMap: Record<string, AccountStats> = {};
  for (const t of tradesRes.data ?? []) {
    if (!t.fundedAccountId) continue;
    if (!statsMap[t.fundedAccountId]) {
      statsMap[t.fundedAccountId] = { totalPnl: 0, tradeCount: 0, wins: 0 };
    }
    if (t.status === "CLOSED" && t.netPnl != null) {
      statsMap[t.fundedAccountId].totalPnl += t.netPnl;
      statsMap[t.fundedAccountId].tradeCount++;
      if (t.netPnl > 0) statsMap[t.fundedAccountId].wins++;
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">{dict.settings.accounts.title}</h1>
        <p className="text-sm text-slate-500 font-mono mt-0.5">{dict.settings.accounts.subtitle}</p>
      </div>
      <AccountsView accounts={accountsRes.data ?? []} statsMap={statsMap} />
    </div>
  );
}
