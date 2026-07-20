import { supabase } from "@/lib/supabase";
import { getDictionary } from "@/lib/i18n";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { DEFAULT_INSTRUMENTS } from "@/lib/constants";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  // Seed any DEFAULT_INSTRUMENTS that don't exist yet
  const { data: existing } = await supabase.from("Instrument").select("symbol");
  if (existing) {
    const existingSymbols = new Set(existing.map((i) => i.symbol));
    const missing = DEFAULT_INSTRUMENTS.filter((d) => !existingSymbols.has(d.symbol));
    if (missing.length > 0) {
      await supabase.from("Instrument").insert(
        missing.map((d) => ({
          symbol: d.symbol,
          name: d.name,
          market: d.market,
          tickSize: d.tickSize,
          tickValue: d.tickValue,
          currency: "USD",
          exchange: "exchange" in d ? d.exchange : null,
          contractSize: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
      );
    }
  }

  const [instrumentsRes, setupsRes, tagsRes, accountsRes, dict] = await Promise.all([
    supabase.from("Instrument").select("*").order("symbol"),
    supabase.from("Setup").select("*").order("name"),
    supabase.from("Tag").select("*").order("name"),
    supabase.from("FundedAccount").select("*").eq("userId", user.userId).order("createdAt", { ascending: false }),
    getDictionary(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">{dict.settings.title}</h1>
        <p className="text-sm text-slate-500 font-mono mt-0.5">{dict.settings.subtitle}</p>
      </div>
      <SettingsTabs
        instruments={instrumentsRes.data ?? []}
        setups={setupsRes.data ?? []}
        tags={tagsRes.data ?? []}
        fundedAccounts={accountsRes.data ?? []}
      />
    </div>
  );
}
