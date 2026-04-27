import { supabase } from "@/lib/supabase";
import { getDictionary } from "@/lib/i18n";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [instrumentsRes, setupsRes, tagsRes, dict] = await Promise.all([
    supabase.from("Instrument").select("*").order("symbol"),
    supabase.from("Setup").select("*").order("name"),
    supabase.from("Tag").select("*").order("name"),
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
      />
    </div>
  );
}
