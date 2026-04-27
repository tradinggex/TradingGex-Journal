import { supabase } from "@/lib/supabase";
import { getDictionary } from "@/lib/i18n";
import { TradeForm } from "@/components/trades/TradeForm";

export const dynamic = "force-dynamic";

export default async function NewTradePage() {
  const [instrumentsRes, setupsRes, tagsRes, dict] = await Promise.all([
    supabase.from("Instrument").select("*").eq("isActive", true).order("symbol"),
    supabase.from("Setup").select("*").eq("isActive", true).order("name"),
    supabase.from("Tag").select("*").order("name"),
    getDictionary(),
  ]);

  const instruments = instrumentsRes.data ?? [];
  const setups = setupsRes.data ?? [];
  const tags = tagsRes.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">{dict.topbar.newTrade}</h1>
        <p className="text-sm text-slate-500 font-mono mt-0.5">{dict.topbar.newTradeSub}</p>
      </div>
      <TradeForm instruments={instruments} setups={setups} tags={tags} />
    </div>
  );
}
