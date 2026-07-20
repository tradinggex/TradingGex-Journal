import { supabase } from "@/lib/supabase";
import { getDictionary } from "@/lib/i18n";
import { TradeForm } from "@/components/trades/TradeForm";
import { requireUser } from "@/lib/session";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function NewTradePage() {
  const user = await requireUser();
  const cookieStore = await cookies();
  const activeAccountId = cookieStore.get("activeAccount")?.value ?? null;

  const [instrumentsRes, setupsRes, tagsRes, accountsRes, dict] = await Promise.all([
    supabase.from("Instrument").select("*").eq("isActive", true).order("symbol"),
    supabase.from("Setup").select("*").eq("isActive", true).order("name"),
    supabase.from("Tag").select("*").order("name"),
    supabase.from("FundedAccount").select("id, firmName, accountType").eq("userId", user.userId).order("createdAt", { ascending: true }),
    getDictionary(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">{dict.topbar.newTrade}</h1>
        <p className="text-sm text-slate-500 font-mono mt-0.5">{dict.topbar.newTradeSub}</p>
      </div>
      <TradeForm
        instruments={instrumentsRes.data ?? []}
        setups={setupsRes.data ?? []}
        tags={tagsRes.data ?? []}
        accounts={accountsRes.data ?? []}
        defaultAccountId={activeAccountId}
      />
    </div>
  );
}
