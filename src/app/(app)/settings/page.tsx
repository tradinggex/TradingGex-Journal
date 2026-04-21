import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [instruments, setups, tags, dict] = await Promise.all([
    prisma.instrument.findMany({ orderBy: { symbol: "asc" } }),
    prisma.setup.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    getDictionary(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">{dict.settings.title}</h1>
        <p className="text-sm text-slate-500 font-mono mt-0.5">{dict.settings.subtitle}</p>
      </div>
      <SettingsTabs instruments={instruments} setups={setups} tags={tags} />
    </div>
  );
}
